<script lang="ts" setup>
import { VueFinalModal } from "vue-final-modal";
import Dropzone from "../controls/Dropzone.vue";
import useUploadsStore from "@/stores/useUploadsStore";
import UploadingFile from "./UploadModal/UploadingFile.vue";
import { onMounted, ref } from "vue";
import { Upload } from "@/types/Upload";
import UploadedFile from "./UploadModal/UploadedFile.vue";

const emit = defineEmits<{
    (e: "select", upload: Upload): void;
}>();

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

const selectedUpload = ref<Upload | null>(null);

const onDropFile = (files: File[]) => {
    files.map((file) => uploads.uploadFile(file));
};

const onSelectUpload = (upload: Upload) => {
    selectedUpload.value = upload;
};

const onConfirmUpload = (upload: Upload) => {
    emit("select", upload);
    uploads.removeUploadingFiles();
    selectedUpload.value = null;
};

onMounted(() => {
    uploads.maybeLoadUploads();
});
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
                <div class="dropzone-parent mb-3">
                    <Dropzone :on-drop="onDropFile" />
                </div>
                <div class="uploading-files flex flex-col gap-y-2 mb-6">
                    <div
                        class="uploading-files__remove-all text-right"
                        v-if="uploads.uploadingFiles.length > 1"
                    >
                        <button
                            class="btn btn--danger btn--sm"
                            @click="uploads.removeUploadingFiles"
                        >
                            Remove all
                        </button>
                    </div>
                    <UploadingFile
                        v-for="file in uploads.uploadingFiles"
                        :key="file.id"
                        :file="file"
                        @close="
                            (clickedFile) =>
                                uploads.removeUploadingFile(clickedFile.id)
                        "
                    />
                </div>

                <div class="uploaded-files grid gap-2">
                    <UploadedFile
                        v-for="file in uploads.uploads"
                        :key="file.id"
                        :file="file"
                        :selected="selectedUpload?.id === file.id"
                        @click="onSelectUpload"
                        class="cursor-pointer"
                    />
                </div>

                <div class="flex w-full justify-end" v-if="selectedUpload">
                    <button
                        class="btn btn--primary"
                        @click="onConfirmUpload(selectedUpload)"
                    >
                        Select
                    </button>
                </div>
            </div>
        </div>
    </VueFinalModal>
</template>

<style lang="scss" scoped>
.grid {
    grid-template-columns: repeat(auto-fill, 100px);
}
</style>
