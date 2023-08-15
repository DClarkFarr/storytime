<script lang="ts" setup>
import { PointWithScene } from "@/types/Story";

const emit = defineEmits<{
    click: [point: PointWithScene];
}>();
const props = defineProps<{
    point: PointWithScene;
}>();
</script>

<template>
    <div
        class="point-item point-item--horizontal flex gap-x-2 p-1 items-center bg-gray-100 hover:bg-gray-200 cursor-pointer"
        @click="emit('click', point)"
    >
        <div class="font-semibold">Step {{ point.row + 1 }}</div>
        <template v-if="point.scene">
            <div>
                <img class="w-[50px] rounded" :src="point.scene?.image" />
            </div>
            <div>
                {{ point.scene?.name }}
            </div>
        </template>
        <template v-else>
            <div>
                Point
                {{ point.col + 1 }}
            </div>
        </template>

        <div class="point-item__actions">
            <slot name="actions" v-bind="{ point }"> </slot>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
