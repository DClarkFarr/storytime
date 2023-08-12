<script lang="ts" setup>
import { Scene } from "@/types/Scene";

const props = defineProps<{
    scene: Scene;
}>();
</script>

<template>
    <div
        class="scene-thumbnail flex flex-col gap-y-2 bg-gray-100 cursor-pointer hover:bg-gray-200 rounded p-2 h-full"
    >
        <div class="scene-thumbnail__image grow">
            <img :src="scene.image" alt="Scene thumbnail" />
        </div>
        <div>
            <div class="scene-thumbnail__name text-lg">
                {{ scene.name }}
            </div>
            <div class="scene-thumbnail__description text-sm">
                {{ scene.description }}
            </div>
        </div>
    </div>
</template>
