<script lang="ts" setup>
import { Scene } from "@/types/Scene";
import { computed } from "vue";

const props = defineProps<{
    scene: Scene;
}>();

const descriptionExcerpt = computed(() => {
    const description = props.scene.description;
    if (description.length > 60) {
        return description.substring(0, 60) + "...";
    }
    return description;
});
</script>

<template>
    <div
        class="scene-thumbnail flex flex-col gap-y-2 bg-gray-100 cursor-pointer hover:bg-gray-200 rounded p-2"
    >
        <div class="scene-thumbnail__image">
            <img :src="scene.image" alt="Scene thumbnail" />
        </div>
        <div>
            <div class="scene-thumbnail__name text-lg">
                {{ scene.name }}
            </div>
            <div class="scene-thumbnail__description text-sm grow">
                {{ descriptionExcerpt }}
            </div>
        </div>
    </div>
</template>
