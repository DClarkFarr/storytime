<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import useTimeline from "@/hooks/useTimeline";
import { StoryWithScenes } from "@/types/Story";
import IconPlus from "~icons/fa6-solid/plus";

const props = defineProps<{
    story: StoryWithScenes;
}>();

const timelineRef = ref<HTMLElement | null>(null);

const timeline = useTimeline({ timelineRef, story: props.story });

const visibleItemIndexes = computed(() => {
    return timeline.paginate.visibleItemIndexes.value;
});

onMounted(() => {
    timeline.init();
});
</script>
<template>
    <div class="timeline" ref="timelineRef">
        <div class="timeline__steps p-2" ref="timelineStepsRef">
            <div class="timeline__step" v-for="index in visibleItemIndexes">
                <div
                    class="timeline__step-heading text-center leading-none font-semibold"
                >
                    Step {{ index + 1 }}
                </div>
                <div class="timeline__step-content">
                    <div
                        class="timeline__step-points"
                        v-if="timeline.pointsByStep.value[index]"
                    >
                        <div
                            class="timeline__step-point"
                            v-for="point in timeline.pointsByStep.value[index]"
                        >
                            Point: {{ point.col + 1 }}
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
                {{ timeline.paginate.pages.value }}, showing
                {{ timeline.paginate.offset.value + 1 }} -
                {{ timeline.paginate.offset.value + visibleItemIndexes.length }}
                of {{ timeline.numSteps }} steps
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
        @apply bg-slate-100 rounded w-[150px] flex flex-col self-stretch;

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
