<script lang="ts" setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const loadStory = (id: string) => {
    console.log(id);
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
