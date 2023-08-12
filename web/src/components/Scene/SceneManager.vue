<script lang="ts" setup>
import { SceneWithElements } from "../../types/Scene";
import { ref } from "vue";
import { debounce } from "lodash-es";
import Canvas from "@/components/Canvas.vue";
import httpClient from "@/services/httpClient";
import { CanvasElement } from "@/types/Canvas";

const props = defineProps<{
    scene: SceneWithElements;
}>();

const scene = ref<SceneWithElements>(props.scene);

const onSaveCanvas = async ({
    elements,
    imageData,
}: {
    elements: CanvasElement[];
    imageData?: string;
}) => {
    scene.value.elements = elements;

    httpClient.put(`/scene/${props.scene.id}`, {
        elements,
        imageData,
    });
};

const onSaveCanvasDebounced = debounce(onSaveCanvas, 500);
</script>

<template>
    <Canvas
        :elements="scene.elements"
        :width="1200"
        @save="onSaveCanvasDebounced"
    >
    </Canvas>
</template>
