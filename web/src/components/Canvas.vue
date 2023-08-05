<script lang="ts" setup>
import { CanvasElement, CanvasElementTypes } from "@/types/Canvas";
import { computed } from "vue";
import { createTextElement } from "@/methods/canvas";

import Dropdown from "./controls/Dropdown.vue";
import PlusIcon from "~icons/fa6-solid/plus";

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

const onAddLayer = (type: CanvasElementTypes) => {
    if (type === "text") {
        const element = createTextElement();

        elements.value.push(element);
    }
};
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
                    </template>
                </Dropdown>
            </div>
        </div>
        <div
            class="canvas__container grow w-full checkered"
            :style="computedStyles"
        >
            <canvas ref="canvas" class="canvas__canvas"></canvas>
        </div>
    </div>
</template>

<style lang="scss">
.canvas {
    &__container {
        aspect-ratio: 16 / 9;
        min-width: 400px;
    }
}
</style>
