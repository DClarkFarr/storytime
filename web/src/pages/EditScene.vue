<script lang="ts" setup>
import httpClient from "@/services/httpClient";
import { SceneWithElements } from "@/types/Scene";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import SceneManager from "@/components/Scene/SceneManager.vue";

const router = useRouter();
const route = useRoute();
const scene = ref<SceneWithElements | null>(null);

const loadScene = async (id: string) => {
    try {
        scene.value = await httpClient
            .get(`/scene/${id}`, { params: { populate: true } })
            .then((response) => response.data.row);
    } catch (err) {
        console.error("Error loading scene", err);
    }
};

onMounted(() => {
    loadScene(route.params.id.toString());
});
</script>

<template>
    <div class="edit-scene-page">
        <SceneManager v-if="scene" :scene="scene" />
    </div>
</template>
