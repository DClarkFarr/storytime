<script lang="ts" setup>
import { fabric } from "fabric";
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
    syncElementToCanvasElement,
} from "@/methods/canvas";

import Dropdown from "./controls/Dropdown.vue";
import PlusIcon from "~icons/fa6-solid/plus";
import { useCanvasModule } from "@/hooks/useCanvasModule";
import { keyBy } from "lodash-es";

import ElementItem from "./Canvas/ElementItem.vue";

import { VueDraggableNext as Draggable } from "vue-draggable-next";
import { createImageElement } from "@/methods/canvas";
import ElementForm from "./Canvas/ElementForm.vue";

const emit = defineEmits<{
    (e: "save", val: { elements: CanvasElement[]; imageData?: string }): void;
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

const elements = ref<CanvasElement[]>(props.elements);
watch(
    () => props.elements,
    (val) => {
        elements.value = val;
    }
);

const onSaveCanvas = () => {
    emit("save", {
        elements: elements.value,
        imageData: getCanvas()?.toDataURL({
            format: "jpg",
            quality: 0.8,
        }),
    });
};

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainerRef = ref<HTMLDivElement | null>(null);

const computedStyles = computed(() => {
    return {
        "max-width": props.width ? `${props.width}px` : "100%",
    };
});

const elementThumbnails = ref<Record<string, string | undefined>>({});

const onAddLayer = async (type: CanvasElementTypes, alt?: string) => {
    let element: CanvasElement;
    if (type === "text") {
        element = createTextElement();
    } else if (type === "shape" && alt) {
        element = createShapeElement(alt as CanvasShapeTypes);
    } else if (type === "image") {
        element = createImageElement();
    } else {
        throw new Error("Unknown layer type: " + type);
    }

    elements.value.unshift(element);

    await addElementToCanvas(element);

    getCanvas()?.renderAll();

    onSaveCanvas();
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

const removeElementById = (uuid: string) => {
    const index = elements.value.findIndex((element) => element.id === uuid);
    if (index !== -1) {
        elements.value.splice(index, 1);
        onSaveCanvas();
    }
};

const {
    getCanvas,
    initialize,
    addElementsToCanvas,
    addElementToCanvas,
    findElementById,
    reorderCanvasElements,
    selectElementsByUUIDs,
    setEditUUID,
    removeCanvasElementById,
    selectedUUIDs,
    editUUID,
} = useCanvasModule({
    onChangeCanvasElement: (canvasElement) => {
        syncCanvasElementToElement(
            canvasElement,
            elementsById.value[canvasElement.uuid]
        );

        onSaveCanvas();
    },
    onRemoveCanvasElement: (canvasElement) => {
        removeElementById(canvasElement.uuid);
    },
});

const onReorderList = () => {
    const elementIds = elements.value.map((element) => element.id).reverse();
    reorderCanvasElements(elementIds);
};

const onSelectElement = (element: CanvasElement) => {
    if (
        selectedUUIDs.value.length === 1 &&
        selectedUUIDs.value[0] === element.id
    ) {
        return selectElementsByUUIDs([]);
    }
    selectElementsByUUIDs([element.id]);
};

const onSelectAdditionalElement = (element: CanvasElement) => {
    if (!selectedUUIDs.value.includes(element.id)) {
        selectElementsByUUIDs([...selectedUUIDs.value, element.id]);
    }
};

const handleItemSelect = (e: MouseEvent, element: CanvasElement) => {
    if (!element.selectable) {
        return false;
    }
    if (e.shiftKey) {
        onSelectAdditionalElement(element);
    } else {
        onSelectElement(element);
    }
};

const onEditElement = (element: CanvasElement | null) => {
    if (element) {
        if (element.selectable) {
            selectElementsByUUIDs([element.id]);
        } else {
            selectElementsByUUIDs([]);
        }
        setEditUUID(element.id);
    } else {
        setEditUUID(null);
    }
};

const onUpdateElement = async (element: CanvasElement) => {
    const canvasElement = findElementById(element.id);

    if (!element.selectable && selectedUUIDs.value.includes(element.id)) {
        selectElementsByUUIDs([]);
    }
    if (getCanvas()?.getActiveObject() instanceof fabric.ActiveSelection) {
        selectElementsByUUIDs([element.id]);
    }

    await syncElementToCanvasElement(element, canvasElement);

    const index = elements.value.findIndex((e) => e.id === element.id);
    elements.value[index] = element;

    getCanvas()?.renderAll();

    onSaveCanvas();
};

const onConfirmDeleteElement = (element: CanvasElement) => {
    getCanvas()?.discardActiveObject();
    removeCanvasElementById(element.id);
    removeElementById(element.id);
};

onMounted(async () => {
    if (canvasRef.value && canvasContainerRef.value) {
        initialize(canvasRef.value, canvasContainerRef.value);

        await addElementsToCanvas([...elements.value].reverse());

        computeElementThumbnails();
    } else {
        console.warn("Canvas refs not set");
    }
});
</script>

<template>
    <div class="canvas flex">
        <div
            class="canvas__sidebar relative shrink-0 w-[250px] bg-gray-100 border border-slate-300 p-4"
        >
            <h3 class="text-lg font-semibold mb-4">Layers</h3>
            <div class="canvas__add mb-4">
                <Dropdown text="Add Element">
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
                            <PlusIcon class="inline-block text-xs" />
                            Drawing
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
                        <button
                            class="dropdown__item"
                            @click="
                                close();
                                onAddLayer('shape', 'circle');
                            "
                        >
                            <PlusIcon class="inline-block text-xs" />
                            Shape:Circle
                        </button>
                        <button
                            class="dropdown__item"
                            @click="
                                close();
                                onAddLayer('shape', 'triangle');
                            "
                        >
                            <PlusIcon class="inline-block text-xs" />
                            Shape:Triangle
                        </button>
                    </template>
                </Dropdown>
            </div>
            <div class="canvas__sidebar-wrap">
                <div class="canvas__elements">
                    <Draggable
                        v-model="elements"
                        group="elements"
                        draggable=".element-item"
                        handle=".action--handle"
                        @end="onReorderList"
                    >
                        <ElementItem
                            v-for="element in elements"
                            :edit="editUUID === element.id"
                            :element="element"
                            :selected="selectedUUIDs.includes(element.id)"
                            :thumbnail="elementThumbnails[element.id]"
                            :key="element.id"
                            @click="handleItemSelect"
                            @edit="onEditElement"
                        >
                            <ElementForm
                                :element="element"
                                @update="onUpdateElement"
                                @delete="onConfirmDeleteElement"
                            />
                        </ElementItem>
                    </Draggable>
                </div>
            </div>
        </div>
        <div
            class="canvas__container grow w-full"
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

<style lang="scss" scoped>
@import "@/assets/mixins.scss";
.canvas {
    &__container {
        aspect-ratio: 16 / 9;
        min-width: 400px;
        max-width: 100%;

        canvas {
            aspect-ratio: 16 / 9;
        }
    }

    &__elements {
        :deep(> div[group="elements"]) {
            @apply flex flex-col gap-y-1;
        }
    }

    &__sidebar {
        &-wrap {
            position: absolute;
            top: 110px;
            left: 1rem;
            height: calc(100% - 110px);
            right: 1rem;
            overflow-x: visible;
            overflow-y: auto;
            margin-right: -20px;
            padding-right: 20px;
        }
    }

    :deep(.canvas-container) {
        @include checkered;
    }
}
</style>
