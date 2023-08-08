<script lang="ts" setup>
import httpClient from "@/services/httpClient";
import { Story } from "@/types/Story";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isLoading = ref(false);
const story = ref<Story | null>(null);

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
        <h1 class="text-2xl">Edit story</h1>
    </div>
</template>
