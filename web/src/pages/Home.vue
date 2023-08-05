<script lang="ts" setup>
import Canvas from "@/components/Canvas.vue";
import { CanvasElement } from "@/types/Canvas";
import { ref } from "vue";

const elements = ref<CanvasElement[]>([]);
</script>
<template>
    <Canvas v-model:elements="elements" />
</template>
