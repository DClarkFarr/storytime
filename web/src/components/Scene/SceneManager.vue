<script lang="ts" setup>
import { CanvasElement } from "@/types/Canvas";
import { SceneWithElements } from "../../types/Scene";
import { ref } from "vue";
import { debounce } from "lodash-es";
import Canvas from "@/components/Canvas.vue";
import httpClient from "@/services/httpClient";

const props = defineProps<{
    scene: SceneWithElements;
}>();

const scene = ref<SceneWithElements>(props.scene);

const onSave = async () => {
    httpClient.put(`/scene/${props.scene.id}`, {
        elements: scene.value.elements,
        name: scene.value.name,
        description: scene.value.description,
    });
};

const onSaveDebounced = debounce(onSave, 500);
</script>

<template>
    <Canvas
        v-model:elements="scene.elements"
        @update:elements="onSaveDebounced"
        :width="1200"
    >
    </Canvas>
</template>
