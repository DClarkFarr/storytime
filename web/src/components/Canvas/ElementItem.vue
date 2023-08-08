<script lang="ts" setup>
import { CanvasElement } from "@/types/Canvas";
import IconBars from "~icons/fa6-solid/bars";

const props = defineProps<{
    element: CanvasElement;
    thumbnail?: string;
    selected: boolean;
    edit: boolean;
}>();
props;
</script>

<template>
    <div
        class="element-item px-4 py-2 bg-white border rounded-md cursor-pointer"
        :class="{
            'border-slate-500': !selected,
            'border-sky-500': selected,
            'element-item--selected': selected,
            'element-item--edit': edit,
        }"
    >
        <div class="flex items-center gap-x-2 select-none">
            <div
                class="element-item__thumbnail flex align-center"
                v-if="thumbnail"
            >
                <img :src="thumbnail" />
            </div>
            <div class="element-item__type text-xs font-semibold">
                {{ element.type }}
            </div>
            <div class="element-item__actions ml-auto flex gap-x-2">
                <div>
                    <button class="action action--handle">
                        <IconBars class="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.action {
    @apply border-0 p-1 rounded-md;
}

.element-item {
    &__thumbnail {
        img {
            max-height: 25px;
            max-width: 50px;
            display: block;
        }
    }
}
</style>
