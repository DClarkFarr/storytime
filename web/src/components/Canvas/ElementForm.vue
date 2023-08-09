<script lang="ts" setup>
import { CanvasElement } from "@/types/Canvas";

import ElementTextForm from "./ElementForm/ElementTextForm.vue";
import ElementImageForm from "./ElementForm/ElementImageForm.vue";
import ElementShapeForm from "./ElementForm/ElementShapeForm.vue";

defineProps<{
    element: CanvasElement;
}>();

const emit = defineEmits<{
    update: [element: CanvasElement];
}>();
</script>

<template>
    <div class="element-form">
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
