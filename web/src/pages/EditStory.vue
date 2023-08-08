<script lang="ts" setup>
import httpClient from "@/services/httpClient";
import { Story } from "@/types/Story";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import IconPlus from "~icons/fa6-solid/plus";
import IconSpinner from "~icons/fa6-solid/spinner";

const router = useRouter();
const route = useRoute();
const isLoading = ref(false);
const story = ref<Story | null>(null);

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
        <div class="flex flex items-center">
            <div>
                <h1 class="text-2xl">Edit story</h1>
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

        <div class="scenes">todo::scenes grid here</div>
        <div class="timeline">todo::timeline here</div>
    </div>
</template>
