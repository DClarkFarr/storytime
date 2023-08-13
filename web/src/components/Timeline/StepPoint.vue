<script lang="ts" setup>
import { Point, PointWithScene, StoryWithScenes } from "@/types/Story";
import { computed } from "vue";
import IconPlus from "~icons/fa6-solid/plus";

const emit = defineEmits<{
    attach: [point: PointWithScene];
}>();

const props = defineProps<{
    step: number;
    story: StoryWithScenes;
    point: PointWithScene;
    points: Point[];
}>();

const onClickAttach = () => {
    emit("attach", props.point);
};

const hasScene = computed(() => !!props.point.scene);
</script>

<template>
    <div class="step-point" :class="{ 'step-point--attached': hasScene }">
        <template v-if="hasScene">
            <div class="step-point__scene">
                <img :src="point.scene?.image" />
            </div>
        </template>
        <template v-else>
            <div
                class="step-point__attach bg-gray-400 rounded p-2 text-center hover:bg-gray-500 hover:text-white cursor-pointer"
                @click="onClickAttach"
            >
                <div>
                    <IconPlus class="text-sm mx-auto" />
                </div>
                <div class="text-xs">Attach Scene</div>
            </div>
        </template>
    </div>
</template>
