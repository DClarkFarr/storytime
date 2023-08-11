<script lang="ts" setup>
import { UploadingFile } from "@/stores/useUploadsStore";
import IconSpinner from "~icons/fa6-solid/spinner";
import IconCircleX from "~icons/fa6-solid/circle-xmark";
import IconX from "~icons/fa6-solid/xmark";

const emit = defineEmits<{
    (e: "close", file: UploadingFile): void;
}>();

const props = defineProps<{
    file: UploadingFile;
}>();

const onClickClose = () => {
    emit("close", props.file);
};
</script>
<template>
    <div
        class="uploading-file flex gap-x-4 items-center p-2 rounded-md"
        :class="[`uploading-file--${file.status}`]"
    >
        <div class="uploading-file__icon">
            <template v-if="file.status === 'success'">
                <img :src="file.src" class="max-w-[40px] max-h-[50px]" />
            </template>
            <template v-else-if="file.status === 'error'">
                <IconCircleX />
            </template>
            <template v-else>
                <IconSpinner class="animate-spin" />
            </template>
        </div>
        <div class="uploading-file__content">
            <template v-if="file.status === 'success'"> Uploaded! </template>
            <template v-else-if="file.status === 'error'">
                Error uploading file
            </template>
            <template v-else> Uploading file... </template>
        </div>
        <div class="uploading-file__action ml-auto">
            <button
                class="btn btn--sm btn--danger text-red-700"
                @click="onClickClose"
            >
                <IconX class="text-xs" />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.uploading-file {
    &--uploading {
        @apply bg-sky-100 text-sky-600;
    }
    &--success {
        @apply bg-green-100 text-green-600;
    }
    &--error {
        @apply bg-red-100 text-red-600;
    }
}
</style>
