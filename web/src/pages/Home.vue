<script lang="ts" setup>
import httpClient from "@/services/httpClient";
import { Story } from "@/types/Story";
import { ref } from "vue";
import { useRouter } from "vue-router";

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
</script>
<template>
    <div class="flex mb-10">
        <div>
            <h1 class="text-2xl font-semibold">My Stories</h1>
        </div>
        <div class="ml-auto">
            <button @click="onCreateStory" class="btn btn--primary">
                Create Story
            </button>
        </div>
    </div>
    <div class="stories">todo:: stories grid here</div>
</template>
