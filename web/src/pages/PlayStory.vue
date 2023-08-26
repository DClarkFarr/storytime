<script lang="ts" setup>
import httpClient from "@/services/httpClient";
import { Point, StoryWithScenes } from "@/types/Story";
import { AxiosResponse } from "axios";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import IconSpinner from "~icons/fa6-solid/spinner";
import IconCircleChevronRight from "~icons/fa6-solid/circle-chevron-right";

const isLoading = ref(false);
const route = useRoute();
const story = ref<StoryWithScenes | null>(null);
const points = ref<Point[]>([]);
const currentPoint = ref<Point | null>(null);

const currentScene = computed(() => {
    if (!currentPoint.value) {
        return null;
    }

    return (
        story.value?.scenes.find((s) => s.id === currentPoint.value?.sceneId) ||
        null
    );
});

const loadStory = async (id: string) => {
    isLoading.value = true;
    try {
        story.value = await httpClient
            .get(`/story/${id}`)
            .then((response) => response.data.row);

        await loadPoints();
        selectStartingPoint();
    } catch (err) {
        console.error("Error loading story", err);
    }
    isLoading.value = false;
};

const loadPoints = async () => {
    if (!story.value) {
        return;
    }
    const ps = await httpClient
        .get<any, AxiosResponse<{ rows: Point[] }>>(
            `/story/${story.value.id}/point`
        )
        .then(({ data }) => data.rows)
        .then((rows) => rows.filter((r) => !!r.sceneId))
        .then((rows) => {
            return rows.map((r) => {
                const actions = r.actions.filter((a) => !!a.toPointId);
                return {
                    ...r,
                    actions,
                };
            });
        });

    points.value = ps;
};

const selectStartingPoint = () => {
    if (!story.value) {
        return;
    }

    const found = points.value.find((p) => p.row === 0);

    currentPoint.value = found || null;
};

const onSelectNextPoint = (pointId: string) => {
    const point = points.value.find((p) => p.id === pointId);
    if (!point) {
        alert("Next page not found");
        return;
    }
    currentPoint.value = point;
};

onMounted(() => {
    loadStory(route.params.id.toString());
});
</script>

<template>
    <div class="play-story bg-slate-500 h-screen w-screen p-10">
        <div class="book bg-white rounded-lg p-6 max-w-[1000px] mx-auto">
            <template v-if="story && !isLoading">
                <div class="page">
                    <div class="page__image">
                        <img
                            :src="currentScene?.image"
                            :alt="currentScene?.name"
                            class="w-full"
                        />
                    </div>
                    <div class="page__text mb-8">
                        <div class="page__title text-4xl font-semibold">
                            {{ currentScene?.name }}
                        </div>
                        <div class="page__description text-lg">
                            {{ currentScene?.description }}
                        </div>
                    </div>
                    <div class="page__actions flex flex-col gap-x-2">
                        <div
                            class="page__action action border border-gray-300 flex gap-x-2 items-center bg-white rounded p-2 cursor-pointer hover:bg-gray-100"
                            v-for="(action, index) in currentPoint?.actions"
                            :key="index"
                            @click="onSelectNextPoint(action.toPointId)"
                        >
                            <div class="action__text grow">
                                {{ action.text }}
                            </div>
                            <div class="action__icon shrink-0">
                                <div class="p-3">
                                    <IconCircleChevronRight class="text-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="h-[300px] flex items-center justify-center">
                    <div>
                        <IconSpinner
                            class="animate-spin text-6xl text-gray-500"
                        />
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
