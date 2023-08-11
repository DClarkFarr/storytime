<script lang="ts" setup>
import { UploadingFile } from "@/stores/useUploadsStore";
import { Upload } from "@/types/Upload";

const emit = defineEmits<{
    (e: "click", file: Upload): void;
}>();

const props = defineProps<{
    file: Upload;
    selected: boolean;
}>();

const onClick = () => {
    emit("click", props.file);
};
</script>
<template>
    <div
        class="file p-2 rounded-md"
        :class="{
            'file--selected': selected,
        }"
        @click="onClick"
    >
        <div class="file__image">
            <img :src="file.src" class="block w-full" />
        </div>
        <div class="file__caption select-none">
            {{ file.name }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.file {
    @apply bg-slate-100 text-gray-600;

    &--selected {
        @apply bg-sky-200 text-gray-800;
    }
}
</style>
