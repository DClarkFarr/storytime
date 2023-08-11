<script lang="ts" setup>
import { VueFinalModal } from "vue-final-modal";
import Dropzone from "../controls/Dropzone.vue";
import useUploadsStore from "@/stores/useUploadsStore";

const props = withDefaults(
    defineProps<{
        onOpen?: () => void;
        onClose?: () => void;
        onClickOutside?: () => void;
        clickToClose?: boolean;
        escToClose?: boolean;
        modalId?: string;
        show?: boolean;
    }>(),
    {
        clickToClose: true,
        escToClose: true,
        modalId: "uploads-modal",
        show: undefined,
        onOpen: undefined,
        onClose: undefined,
        onClickOutside: undefined,
    }
);

const uploads = useUploadsStore();

const onDropFile = (files: File[]) => {
    files.map((file) => uploads.uploadFile(file));
};
</script>

<template>
    <VueFinalModal
        :click-to-close="clickToClose"
        :esc-to-close="escToClose"
        :modal-id="modalId"
        :show="show"
        @opened="onOpen"
        @close="onClose"
        class="modal flex justify-center items-center"
        content-class="flex flex-col mx-4 p-6 bg-white border rounded-lg space-y-2 shadow-xl"
    >
        <div>
            <div class="modal__content lg:w-[650px]">
                <Dropzone :on-drop="onDropFile" />
            </div>
        </div>
    </VueFinalModal>
</template>
