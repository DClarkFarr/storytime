<script lang="ts" setup>
import SceneThumbnail from "@/components/Scene/SceneThumbnail.vue";
import httpClient from "@/services/httpClient";
import { StoryWithScenes } from "@/types/Story";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import IconPlus from "~icons/fa6-solid/plus";
import IconSpinner from "~icons/fa6-solid/spinner";

const router = useRouter();
const route = useRoute();
const isLoading = ref(false);
const story = ref<StoryWithScenes | null>(null);

const creatingScene = ref(false);

const onCreateScene = () => {
    creatingScene.value = true;
    httpClient
        .post(`/story/${story.value?.id}/scene`)
        .then((response) => response.data.row)
        .then((scene) => {
            router.push({
                name: "scene.edit",
                params: {
                    id: scene.id,
                    storyId: story.value?.id,
                },
            });
        })
        .finally(() => {
            creatingScene.value = false;
        });
};

const loadStory = async (id: string) => {
    isLoading.value = true;
    try {
        story.value = await httpClient
            .get(`/story/${id}`)
            .then((response) => response.data.row);
    } catch (err) {
        console.error("Error loading story", err);
    }
    isLoading.value = false;
};

onMounted(() => {
    loadStory(route.params.id.toString());
});
</script>
<template>
    <div class="edit-story">
        <div
            class="edit-story__header bg-slate-300 border border-slate-500 p-4 mb-8"
        >
            <div class="flex flex items-center">
                <div>
                    <h1 class="text-xl font-semibold">Story Editor</h1>
                </div>
                <div class="ml-auto">
                    <button
                        class="btn btn--primary"
                        @click="onCreateScene"
                        :disabled="creatingScene"
                    >
                        <template v-if="creatingScene">
                            <IconSpinner class="text-sm inline animate-spin" />
                            Creating...
                        </template>
                        <template v-else>
                            <IconPlus class="text-sm inline" />
                            Scene
                        </template>
                    </button>
                </div>
            </div>
        </div>

        <div class="edit-story__content mx-auto px-4 max-w-[1600px]">
            <h3 class="font-semibold">Scenes</h3>
            <div class="scenes grid gap-3 mb-8">
                <RouterLink
                    class="block"
                    :to="{
                        name: 'scene.edit',
                        params: { storyId: story?.id, id: scene.id },
                    }"
                    v-for="scene in story?.scenes"
                    :key="scene.id"
                >
                    <SceneThumbnail :scene="scene" class="h-full" />
                </RouterLink>
            </div>
            <h3 class="font-semibold">Construct Timeline</h3>
            <div class="timeline"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.scenes.grid {
    grid-template-columns: repeat(auto-fill, 250px);
}
</style>
