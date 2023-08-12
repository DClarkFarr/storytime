import httpClient from "@/services/httpClient";
import { Point, StoryWithScenes } from "@/types/Story";
import { AxiosResponse } from "axios";
import { Ref, computed, ref } from "vue";
import { useResizeObserver } from "@vueuse/core";
import usePaginate from "./usePaginate";

export type UseTimelineProps = {
    timelineRef: Ref<HTMLElement | null>;
    story: StoryWithScenes;
};

export type CreatePointData = Pick<Point, "row" | "col">;

const useTimeline = ({ timelineRef, story }: UseTimelineProps) => {
    const VALUES = {
        stepWidth: 150,
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
        return Math.max(1, ...points.value.map((p) => p.row));
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

    const pointsByStep = computed(() => {
        return points.value.reduce((acc, p) => {
            if (!acc[p.row]) {
                acc[p.row] = [];
            }

            acc[p.row].push(p);

            return acc;
        }, {} as Record<number, Point[]>);
    });

    return {
        numSteps,
        numStepPoints,
        stepsPerPage,
        points,
        page,
        paginate,
        pointsByStep,
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
    };
};

export default useTimeline;
