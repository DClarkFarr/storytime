<script lang="ts" setup>
import { CanvasImageElement } from "@/types/Canvas";
import OpacitySlider from "./OpacitySlider.vue";
import IconUpload from "~icons/fa6-solid/upload";
import UploadsModal from "@/components/Modals/UploadsModal.vue";
import { useModal } from "vue-final-modal";
import { Upload } from "@/types/Upload";

const props = defineProps<{
    element: CanvasImageElement;
}>();

const emit = defineEmits<{
    update: [element: CanvasImageElement];
}>();

const { open, close /* destroy, options, patchOptions */ } = useModal({
    // Open the modal or not when the modal was created, the default value is `false`.
    defaultModelValue: false,
    /**
     * If set `keepAlive` to `true`:
     * 1. The `displayDirective` will be set to `show` by default.
     * 2. The modal component will not be removed after the modal closed until you manually execute `destroy()`.
     */
    keepAlive: false,
    // `component` is optional and the default value is `<VueFinalModal>`.
    component: UploadsModal,
    attrs: {
        // Bind props to the modal component (VueFinalModal in this case).
        clickToClose: true,
        escToClose: true,
        // Bind events to the modal component (VueFinalModal in this case).
        onOpened() {
            console.log("on opened");
        },
        onClosed() {
            console.log("on closed");
        },

        onSelect(upload: Upload) {
            props.element.value = upload.src;
            emit("update", {
                ...props.element,
            });
            close();
        },
    },
});

const onUpdateOpacity = (opacity: number) => {
    emit("update", {
        ...props.element,
        opacity,
    });
};

const onOpenUploadModal = () => {
    open();
};
</script>

<template>
    <div class="image-form flex flex-col gap-y-2">
        <div class="form-group p-2 bg-slate-100">
            <div class="flex gap-x-2 items-center">
                <div class="bg-white">
                    <div class="-ml-1 -my-1">
                        <img
                            class="max-h-[60px] max-w-[60px]"
                            :src="element.value"
                        />
                    </div>
                </div>
                <div class="ml-auto">
                    <button class="p-2" @click="onOpenUploadModal">
                        <IconUpload class="text-xs" />
                    </button>
                </div>
            </div>
        </div>
        <div class="form-group p-2 bg-slate-100">
            <OpacitySlider
                :value="element.opacity"
                @update:value="onUpdateOpacity"
            />
        </div>
    </div>
</template>
