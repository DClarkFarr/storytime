<script lang="ts" setup>
import { VueFinalModal } from "vue-final-modal";

const emit = defineEmits<{
    (e: "confirm"): void;
    (e: "cancel"): void;
}>();

const props = withDefaults(
    defineProps<{
        title?: string;
        text?: string;
        minWidth?: number;
        onOpen?: () => void;
        onClose?: () => void;
        onClickOutside?: () => void;
        clickToClose?: boolean;
        escToClose?: boolean;
        modalId?: string;
        show?: boolean;
    }>(),
    {
        clickToClose: false,
        escToClose: false,
        modalId: "confirm-modal",
        show: undefined,
        onOpen: undefined,
        onClose: undefined,
        onClickOutside: undefined,
        minWidth: 400,
    }
);

const onConfirm = () => {
    emit("confirm");
};

const onCancel = () => {
    emit("cancel");
};
</script>

<template>
    <VueFinalModal
        :click-to-close="clickToClose"
        :esc-to-close="escToClose"
        :modal-id="modalId"
        :show="show"
        @opened="onOpen"
        @closed="onClose"
        class="modal flex justify-center items-center"
        content-class="flex flex-col mx-4 bg-white rounded-lg space-y-2 shadow-xl"
    >
        <div class="modal__header bg-red-600 px-4 py-2">
            <slot name="title">
                <h3 class="text-xl font-semibold text-white leading-none">
                    {{ title }}
                </h3>
            </slot>
        </div>
        <div class="modal__content p-4">
            <slot>
                <p class="text-gray-600">{{ text }}</p>
            </slot>
        </div>
        <div class="modal__footer border-t border-slate-300 px-4 py-2">
            <slot name="footer">
                <div class="flex gap-x-2 justify-end">
                    <div>
                        <button class="btn btn--light" @click="onCancel">
                            Cancel
                        </button>
                    </div>
                    <div>
                        <button class="btn btn--danger" @click="onConfirm">
                            Confirm
                        </button>
                    </div>
                </div>
            </slot>
        </div>
    </VueFinalModal>
</template>

<style lang="scss" scoped></style>
