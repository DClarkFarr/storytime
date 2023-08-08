<script lang="ts" setup>
import { CanvasElement } from "@/types/Canvas";
import { SceneWithElements } from "../../types/Scene";
import { ref } from "vue";

import Canvas from "@/components/Canvas.vue";

const props = defineProps<{
    scene: SceneWithElements;
}>();

const elements = ref<CanvasElement[]>([]);
</script>

<template>
    <Canvas v-model:elements="elements" :width="1200"> </Canvas>
</template>
