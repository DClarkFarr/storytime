<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import useTimeline from "@/hooks/useTimeline";
import { PointWithScene, StoryWithScenes } from "@/types/Story";
import IconPlus from "~icons/fa6-solid/plus";
import StepPoint from "./Timeline/StepPoint.vue";
import { useModal } from "vue-final-modal";
import AttachSceneModal from "./Modals/AttachSceneModal.vue";
import { Scene } from "@/types/Scene";

const STEP_WIDTH = 175;

const props = defineProps<{
    story: StoryWithScenes;
}>();

const timelineRef = ref<HTMLElement | null>(null);

const timeline = useTimeline({
    timelineRef,
    story: props.story,
    stepWidth: STEP_WIDTH,
});

const visibleItemIndexes = computed(() => {
    return timeline.paginate.visibleItemIndexes.value;
});

const attachSceneModal = useModal({
    component: AttachSceneModal,
    attrs: {
        point: null,
        story: props.story,
        scenes: props.story.scenes,
        onCancel: () => {
            attachSceneModal.close();
        },
        onAttach: (point: PointWithScene, selectedScene: Scene) => {
            timeline.updatePoint(point.id, {
                sceneId: selectedScene.id,
            });
            attachSceneModal.close();
        },
    },
});
const onShowAttachPointModal = async (point: PointWithScene) => {
    attachSceneModal.patchOptions({
        attrs: {
            scenes: attachSceneModal.options.attrs?.scenes as Scene[],
            point,
        },
    });
    await attachSceneModal.open();
};

const onDeletePoint = (point: PointWithScene) => {
    timeline.deletePoint(point.id);
};

const onAddPointAction = async (point: PointWithScene) => {
    await timeline.addPointAction(point.id);
};

onMounted(() => {
    timeline.init();
});
</script>
<template>
    <div
        class="timeline"
        ref="timelineRef"
        :style="{ '--width': `${STEP_WIDTH}px` }"
    >
        <div class="timeline__steps p-2 mb-2" ref="timelineStepsRef">
            <div
                class="timeline__step"
                v-for="stepIndex in visibleItemIndexes"
                :key="stepIndex"
            >
                <div
                    class="timeline__step-heading text-center leading-none font-semibold"
                >
                    Step {{ stepIndex + 1 }}
                </div>
                <div class="timeline__step-content">
                    <div class="timeline__step-points">
                        <div
                            class="timeline__step-point-wrapper"
                            v-for="(col, colIndex) in timeline.pointsGrid.value[
                                stepIndex
                            ]"
                            :key="`${stepIndex}-${colIndex}`"
                        >
                            <StepPoint
                                v-if="col"
                                :point="col"
                                :step="stepIndex"
                                :story="story"
                                :points="timeline.points.value"
                                @attach="onShowAttachPointModal"
                                @delete="onDeletePoint"
                                @add-action="onAddPointAction"
                            />
                            <div
                                class="timeline__step-point timeline__step-point--placeholder"
                                v-else
                            >
                                <div v-if="stepIndex > 0">show button!</div>
                                <div v-else></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="timeline__step timeline__step--add flex flex-col justify-center items-center"
                v-if="visibleItemIndexes.length < timeline.stepsPerPage.value"
                @click="timeline.addStep"
            >
                <div>
                    <IconPlus class="text-sm" />
                </div>
                <div>Add Step</div>
            </div>
        </div>
        <div class="timeline__pagination flex items-center gap-x-2">
            <div>
                <button
                    class="btn btn--light"
                    @click="timeline.prevPage"
                    :disabled="timeline.page.value <= 1"
                >
                    Prev
                </button>
            </div>
            <div>
                <button
                    class="btn btn--light"
                    @click="timeline.nextPage"
                    :disabled="
                        timeline.paginate.pages.value <= timeline.page.value
                    "
                >
                    Next
                </button>
            </div>
            <div>
                Page {{ timeline.page.value }} of
                {{ timeline.paginate.pages.value }}, showing steps
                {{ timeline.paginate.offset.value + 1 }} -
                {{ timeline.paginate.offset.value + visibleItemIndexes.length }}
                of {{ timeline.numSteps }}
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.timeline {
    &__steps {
        display: flex;
        column-gap: 8px;
        background: #ababab;
        width: 100%;
        min-height: 400px;
    }

    &__step {
        width: var(--width);
        @apply bg-slate-100 rounded flex flex-col self-stretch;

        &-heading {
            @apply py-1 bg-slate-300 rounded-t shrink-0;
        }

        &-content {
            @apply p-2 grow;
        }

        &--add {
            @apply bg-sky-200 cursor-pointer;
        }
    }
}
</style>
