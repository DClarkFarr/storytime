<script lang="ts" setup>
import { CanvasElement } from "@/types/Canvas";
import IconBars from "~icons/fa6-solid/bars";
import IconPencil from "~icons/fa6-solid/pencil";
// import IconEyeSlash from "~icons/fa6-solid/eye-slash";
import IconMinus from "~icons/fa6-solid/minus";

const emit = defineEmits<{
    edit: [element: CanvasElement | null];
    click: [e: MouseEvent, element: CanvasElement];
}>();

const props = defineProps<{
    element: CanvasElement;
    thumbnail?: string;
    selected: boolean;
    edit: boolean;
}>();

const onClickEdit = () => {
    emit("edit", props.element);
};

const onClickClose = () => {
    emit("edit", null);
};

const onClickHeading = (e: MouseEvent) => {
    emit("click", e, props.element);
};
</script>

<template>
    <div
        class="element-item px-4 py-2 border rounded-md cursor-pointer"
        :class="{
            'border-slate-500': !selected,
            'border-sky-500': selected,
            'element-item--selected': selected,
            'element-item--edit': edit,
            'bg-white': element.selectable,
            'bg-gray-200': !element.selectable,
        }"
    >
        <div
            class="element-item__heading flex items-center gap-x-2 select-none"
            @click="onClickHeading"
        >
            <div
                class="element-item__thumbnail flex align-center"
                v-if="thumbnail && thumbnail.length > 6"
            >
                <img :src="thumbnail" />
            </div>
            <div class="element-item__type text-xs font-semibold">
                {{ element.type }}
            </div>
            <div class="element-item__actions ml-auto flex gap-x-2">
                <div>
                    <button
                        v-if="!edit"
                        @click.prevent.stop="onClickEdit"
                        class="action action--edit"
                    >
                        <IconPencil class="text-xs" />
                    </button>
                    <button
                        v-else
                        @click.prevent.stop="onClickClose"
                        class="action action--close"
                    >
                        <IconMinus class="text-xs" />
                    </button>
                </div>
                <div>
                    <button class="action action--handle">
                        <IconBars class="text-sm" />
                    </button>
                </div>
            </div>
        </div>
        <div class="element-item__form pt-2" v-if="edit">
            <slot></slot>
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
