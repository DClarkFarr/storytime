import httpClient from "@/services/httpClient";
import {
    Point,
    PointAction,
    PointWithScene,
    StoryWithScenes,
} from "@/types/Story";
import { AxiosResponse } from "axios";
import { Ref, computed, ref } from "vue";
import { useResizeObserver } from "@vueuse/core";
import usePaginate from "./usePaginate";

export type UseTimelineProps = {
    timelineRef: Ref<HTMLElement | null>;
    story: StoryWithScenes;
    stepWidth?: number;
};

export type UpdatePointData = {
    sceneId?: string | null;
    row?: number;
    col?: number;
    actions?: PointAction[];
};

export type MappedLineAction = {
    actionIndex: number;
    toPointId: string;
};
export type MappedLinePoint = {
    pointId: string;
    actions: MappedLineAction[];
};
export type MappedLineStep = {
    stepIndex: number;
    points: MappedLinePoint[];
};

export type CreatePointData = Pick<Point, "row" | "col">;

const useTimeline = ({ timelineRef, story, stepWidth }: UseTimelineProps) => {
    const VALUES = {
        stepWidth: stepWidth || 150,
        gapX: 8,
    };

    const numSteps = ref(4);
    const numStepPoints = ref(3);
    const stepsPerPage = ref(0);
    const page = ref(1);
    const points = ref<Point[]>([]);

    const paginate = usePaginate({
        page,
        perPage: stepsPerPage,
        items: numSteps,
        staticItems: 1,
    });

    const setPage = (p: number) => {
        page.value = p;
    };

    const setPoints = (ps: Point[]) => {
        points.value = ps;
    };

    const setNumSteps = (s: number) => {
        numSteps.value = s;
    };

    const setNumStepPoints = (h: number) => {
        numStepPoints.value = h;
    };

    const setStepsPerPage = (s: number) => {
        stepsPerPage.value = s;
    };

    const createPoint = async (point: CreatePointData) => {
        const p = await httpClient
            .post<any, AxiosResponse<{ row: Point }>>(
                `/story/${story.id}/point`,
                point
            )
            .then(({ data }) => data.row);

        setPoints([...points.value, p]);

        return p;
    };

    const updatePoint = async (id: string, data: UpdatePointData) => {
        const p = await httpClient
            .put<any, AxiosResponse<{ row: Point }>>(
                `/story/${story.id}/point/${id}`,
                data
            )
            .then(({ data }) => data.row);

        const index = points.value.findIndex((p) => p.id === id);

        points.value.splice(index, 1, p);

        setNumStepPoints(numSalculateStepPoints());
    };

    const deletePoint = async (id: string) => {
        await httpClient.delete(`/story/${story.id}/point/${id}`);

        const index = points.value.findIndex((p) => p.id === id);

        points.value.splice(index, 1);

        setNumStepPoints(numSalculateStepPoints());
    };

    const addInitialPoint = async () => {
        await createPoint({
            row: 0,
            col: 0,
        });
    };

    const maybeDoInitialData = async () => {
        if (!points.value.length) {
            await addInitialPoint();
        }
    };

    const init = async () => {
        await loadPoints();
        setResizeListener();
        await maybeDoInitialData();
    };

    const loadPoints = async () => {
        const ps = await httpClient
            .get<any, AxiosResponse<{ rows: Point[] }>>(
                `/story/${story.id}/point`
            )
            .then(({ data }) => data.rows);

        setPoints(ps);
        setNumSteps(calculateNumSteps());
        setNumStepPoints(numSalculateStepPoints());
    };

    const setResizeListener = () => {
        useResizeObserver(timelineRef, (entries) => {
            const entry = entries[0];
            const { width } = entry.contentRect;

            const newPerPage = calculateStepsPerPage(width);
            const prevOffset = paginate.offset.value;

            if (newPerPage != stepsPerPage.value) {
                setStepsPerPage(newPerPage);

                setPage(Math.max(1, Math.ceil(prevOffset / newPerPage)));
            }
        });
    };

    const getPointsByStep = (step: number) => {
        return points.value.filter((p) => p.row === step);
    };

    const numSalculateStepPoints = () => {
        const others = new Array(numSteps.value || 4).fill(1).map((_, i) => {
            return getPointsByStep(i)?.length || 0;
        });
        return Math.max(4, ...others);
    };

    const calculateNumSteps = () => {
        const val = Math.max(1, ...points.value.map((p) => p.row + 1));
        return val;
    };

    const calculateStepsPerPage = (containerWidth: number) => {
        const { stepWidth, gapX } = VALUES;
        const perPage = Math.floor(
            (containerWidth - gapX) / (stepWidth + gapX)
        );

        return perPage;
    };

    const addStep = () => {
        setNumSteps(numSteps.value + 1);
    };

    const prevPage = () => {
        setPage(page.value - 1);
    };

    const nextPage = () => {
        setPage(page.value + 1);
    };

    const addPointAction = async (pointId: string) => {
        const found = points.value.find((p) => p.id === pointId);
        if (!found) {
            throw new Error("Point not found");
        }

        try {
            const action = await httpClient
                .post<any, AxiosResponse<{ row: PointAction }>>(
                    `/story/${story.id}/point/${pointId}/action`
                )
                .then(({ data }) => data.row);

            const index = points.value.findIndex((p) => p.id === pointId);
            found.actions.push(action);

            points.value.splice(index, 1, found);
        } catch (err) {
            console.error(err);
        }
    };

    const getNextColByRow = (row: number, minCol: number = 0) => {
        const rowPoints = getPointsByStep(row);

        let col = minCol;
        while (rowPoints.find((p) => p.col === col)) {
            col = col + 1;
        }

        return col;
    };

    const createPointAndAttachToAction = async (
        point: PointWithScene,
        actionIndex: number
    ) => {
        const needsNewStep = point.row + 1 > numSteps.value - 1;
        console.log("needs new stopm, from", point.row, "vs", numSteps.value);

        if (needsNewStep) {
            console.log("adding step");
            addStep();
        }

        const newPoint = await createPoint({
            row: point.row + 1,
            col: getNextColByRow(point.row + 1, point.col),
        });

        point.actions[actionIndex].toPointId = newPoint.id;

        await updatePoint(point.id, {
            actions: point.actions,
        });
    };

    const pointsByStep = computed(() => {
        return points.value.reduce((acc, p) => {
            if (!acc[p.row]) {
                acc[p.row] = [];
            }

            acc[p.row].push({
                ...p,
                scene: story.scenes.find((s) => s.id === p.sceneId) || null,
            } as PointWithScene);

            return acc;
        }, {} as Record<number, PointWithScene[]>);
    });

    const pointsGrid = computed(() => {
        const grid = new Array(numSteps.value).fill(1).map((_, i) => {
            return new Array(numStepPoints.value).fill(1).map((_, j) => {
                return pointsByStep.value[i]?.find((p) => p.col === j) || null;
            });
        });

        return grid;
    });

    const visibleItemIndexes = computed(() => {
        return paginate.visibleItemIndexes.value;
    });

    const piontLinesMap = computed(() => {
        console.log("computing visibile lines map", visibleItemIndexes.value);

        const map: MappedLineStep[] = [];

        visibleItemIndexes.value.forEach((stepIndex) => {
            const stepPoints = pointsByStep.value[stepIndex];
            if (!stepPoints) {
                return;
            }

            const stepObj: MappedLineStep = {
                stepIndex,
                points: [],
            };

            stepPoints.forEach((point) => {
                const pointObj: MappedLinePoint = {
                    pointId: point.id,
                    actions: [],
                };
                point.actions.forEach((action, i) => {
                    if (!action.toPointId) {
                        return;
                    }

                    pointObj.actions.push({
                        actionIndex: i,
                        toPointId: action.toPointId,
                    });
                });

                if (pointObj.actions.length) {
                    stepObj.points.push(pointObj);
                }
            });
            if (stepObj.points.length) {
                map.push(stepObj);
            }
        });

        return map;
    });

    return {
        numSteps,
        numStepPoints,
        stepsPerPage,
        points,
        page,
        paginate,
        pointsByStep,
        pointsGrid,
        visibleItemIndexes,
        piontLinesMap,
        prevPage,
        nextPage,
        setPoints,
        init,
        loadPoints,
        setNumSteps,
        setNumStepPoints,
        setStepsPerPage,
        getPointsByStep,
        setPage,
        addStep,
        createPoint,
        updatePoint,
        deletePoint,
        addPointAction,
        createPointAndAttachToAction,
    };
};

export default useTimeline;
