<script lang="ts" setup>
import { CanvasShapeElement } from "@/types/Canvas";
import OpacitySlider from "./OpacitySlider.vue";
import CustomSlider from "./CustomSlider.vue";

const props = defineProps<{
    element: CanvasShapeElement;
}>();

const emit = defineEmits<{
    update: [element: CanvasShapeElement];
}>();

const onUpdateOpacity = (opacity: number) => {
    emit("update", {
        ...props.element,
        opacity,
    });
};

const onUpdateStrokeWidth = (strokeWidth: number) => {
    emit("update", {
        ...props.element,
        shape: {
            ...props.element.shape,
            strokeWidth,
        },
    });
};
</script>

<template>
    <div class="image-form flex flex-col gap-y-2">
        <div class="form-group p-2 bg-slate-100">
            <CustomSlider
                label="Stroke Width"
                :min="0"
                :max="25"
                :value="element.shape.strokeWidth"
                @update:value="onUpdateStrokeWidth"
            />
        </div>

        <div class="form-group p-2 bg-slate-100">
            <OpacitySlider
                :value="element.opacity"
                @update:value="onUpdateOpacity"
            />
        </div>
    </div>
</template>
