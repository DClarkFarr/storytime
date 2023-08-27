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
    threadId: number;
};
export type MappedLinePoint = {
    pointId: string;
    expanded: boolean;
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

    const pointsExpandedIds = ref<string[]>([]);

    const paginate = usePaginate({
        page,
        perPage: stepsPerPage,
        items: numSteps,
        staticItems: 1,
    });

    const setPointExpanded = (id: string, expanded: boolean) => {
        const index = pointsExpandedIds.value.findIndex((i) => i === id);
        if (expanded && index === -1) {
            pointsExpandedIds.value.push(id);
        } else if (!expanded && index > -1) {
            pointsExpandedIds.value.splice(index, 1);
        }
    };

    const isPointExpanded = (id: string) => {
        return pointsExpandedIds.value.findIndex((i) => i === id) > -1;
    };

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

        if (needsNewStep) {
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

    const getFuturePoints = (point: Point) => {
        const futurePoints = points.value
            .filter((p) => {
                return p.row > point.row;
            })
            .map((p) => {
                return {
                    ...p,
                    scene: story.scenes.find((s) => s.id === p.sceneId) || null,
                } as PointWithScene;
            });

        futurePoints.sort((a, b) => {
            if (a.row === b.row) {
                return a.col - b.col;
            }
            return a.row - b.row;
        });

        return futurePoints;
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

    const applyPointLineMapThreads = (map: MappedLineStep[]) => {
        // point A -> point B -> action index
        const pointToPoint: Record<string, string[]> = {};

        let threadInc = 0;

        const mappedLinePointsKeyed = map.reduce((acc, stepMap) => {
            stepMap.points.forEach((pointLine) => {
                acc[pointLine.pointId] = pointLine;
            });

            return acc;
        }, {} as { [K: string]: MappedLinePoint });

        const followPointPath = (
            point: MappedLinePoint,
            fromAction?: MappedLineAction
        ) => {
            let pointActionFound = false;

            point.actions.forEach((action) => {
                if (!action.toPointId || action.threadId) {
                    // no next ID. No line.
                    // already been used, so stop!
                    // console.log("no point id - abort");
                    return false;
                }

                if (!pointToPoint[point.pointId]) {
                    pointToPoint[point.pointId] = [];
                }

                if (pointToPoint[point.pointId].includes(action.toPointId)) {
                    // point A -> point B has already happened
                    // console.log(
                    //     "point to point already mapped - abort",
                    //     point,
                    //     "to",
                    //     action
                    // );
                    return;
                }

                const nextPoint = mappedLinePointsKeyed[action.toPointId];
                if (!nextPoint) {
                    // console.log("no next point!", action);
                    return;
                }

                pointToPoint[point.pointId].push(action.toPointId);

                if (fromAction) {
                    /**
                     * already on a thread, so try to follow
                     */
                    if (pointActionFound) {
                        action.threadId = threadInc++;
                        // console.log(
                        //     "existing thread, new branch",
                        //     action.threadId
                        // );
                        followPointPath(nextPoint, action);
                    } else {
                        // console.log(
                        //     "existing thread, same path",
                        //     fromAction.threadId
                        // );
                        pointActionFound = true;
                        action.threadId = fromAction.threadId;
                        followPointPath(nextPoint, action);
                    }
                } else {
                    /**
                     * start a new thread
                     */
                    // console.log("new thread!");
                    action.threadId = threadInc++;
                    followPointPath(nextPoint, action);
                }
            });
        };

        const followStepPoints = (step: MappedLineStep) => {
            step.points.forEach((point) => {
                if (pointToPoint[point.pointId]) {
                    // pointhas already been used. It isn't a starting point
                    return;
                }

                followPointPath(point);
            });
        };

        map.forEach(followStepPoints);
    };

    const pointToLinePoint = (point: Point): MappedLinePoint => {
        const pointObj: MappedLinePoint = {
            pointId: point.id,
            actions: [],
            expanded: isPointExpanded(point.id),
        };
        point.actions.forEach((action, i) => {
            if (!action.toPointId) {
                return;
            }

            pointObj.actions.push({
                actionIndex: i,
                toPointId: action.toPointId,
                threadId: 0,
            });
        });

        return pointObj;
    };

    const pointLinesMap = computed(() => {
        const map: MappedLineStep[] = [];

        for (let stepIndex = 0; stepIndex < numSteps.value; stepIndex++) {
            const stepPoints = pointsByStep.value[stepIndex];
            if (!stepPoints) {
                continue;
            }

            const stepObj: MappedLineStep = {
                stepIndex,
                points: [],
            };

            stepPoints.forEach((point) => {
                const pointObj = pointToLinePoint(point);

                stepObj.points.push(pointObj);
            });

            map.push(stepObj);
        }

        applyPointLineMapThreads(map);

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
        pointLinesMap,
        pointsExpandedIds,
        setPointExpanded,
        isPointExpanded,
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
        getFuturePoints,
    };
};

export default useTimeline;
