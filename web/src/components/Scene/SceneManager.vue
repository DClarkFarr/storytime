<script lang="ts" setup>
import { SceneWithElements } from "../../types/Scene";
import { ref } from "vue";
import { debounce } from "lodash-es";
import Canvas from "@/components/Canvas.vue";
import httpClient from "@/services/httpClient";
import { CanvasElement } from "@/types/Canvas";
import IconCaretLeft from "~icons/fa6-solid/caret-left";
import { AxiosResponse } from "axios";

const props = defineProps<{
    scene: SceneWithElements;
}>();

const scene = ref<SceneWithElements>(props.scene);

const editScene = ref(false);

const updateScene = (
    data: Partial<{
        elements: CanvasElement[];
        imageData: string;
        name: string;
    }>
) => {
    const promise = httpClient
        .put<any, AxiosResponse<{ row: SceneWithElements }>>(
            `/scene/${props.scene.id}`,
            data
        )
        .then(({ data }) => data.row);

    promise.then((updatedScene) => {
        scene.value.image = updatedScene.image;
    });

    return promise;
};

const onSaveCanvas = async ({
    elements,
    imageData,
}: {
    elements: CanvasElement[];
    imageData?: string;
}) => {
    scene.value.elements = elements;

    updateScene({
        elements,
        imageData,
    });
};

const onSaveCanvasDebounced = debounce(onSaveCanvas, 500);

const onSaveSceneName = () => {
    editScene.value = false;

    updateScene({
        name: scene.value.name,
    });
};
</script>

<template>
    <div
        class="heading flex gap-x-4 items-center p-4 bg-slate-300 border border-slate-500"
    >
        <div>
            <router-link
                :to="{ name: 'story.edit', params: { id: scene.storyId } }"
                class="btn btn--light"
            >
                <IconCaretLeft class="text-sm inline" />
                Back to story
            </router-link>
        </div>
        <div>
            <h2
                class="text-lg font-semibold"
                v-if="!editScene"
                @click="editScene = true"
            >
                {{ scene.name }}
            </h2>
            <input
                v-else
                class="input"
                v-model="scene.name"
                @blur="onSaveSceneName"
            />
        </div>
    </div>
    <Canvas
        :elements="scene.elements"
        :width="1200"
        @save="onSaveCanvasDebounced"
    >
    </Canvas>
</template>
