<script lang="ts" setup>
import { CanvasElement } from "@/types/Canvas";
import OpacitySlider from "./OpacitySlider.vue";

const props = defineProps<{
    element: CanvasElement;
}>();

const emit = defineEmits<{
    update: [element: CanvasElement];
}>();

const onUpdateOpacity = (opacity: number) => {
    emit("update", {
        ...props.element,
        opacity,
    });
};
</script>

<template>
    <div class="image-form">
        <div class="form-group p-2 bg-slate-100">
            <OpacitySlider
                :value="element.opacity"
                @update:value="onUpdateOpacity"
            />
        </div>
    </div>
</template>
