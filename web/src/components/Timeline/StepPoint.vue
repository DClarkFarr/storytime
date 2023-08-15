<script lang="ts" setup>
import { computed, nextTick, ref } from "vue";
import { onClickOutside } from "@vueuse/core";

import { Point, PointWithScene, StoryWithScenes } from "@/types/Story";
import IconPlus from "~icons/fa6-solid/plus";
import IconPencil from "~icons/fa6-solid/pencil";
import IconTrash from "~icons/fa6-solid/trash";
import IconCaretDown from "~icons/fa6-solid/caret-down";

const emit = defineEmits<{
    attach: [point: PointWithScene];
    delete: [point: PointWithScene];
    addAction: [point: PointWithScene];
    editActions: [point: PointWithScene];
}>();

const props = defineProps<{
    step: number;
    story: StoryWithScenes;
    point: PointWithScene;
    points: Point[];
}>();

const attachSelected = ref(false);

const actionsExpanded = ref(false);

const elementRef = ref<HTMLElement | null>(null);

onClickOutside(elementRef, () => {
    attachSelected.value = false;
    actionsExpanded.value = false;
});

const onClickAttach = () => {
    emit("attach", props.point);
};

const onClickDelete = () => {
    emit("delete", props.point);
};

const onToggleActionsExpanded = () => {
    actionsExpanded.value = !actionsExpanded.value;
};

const onToggleAttachSelected = () => {
    attachSelected.value = !attachSelected.value;
};

const onAddAction = async () => {
    emit("addAction", props.point);
    await nextTick();
    emit("editActions", props.point);
};

const onClickEditActions = () => {
    emit("editActions", props.point);
};

const hasScene = computed(() => !!props.point.scene);

const mappedActions = computed(() => {
    return props.point.actions.map((action, index) => {
        return {
            ...action,
            position: index + 1,
        };
    });
});
</script>

<template>
    <div
        class="step-point border-2 rounded"
        ref="elementRef"
        :class="{
            'step-point--attached': hasScene,
            'border-gray-200': !attachSelected,
            'border-sky-400': attachSelected,
        }"
    >
        <template v-if="hasScene">
            <div
                class="step-point__scene relative cursor-pointer"
                :class="{ 'hover:bg-black/25': !attachSelected }"
                @click="onToggleAttachSelected"
            >
                <img class="hover:brightness-50" :src="point.scene?.image" />

                <div
                    class="step-point__buttons absolute flex items-center justify-center gap-x-2 bg-black/25"
                    v-if="attachSelected"
                >
                    <button
                        class="btn btn--sm btn--primary"
                        @click="onClickAttach"
                    >
                        <IconPencil class="text-sm" />
                    </button>
                    <button
                        class="btn btn--sm btn--danger"
                        @click="onClickDelete"
                    >
                        <IconTrash class="text-sm" />
                    </button>
                </div>
            </div>
            <div
                class="step-point__footer bg-gray-400 hover:bg-gray-500 cursor-pointer px-2 py-1"
            >
                <div
                    class="step-point__details text-sm flex items-center"
                    @click="onToggleActionsExpanded"
                >
                    <div>Actions</div>
                    <div class="shrink-0 ml-auto">
                        <div
                            class="leading-none p-1 rounded-full bg-gray-100 min-w-[24px] text-center"
                        >
                            {{ point.actions.length || 0 }}
                        </div>
                    </div>
                    <div>
                        <IconCaretDown
                            class="text-sm"
                            :class="{ 'rotate-90': actionsExpanded }"
                        />
                    </div>
                </div>

                <div
                    class="step-point__actions select-none"
                    @click="onClickEditActions"
                    v-if="actionsExpanded"
                >
                    <div
                        class="step-point__action flex items-center gap-x-2"
                        v-for="action in mappedActions"
                        :key="action.position"
                        :data-action="action.position"
                        :class="{
                            'step-point__action--attached': !!action.toPointId,
                        }"
                    >
                        <div class="text-bold">{{ action.position }}.</div>
                        <div
                            class="step-point__action-text w-full truncate text-ellipsis"
                        >
                            {{ action.text }}
                        </div>
                    </div>
                    <div
                        class="step-point__add border-t border-gray-800 pt-2 mt-2"
                    >
                        <button
                            @click="onAddAction"
                            class="btn btn--sm btn--primary block w-full"
                        >
                            <IconPlus class="text-sm inline" /> Action
                        </button>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <div
                class="step-point__attach bg-gray-400 rounded p-2 text-center hover:bg-gray-500 hover:text-white cursor-pointer cursor-pointer"
                @click="onClickAttach"
            >
                <div>
                    <IconPlus class="text-sm mx-auto" />
                </div>
                <div class="text-xs">Attach Scene</div>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
.step-point {
    &__buttons {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
}
</style>
