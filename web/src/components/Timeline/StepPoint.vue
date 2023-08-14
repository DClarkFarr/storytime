<script lang="ts" setup>
import { computed, ref } from "vue";
import { onClickOutside } from "@vueuse/core";

import { Point, PointWithScene, StoryWithScenes } from "@/types/Story";
import IconPlus from "~icons/fa6-solid/plus";
import IconPencil from "~icons/fa6-solid/pencil";
import IconTrash from "~icons/fa6-solid/trash";

const emit = defineEmits<{
    attach: [point: PointWithScene];
    delete: [point: PointWithScene];
}>();

const props = defineProps<{
    step: number;
    story: StoryWithScenes;
    point: PointWithScene;
    points: Point[];
}>();

const selected = ref(false);

const elementRef = ref<HTMLElement | null>(null);

onClickOutside(elementRef, () => {
    selected.value = false;
});

const onClickAttach = () => {
    emit("attach", props.point);
};

const onClickDelete = () => {
    emit("delete", props.point);
};

const onToggleSelected = () => {
    selected.value = !selected.value;
};

const hasScene = computed(() => !!props.point.scene);
</script>

<template>
    <div
        class="step-point"
        ref="elementRef"
        :class="{ 'step-point--attached': hasScene }"
    >
        <template v-if="hasScene">
            <div class="step-point__scene relative" @click="onToggleSelected">
                <img :src="point.scene?.image" />

                <div
                    class="step-point__buttons absolute flex items-center justify-center gap-x-2 bg-black/25"
                    v-if="selected"
                >
                    <button
                        class="btn btn--sm btn--primary"
                        @click="onClickAttach"
                    >
                        <IconPencil class="text-sm" />
                    </button>
                    <button
                        class="btn btn--sm btn--danger"
                        @click="onClickDelete"
                    >
                        <IconTrash class="text-sm" />
                    </button>
                </div>
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

<style scoped lang="scss">
.step-point {
    &__buttons {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
}
</style>
