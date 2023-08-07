<script lang="ts" setup>
import {
    CanvasElement,
    CanvasElementTypes,
    CanvasShapeTypes,
} from "@/types/Canvas";
import { computed, onMounted, ref, watch } from "vue";
import {
    createTextElement,
    createShapeElement,
    syncCanvasElementToElement,
} from "@/methods/canvas";

import Dropdown from "./controls/Dropdown.vue";
import PlusIcon from "~icons/fa6-solid/plus";
import { useCanvasModule } from "@/hooks/useCanvasModule";
import { keyBy } from "lodash-es";

import ElementItem from "./Canvas/ElementItem.vue";

const emit = defineEmits<{
    (e: "update:elements", val: CanvasElement[]): void;
}>();

const props = withDefaults(
    defineProps<{
        width?: number;
        elements?: CanvasElement[];
    }>(),
    {
        width: undefined,
        elements: () => [],
    }
);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainerRef = ref<HTMLDivElement | null>(null);

const computedStyles = computed(() => {
    return {
        "max-width": props.width ? `${props.width}px` : "100%",
    };
});

// const elements = computed({
//     get: () => props.elements,
//     set: (val) => {
//         emit("update:elements", val);
//     },
// });

const elements = computed(() => props.elements);

const elementThumbnails = ref<Record<string, string | undefined>>({});

const onAddLayer = (type: CanvasElementTypes, alt?: string) => {
    let element: CanvasElement;
    if (type === "text") {
        element = createTextElement();
    } else if (type === "shape" && alt) {
        element = createShapeElement(alt as CanvasShapeTypes);
    } else {
        throw new Error("Unknown layer type: " + type);
    }

    element.index = elements.value.length;
    elements.value.push(element);

    addElementToCanvas(element);

    emit("update:elements", elements.value);
};

const computeElementThumbnails = () => {
    const canvas = getCanvas();
    if (!canvas) return [];

    elementThumbnails.value = elements.value.reduce((acc, element) => {
        acc[element.id] = findElementById(element.id)?.toDataURL({
            format: "png",
        });
        return acc;
    }, {} as Record<string, string | undefined>);
};

const elementsById = computed(() => {
    return keyBy(elements.value, "id");
});

watch(
    elements,
    () => {
        computeElementThumbnails();
    },
    {
        deep: true,
    }
);

const {
    getCanvas,
    initialize,
    addElementsToCanvas,
    addElementToCanvas,
    findElementById,
    selectedUUIDs,
} = useCanvasModule({
    onChangeCanvasElement: (canvasElement) => {
        syncCanvasElementToElement(
            canvasElement,
            elementsById.value[canvasElement.uuid]
        );

        emit("update:elements", elements.value);
    },
});

const editItemId = computed(() => {
    if (selectedUUIDs.value.length === 1) {
        return selectedUUIDs.value[0];
    }

    return null;
});

onMounted(() => {
    if (canvasRef.value && canvasContainerRef.value) {
        initialize(canvasRef.value, canvasContainerRef.value);

        addElementsToCanvas(elements.value);
    } else {
        console.warn("Canvas refs not set");
    }
});
</script>

<template>
    <div class="canvas flex items-stretch">
        <div
            class="canvas_sidebar shrink w-[250px] bg-gray-100 border border-slate-300 p-4"
        >
            <h3 class="text-lg font-semibold mb-4">Layers</h3>
            <div class="canvas__add mb-4">
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
            <div class="canvas__elements">
                <ElementItem
                    v-for="element in elements"
                    :edit="editItemId === element.id"
                    :element="element"
                    :selected="selectedUUIDs.includes(element.id)"
                    :thumbnail="elementThumbnails[element.id]"
                    :key="element.id"
                />
            </div>
        </div>
        <div
            class="canvas__container grow w-full checkered"
            :style="computedStyles"
            ref="canvasContainerRef"
        >
            <canvas
                ref="canvasRef"
                class="canvas__canvas"
                width="width"
            ></canvas>
        </div>
    </div>
</template>

<style lang="scss">
.canvas {
    &__container {
        aspect-ratio: 16 / 9;
        min-width: 400px;
        max-width: 100%;

        canvas {
            aspect-ratio: 16 / 9;
        }
    }
}
</style>
