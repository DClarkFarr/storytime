<script lang="ts" setup>
import {
    CanvasElement,
    CanvasElementTypes,
    CanvasTextElement,
    FabricTextElement,
    CanvasShapeTypes,
    CanvasShapeElement,
} from "@/types/Canvas";
import { computed, onMounted, ref } from "vue";
import { createTextElement, createShapeElement } from "@/methods/canvas";
import { fabric } from "fabric";
import { debounce } from "lodash-es";

fabric.Object.prototype.transparentCorners = false;

import Dropdown from "./controls/Dropdown.vue";
import PlusIcon from "~icons/fa6-solid/plus";

import { useResizeObserver } from "@vueuse/core";

const emit = defineEmits<{
    (e: "update:elements", val: CanvasElement[]): void;
}>();

const props = withDefaults(
    defineProps<{
        width?: number;
        elements?: CanvasElement[];
    }>(),
    {
        width: 600,
        elements: () => [],
    }
);

const canvasRef = ref<HTMLCanvasElement | null>(null);

const canvasContainerRef = ref<HTMLDivElement | null>(null);

const canvas = ref<fabric.Canvas | null>(null);

const canvasElements = ref<any[]>([]);

const computedStyles = computed(() => {
    return {
        "max-width": `${props.width}px`,
    };
});

const elements = computed({
    get: () => props.elements,
    set: (val) => {
        console.log("emitting val", val);
        emit("update:elements", val);
    },
});

const onAddLayer = (type: CanvasElementTypes, alt?: string) => {
    if (type === "text") {
        const element = createTextElement();

        element.index = elements.value.length;

        elements.value.push(element);

        addElementToCanvas(element);
    } else if (type === "shape" && alt) {
        const element = createShapeElement(alt as CanvasShapeTypes);

        element.index = elements.value.length;

        elements.value.push(element);

        addElementToCanvas(element);
    }
};

const setCanvasListeners = () => {
    const updateControls = (e: fabric.IEvent<MouseEvent>) => {
        console.log("canvas event", e);
    };

    canvas.value?.on("object:moving", updateControls);
    canvas.value?.on("object:scaling", updateControls);
    canvas.value?.on("object:resizing", updateControls);
    canvas.value?.on("object:rotating", updateControls);
    canvas.value?.on("object:skewing", updateControls);
};
const addElementsToCanvas = () => {
    elements.value.forEach((element) => {
        addElementToCanvas(element);
    });

    setCanvasListeners();
};

const addElementToCanvas = (data: CanvasElement) => {
    if (data.type === "text") {
        addTextElementToCanvas(data);
    } else if (data.type === "shape") {
        addShapeElementToCanvas(data);
    }
};

const addShapeElementToCanvas = (data: CanvasShapeElement) => {
    const canvasElement = createShapeCanvasElement(data);

    console.log("canvas element", canvasElement);
    canvas.value?.add(canvasElement);
    canvasElements.value.push(canvasElement);
};

const createShapeCanvasElement = (data: CanvasShapeElement): fabric.Object => {
    const obj = new fabric.Rect({
        top: data.position.y,
        left: data.position.x,
        angle: data.position.rotation,
        width: data.position.width,
        height: data.position.height,
        fill: data.shape.fill,
        stroke: data.shape.stroke,
        strokeWidth: data.shape.strokeWidth,
        backgroundColor: data.shape.background,
        opacity: data.opacity,
        // selectable: data.selectable,
        // evented: data.selectable,
        // hasControls: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
    });

    return Object.assign(obj, { uuid: data.id });
};

const addTextElementToCanvas = (data: CanvasTextElement) => {
    const canvasElement = createTextCanvasElement(data);

    canvas.value?.add(canvasElement);
    canvasElements.value.push(canvasElement);
};

const createTextCanvasElement = (
    data: CanvasTextElement
): FabricTextElement => {
    const obj = new fabric.Text(data.value, {
        top: data.position.y,
        left: data.position.x,
        angle: data.position.rotation,
        width: data.position.width,
        height: data.position.height,
        fontSize: data.font.size,
        fontWeight: data.font.weight,
        fontFamily: data.font.family,
        fill: data.font.color,
        opacity: data.opacity,
        selectable: data.selectable,
        evented: data.selectable,
        hasControls: true,
    });

    return Object.assign(obj, { uuid: data.id });
};

const resizeCanvas = (width: number) => {
    const ratio = 16 / 9;
    const scale = width / (canvas.value?.getWidth() || width);
    const zoom = (canvas.value?.getZoom() || 1) * scale;

    canvas.value?.setDimensions({ width, height: width / ratio });
    canvas.value?.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
};

const resizeCanvasDebounced = debounce(resizeCanvas, 100);

useResizeObserver(canvasContainerRef, (entries) => {
    const entry = entries[0];
    const { width: containerWidth } = entry.contentRect;

    console.log("new width", containerWidth);
    resizeCanvasDebounced(containerWidth);
});

onMounted(() => {
    canvas.value = new fabric.Canvas(canvasRef.value);

    addElementsToCanvas();

    const canvasContainerWidth = canvasContainerRef.value?.clientWidth;
    if (canvasContainerWidth) {
        resizeCanvas(canvasContainerWidth);
    }
});
</script>

<template>
    <div class="canvas flex items-stretch">
        <div
            class="canvas_sidebar shrink w-[250px] bg-gray-100 border border-slate-300 p-4"
        >
            <h3 class="text-lg font-semibold mb-4">Layers</h3>
            <div class="canvas__add">
                <Dropdown>
                    <template #default="{ close }">
                        <button
                            class="dropdown__item"
                            @click="
                                close();
                                onAddLayer('text');
                            "
                        >
                            <PlusIcon class="inline-block text-xs" /> Text
                        </button>
                        <button
                            class="dropdown__item"
                            @click="
                                close();
                                onAddLayer('draw');
                            "
                        >
                            <PlusIcon class="inline-block text-xs" /> Drawing
                        </button>
                        <button
                            class="dropdown__item"
                            @click="
                                close();
                                onAddLayer('image');
                            "
                        >
                            <PlusIcon class="inline-block text-xs" /> Image
                        </button>
                        <button
                            class="dropdown__item"
                            @click="
                                close();
                                onAddLayer('shape', 'square');
                            "
                        >
                            <PlusIcon class="inline-block text-xs" />
                            Shape:Square
                        </button>
                    </template>
                </Dropdown>
            </div>
        </div>
        <div
            class="canvas__container grow w-full checkered"
            :style="computedStyles"
            ref="canvasContainerRef"
        >
            <canvas ref="canvasRef" class="canvas__canvas"></canvas>
        </div>
    </div>
</template>

<style lang="scss">
.canvas {
    &__container {
        aspect-ratio: 16 / 9;
        min-width: 400px;

        canvas {
            height: 100%;
            width: 100%;
        }
    }
}
</style>
