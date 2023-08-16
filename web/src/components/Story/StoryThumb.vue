<script lang="ts" setup>
import { Story } from "@/types/Story";
import { DateTime } from "luxon";
import { computed } from "vue";
import IconPencil from "~icons/fa6-solid/pencil";

const emit = defineEmits<{
    click: [story: Story];
}>();

const props = withDefaults(
    defineProps<{
        story: Story;
        href?: string;
    }>(),
    {
        href: "#",
    }
);

const formattedDate = computed(() => {
    return DateTime.fromISO(props.story.createdAt).toLocaleString(
        DateTime.DATE_MED
    );
});
</script>

<template>
    <div class="story-thumbnail story bg-gray-100 px-4 py-2">
        <div class="flex gap-x-4 items-center">
            <div class="grow">
                <div class="flex items-center">
                    <div>
                        <h2 class="text-2xl font-semibold mb-2">
                            {{ props.story.name }}
                        </h2>
                    </div>
                    <div class="ml-auto">
                        {{ formattedDate }}
                    </div>
                </div>
                <div>
                    {{ props.story.description }}
                </div>
            </div>
            <div class="shrink-0">
                <a
                    class="btn btn--primary"
                    @click.prevent="emit('click', story)"
                    :href="href"
                >
                    <IconPencil class="text-sm" />
                </a>
            </div>
        </div>
    </div>
</template>
