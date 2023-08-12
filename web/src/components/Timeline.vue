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
                    class="timeline__step-heading text-center leading-none font-semibold mb-2"
                >
                    Step {{ index + 1 }}
                </div>
                <div>was {{ timeline.stepsPerPage }}</div>
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
        <div class="timeline__pagination"></div>
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

        &--add {
            @apply bg-sky-200 cursor-pointer;
        }
    }
}
</style>
