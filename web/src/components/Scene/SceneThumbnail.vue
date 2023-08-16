<script lang="ts" setup>
import { Scene } from "@/types/Scene";
import { computed, useSlots } from "vue";

const props = defineProps<{
    scene: Scene;
}>();

const slots = useSlots();

const descriptionExcerpt = computed(() => {
    const description = props.scene.description;
    if (description.length > 60) {
        return description.substring(0, 60) + "...";
    }
    return description;
});

const hasActions = computed(() => {
    return !!slots.actions;
});
</script>

<template>
    <div
        class="scene-thumbnail flex flex-col gap-y-2 bg-gray-100 relative rounded p-2"
    >
        <div
            class="scene-thumbnail__bg absolute left-0 right-0 bottom-0 top-0 flex items-center justify-center gap-x-3"
            :class="{
                'bg-gray-700/25': !hasActions,
                'bg-gray-700/75': hasActions,
            }"
        >
            <slot name="actions"></slot>
        </div>
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

<style lang="scss" scoped>
.scene-thumbnail {
    &:hover {
        .scene-thumbnail__bg {
            display: flex;
        }
    }
    &__bg {
        display: none;
    }
}
</style>
