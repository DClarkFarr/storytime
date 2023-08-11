<script lang="ts" setup>
import { useDropzone } from "vue3-dropzone";

const props = defineProps<{
    onDrop: (files: File[]) => void;
}>();

const { getRootProps, getInputProps, isDragActive, open, close, ...rest } =
    useDropzone({ onDrop: props.onDrop });
</script>

<template>
    <div class="dropzone">
        <div class="dropzone__root" v-bind="getRootProps()">
            <input class="dropzone__input" v-bind="getInputProps()" />

            <div class="dropzone__content">
                <slot v-bind="{ isDragActive, ...rest }">
                    <p v-if="isDragActive">Drop the files here ...</p>
                    <p v-else>Drop files here, or click to upload</p>
                </slot>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dropzone {
    &__content {
        border: 2px dashed #ccc;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        transition: all 0.3s ease;
        font-size: 12px;
        background: #eaeaea;
    }
}
</style>
