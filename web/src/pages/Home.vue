<script lang="ts" setup>
import httpClient from "@/services/httpClient";
import { Story } from "@/types/Story";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import StoryThumb from "@/components/Story/StoryThumb.vue";

const stories = ref<Story[]>([]);
const isCreating = ref(false);
const router = useRouter();

const onSelectStory = (storyId: string) => {
    router.push({
        name: "story.edit",
        params: {
            id: storyId,
        },
    });
};

const onCreateStory = () => {
    isCreating.value = true;
    httpClient
        .post("/story")
        .then((response) => response.data.row)
        .then((story: Story) => {
            onSelectStory(story.id);
        })
        .finally(() => {
            isCreating.value = false;
        });
};

const loadStories = () => {
    httpClient
        .get("/story")
        .then((response) => response.data.rows)
        .then((rows: Story[]) => {
            stories.value = rows;
        });
};

onMounted(() => {
    loadStories();
});
</script>
<template>
    <div class="flex mb-10 p-4">
        <div>
            <h1 class="text-2xl font-semibold">My Stories</h1>
        </div>
        <div class="ml-auto">
            <button @click="onCreateStory" class="btn btn--primary">
                Create Story
            </button>
        </div>
    </div>
    <div class="stories flex flex-col gap-y-2 m-4">
        <RouterLink
            v-for="story in stories"
            custom
            :key="story.id"
            :to="{ name: 'story.edit', params: { id: story.id } }"
        >
            <template #="link">
                <StoryThumb
                    :story="story"
                    @click="() => link.navigate()"
                    :href="link.href"
                />
            </template>
        </RouterLink>
    </div>
</template>
