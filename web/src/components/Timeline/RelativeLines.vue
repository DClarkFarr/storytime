<script lang="ts" setup>
import {
    MappedLineAction,
    MappedLinePoint,
    MappedLineStep,
} from "@/hooks/useTimeline";
import { getColors } from "@/methods/colors";
import { debounce } from "lodash-es";
import { ref, watch } from "vue";

type Coords = {
    x: number;
    y: number;
};

const props = defineProps<{
    container: HTMLDivElement | null;
    pointLines: MappedLineStep[];
}>();

const elementRef = ref<HTMLDivElement | null>(null);

const clearLines = () => {
    if (!elementRef.value) {
        return;
    }

    elementRef.value.innerHTML = "";
};

const drawLines = () => {
    clearLines();

    if (!props.container) {
        console.warn("No container element");
        return;
    }
    props.pointLines.forEach(({ stepIndex, points }) => {
        const stepElement = props.container?.querySelector(
            `.timeline__step[data-step="${stepIndex}"]`
        );
        if (!stepElement) {
            return console.warn("Could not find step element", stepIndex);
        }
        drawPointLines(stepElement as HTMLDivElement, points);
    });
};

const drawPointLines = (
    stepElement: HTMLDivElement,
    points: MappedLinePoint[]
) => {
    points.forEach(({ pointId, actions }) => {
        const pointElement = stepElement?.querySelector(
            `.step-point[data-point="${pointId}"]`
        );
        if (!pointElement) {
            return console.warn("Could not find point element", pointId);
        }
        const pointDetails = pointElement.querySelector(".step-point__details");
        const pointActions =
            (pointElement.querySelector(
                ".step-point__actions"
            ) as HTMLDivElement) || null;

        actions.forEach((action) => {
            drawActionLine(
                action,
                pointActions,
                pointDetails as HTMLDivElement
            );
        });
    });
};

const drawActionLine = (
    { actionIndex, toPointId }: MappedLineAction,
    actionsTarget: HTMLDivElement | null,
    fallbackTarget: HTMLDivElement
) => {
    const fromTarget = actionsTarget
        ? (actionsTarget.querySelector(
              `.step-point__action[data-action=${actionIndex}]`
          ) as HTMLDivElement)
        : fallbackTarget;
    const toTarget = props.container?.querySelector(
        `.step-point[data-point="${toPointId}"]`
    );

    const fromCoords = getElementCoords(fromTarget);
    const toCoords = getElementCoords(toTarget as HTMLDivElement);

    const { degree, slope } = calcSlope(
        fromCoords.pointRight,
        toCoords.pointLeft
    );
    const width = calcDistance(fromCoords.pointRight, toCoords.pointLeft);

    console.log(
        "degree",
        degree,
        "width",
        toCoords.pointLeft.x - fromCoords.pointRight.x,
        "calc distance",
        width,
        "from",
        fromCoords.pointRight,
        "to",
        toCoords.pointLeft,
        "slope",
        slope
    );

    const line = document.createElement("div");
    line.classList.add("line");

    line.style.setProperty("--start-x", fromCoords.pointRight.x + "px");
    line.style.setProperty("--start-y", fromCoords.pointRight.y + "px");
    line.style.setProperty("--end-x", toCoords.pointLeft.x + "px");
    line.style.setProperty("--end-y", toCoords.pointLeft.y + "px");
    line.style.setProperty("--width", `${width}px`);
    line.style.setProperty("--rotate", `${degree}deg`);

    const startBubble = document.createElement("div");
    startBubble.classList.add("line__bubble");
    startBubble.classList.add("line__bubble--start");

    const endBubble = document.createElement("div");
    endBubble.classList.add("line__bubble");
    endBubble.classList.add("line__bubble--end");

    const lineLine = document.createElement("div");
    lineLine.classList.add("line__line");

    line.appendChild(startBubble);
    line.appendChild(lineLine);
    line.appendChild(endBubble);

    elementRef.value?.appendChild(line);
};

const debounceDrawLines = debounce(drawLines, 400);

const getElementCoords = (element: HTMLDivElement) => {
    const containerRect = (
        props.container as HTMLDivElement
    ).getBoundingClientRect();

    const rect = element.getBoundingClientRect();
    const pointLeft = {
        y: rect.top - containerRect.top + rect.height / 2,
        x: rect.left + 5,
    };
    const pointRight = {
        y: rect.top - containerRect.top + rect.height / 2,
        x: rect.right - 5,
    };

    return {
        rect,
        pointLeft,
        pointRight,
    };
};

const calcSlope = (startCoords: Coords, endCoords: Coords) => {
    const slope = (endCoords.y - startCoords.y) / (endCoords.x - startCoords.x);
    const degree =
        (Math.atan2(endCoords.y - startCoords.y, endCoords.x - startCoords.x) *
            180) /
        Math.PI;
    return { slope, degree };
};

const calcDistance = (startCoords: Coords, endCoords: Coords) => {
    // d=√((x2 – x1)² + (y2 – y1)²)

    const a = endCoords.x - startCoords.x;
    const b = endCoords.y - startCoords.y;

    return Math.sqrt(a * a + b * b);
};

watch(
    [() => props.pointLines],
    () => {
        debounceDrawLines();
    },
    {
        immediate: true,
    }
);
</script>

<template>
    <div class="lines-target" ref="elementRef"></div>
</template>

<style lang="scss">
.line {
    position: absolute;
    background: red;
    height: 2px;
    width: var(--width);
    top: var(--start-y);
    left: var(--start-x);
    pointer-events: none;
    transform-origin: 0 0;
    transform: rotate(var(--rotate));

    &__bubble {
        height: 10px;
        width: 10px;
        border-radius: 100px;
        background: inherit;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);

        &--start {
            left: 0;
        }

        &--end {
            right: 0;
        }
    }
    &__line {
        height: 100%;
        width: 100%;
        background: inherit;
    }
}
</style>