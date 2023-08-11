<script lang="ts" setup>
import Slider from "@vueform/slider";
import { computed } from "vue";

const emit = defineEmits<{
    "update:value": [value: number];
}>();
const props = withDefaults(
    defineProps<{
        value: number;
        label?: string;
        min?: number;
        max?: number;
        step?: number;
        format?: (v: number) => string;
    }>(),
    {
        label: "Number",
        min: 0,
        max: 100,
        step: 1,
        format: (v: number) => v.toLocaleString(),
    }
);

const value = computed({
    get: () => props.value,
    set: (v) => emit("update:value", v),
});
</script>

<template>
    <div class="custom-slider">
        <div class="text-sm">{{ label }}</div>
        <div class="pb-2 pr-2">
            <Slider v-model="value" showTooltip="drag" :format="format" />
        </div>
    </div>
</template>

<style src="@vueform/slider/themes/default.css"></style>
