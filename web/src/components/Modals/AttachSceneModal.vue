<script lang="ts" setup>
import { Scene } from "@/types/Scene";
import { PointWithScene } from "@/types/Story";
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import SceneThumbnail from "../Scene/SceneThumbnail.vue";

const emit = defineEmits<{
    attach: [point: PointWithScene, scene: Scene];
    cancel: [];
}>();

const props = withDefaults(
    defineProps<{
        scenes: Scene[];
        point: PointWithScene | null;
        clickToClose?: boolean;
        escToClose?: boolean;
        modalId?: string;
        show?: boolean;
        onOpen?: () => void;
        onClose?: () => void;
        onClickOutside?: () => void;
    }>(),
    {
        clickToClose: true,
        escToClose: true,
        modalId: "attach-scene-modal",
        show: undefined,
        onOpen: undefined,
        onClose: undefined,
        onClickOutside: undefined,
    }
);

const selectedScene = ref<Scene | null>(null);

const onAttach = () => {
    emit("attach", props.point as PointWithScene, selectedScene.value as Scene);
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
        content-class="flex flex-col mx-4 bg-white rounded-lg space-y-2 shadow-xl lg:w-[800px]"
    >
        <div class="modal__header bg-sky-600 px-4 py-2">
            <slot name="title">
                <h3 class="text-xl font-semibold text-white leading-none">
                    Select a scene to attach
                </h3>
            </slot>
        </div>
        <div class="modal__content p-4 grid gap-4">
            <SceneThumbnail
                v-for="scene in props.scenes"
                :key="scene.id"
                :scene="scene"
                :class="{
                    'border-2 border-sky-600': selectedScene === scene,
                    'border-2 border-transparent': selectedScene !== scene,
                }"
                @click="selectedScene = scene"
            />
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
                        <button
                            class="btn btn--primary"
                            :disabled="!selectedScene"
                            @click="onAttach"
                        >
                            Attach
                        </button>
                    </div>
                </div>
            </slot>
        </div>
    </VueFinalModal>
</template>

<style lang="scss" scoped>
.grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
</style>
