<script lang="ts" setup>
import { CanvasElement } from "@/types/Canvas";

import ElementTextForm from "./ElementForm/ElementTextForm.vue";
import ElementImageForm from "./ElementForm/ElementImageForm.vue";
import ElementShapeForm from "./ElementForm/ElementShapeForm.vue";
import ElementFormHeader from "./ElementForm/ElementFormHeader.vue";

const props = defineProps<{
    element: CanvasElement;
}>();

const emit = defineEmits<{
    update: [element: CanvasElement];
    delete: [element: CanvasElement];
}>();

const onConfirmDelete = () => {
    emit("delete", props.element);
};
</script>

<template>
    <div class="element-form">
        <ElementFormHeader
            :element="element"
            @update="(e) => emit('update', e)"
            @delete="onConfirmDelete"
        />
        <ElementTextForm
            :element="element"
            v-if="element.type === 'text'"
            @update="(e) => emit('update', e)"
        />
        <ElementImageForm
            :element="element"
            v-if="element.type === 'image'"
            @update="(e) => emit('update', e)"
        />
        <ElementShapeForm
            :element="element"
            v-if="element.type === 'shape'"
            @update="(e) => emit('update', e)"
        />
    </div>
</template>
