<script lang="ts" setup>
import { CanvasElement } from "@/types/Canvas";

const props = defineProps<{
    element: CanvasElement;
}>();

const emit = defineEmits<{
    update: [element: CanvasElement];
}>();
</script>

<template>show met he image</template>
