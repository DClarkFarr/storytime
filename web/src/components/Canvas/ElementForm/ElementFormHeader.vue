<script lang="ts" setup>
import IconLock from "~icons/fa6-solid/lock";
import IconTrash from "~icons/fa6-solid/trash";
import IconLockOpen from "~icons/fa6-solid/lock-open";
import { CanvasElement } from "@/types/Canvas";
import ConfirmModal from "@/components/Modals/ConfirmModal.vue";
import { useModal } from "vue-final-modal";

const emit = defineEmits<{
    delete: [element: CanvasElement];
    update: [element: CanvasElement];
}>();

const props = defineProps<{
    element: CanvasElement;
}>();

const onToggleSelectable = () => {
    emit("update", {
        ...props.element,
        selectable: !props.element.selectable,
    });
};

const modal = useModal({
    component: ConfirmModal,
    attrs: {
        title: "Delete element",
        text: "Are you sure you want to delete this element?",
        onConfirm: () => {
            emit("delete", props.element);
            modal.close();
        },
        onCancel: () => {
            modal.close();
        },
    },
});

const onClickDelete = () => {
    modal.open();
};
</script>

<template>
    <div
        class="element-header flex gap-x-1 justify-end border-b border-slate-300 pb-2 mb-2"
    >
        <div>
            <button
                class="btn btn--sm bg-gray-100 hover:bg-gray-200"
                :class="{ 'bg-gray-200': !element.selectable }"
                @click="onToggleSelectable"
            >
                <IconLockOpen class="text-xs" v-if="element.selectable" />
                <IconLock class="text-xs" v-else />
            </button>
        </div>
        <div>
            <button class="btn btn--sm text-red-700" @click="onClickDelete">
                <IconTrash class="text-xs" />
            </button>
        </div>
    </div>
</template>
