<script lang="ts" setup>
import { PointWithScene } from "@/types/Story";
import { VueFinalModal } from "vue-final-modal";
import { VueDraggableNext as Draggable } from "vue-draggable-next";
import IconBars from "~icons/fa6-solid/bars";
import IconPlus from "~icons/fa6-solid/plus";
import IconMinus from "~icons/fa6-solid/minus";
import Dropdown from "../controls/Dropdown.vue";
import { debounce } from "lodash-es";
import PointItemHorizontal from "../Scene/PointItemHorizontal.vue";
import { computed } from "vue";
import { Shortcode } from "@/types/Shortcode";

const emit = defineEmits<{
    cancel: [];
    change: [point: PointWithScene];
    add: [point: PointWithScene];
    createNext: [point: PointWithScene, actionIndex: number];
}>();

const props = withDefaults(
    defineProps<{
        point: PointWithScene | null;
        shortcodes: Shortcode[];
        futurePoints: PointWithScene[];
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
        modalId: "edit-actions-modal",
        show: undefined,
        onOpen: undefined,
        onClose: undefined,
        onClickOutside: undefined,
    }
);

const onCancel = () => {
    emit("cancel");
};

const onReorderActions = () => {
    onSave();
};

const onAddToNext = (actionIndex: number) => {
    emit("createNext", props.point as PointWithScene, actionIndex);
};

const onAddAction = () => {
    emit("add", props.point as PointWithScene);
};

const onSave = () => {
    emit("change", props.point as PointWithScene);
};

const onSelectPoint = (actionIndex: number, selectedPoint: PointWithScene) => {
    if (!props.point) {
        return;
    }

    const point = props.point as PointWithScene;
    point.actions[actionIndex].toPointId = selectedPoint.id;

    emit("change", point as PointWithScene);
};

const debounceOnSave = debounce(onSave, 500);

const onRemoveNextPoint = (actionIndex: number) => {
    const point = props.point as PointWithScene;
    point.actions[actionIndex].toPointId = "";

    emit("change", point as PointWithScene);
};

const onEditActionShortcodes = (actionIndex: number) => {
    console.log("actionIndex", actionIndex);
};

const actionPoints = computed(() => {
    if (!props.point) {
        return [];
    }
    return props.point.actions.map((a) => {
        if (!a.toPointId) {
            return null;
        }

        return props.futurePoints.find((p) => p.id === a.toPointId) || null;
    });
});
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
                    Edit Actions
                </h3>
            </slot>
        </div>
        <div class="modal__content p-4">
            <div class="header">
                <div class="font-semibold text-2xl mb-4">
                    Step {{ (point?.row || 0) + 1 }}
                </div>
                <div
                    class="scene border-b border-slate-400 mb-4 pb-2"
                    v-if="point?.scene"
                >
                    <div class="flex gap-x-3">
                        <div v-if="point.scene.image">
                            <img
                                class="w-[150px] rounded"
                                :src="point.scene.image"
                            />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-700">
                                {{ point.scene.name }}
                            </h2>
                            <div>
                                {{ point.scene.description }}
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="p-4 bg-sky-100 border border-sky-500">
                        No scene attached
                    </div>
                </div>
                <div class="mb-4">
                    <Draggable
                        v-if="point"
                        v-model="point.actions"
                        group="actions"
                        draggable=".action"
                        handle=".action--handle"
                        class="flex flex-col gap-y-3"
                        @end="onReorderActions"
                    >
                        <div
                            class="action flex items-center gap-x-2"
                            v-for="(action, index) of point.actions"
                            :key="index"
                        >
                            <div class="shrink-0">
                                <div class="action--handle cursor-move">
                                    <IconBars class="text-gray-400" />
                                </div>
                            </div>
                            <div class="shrink-0">
                                <div class="text-lg font-semibold">
                                    {{ index + 1 }}.
                                </div>
                            </div>
                            <div class="w-1/2">
                                <textarea
                                    type="text"
                                    class="input w-full"
                                    v-model="point.actions[index].text"
                                    @input="debounceOnSave"
                                ></textarea>
                            </div>
                            <div class="ml-auto">
                                <Dropdown
                                    v-if="!actionPoints[index]"
                                    text="Next Scene"
                                    pane-width="400px"
                                    align="right"
                                >
                                    <template #default="{ close }">
                                        <div
                                            class="flex flex-col gap-y-2"
                                            @click="close"
                                        >
                                            <PointItemHorizontal
                                                v-for="fPoint in futurePoints"
                                                :key="fPoint.id"
                                                :point="fPoint"
                                                @click="
                                                    onSelectPoint(index, fPoint)
                                                "
                                            >
                                            </PointItemHorizontal>
                                            <button
                                                v-if="!action.toPointId"
                                                class="btn btn--light block w-full"
                                                @click="onAddToNext(index)"
                                            >
                                                <IconPlus
                                                    class="inline-block text-xs"
                                                />
                                                Add to next step
                                            </button>
                                        </div>
                                    </template>
                                </Dropdown>
                                <div v-else>
                                    <PointItemHorizontal
                                        :point="(actionPoints[index] as PointWithScene)"
                                    >
                                        <template #actions>
                                            <div class="flex gap-x-2">
                                                <div>
                                                    <button
                                                        class="btn btn--primary btn--sm"
                                                        @click="
                                                            onEditActionShortcodes(
                                                                index
                                                            )
                                                        "
                                                    >
                                                        Shortcodes
                                                    </button>
                                                </div>
                                                <div>
                                                    <button
                                                        class="btn btn--danger btn--sm"
                                                        @click="
                                                            onRemoveNextPoint(
                                                                index
                                                            )
                                                        "
                                                    >
                                                        <IconMinus
                                                            class="text-xs"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </template>
                                    </PointItemHorizontal>
                                </div>
                            </div>
                        </div>
                    </Draggable>
                </div>
                <div>
                    <button class="btn btn--primary" @click="onAddAction">
                        <IconPlus class="text-sm inline mr-2" /> Action
                    </button>
                </div>
            </div>
        </div>
        <div class="modal__footer border-t border-slate-300 px-4 py-2">
            <slot name="footer">
                <div class="flex gap-x-2 justify-end">
                    <div>
                        <button class="btn btn--light" @click="onCancel">
                            Close
                        </button>
                    </div>
                </div>
            </slot>
        </div>
    </VueFinalModal>
</template>
