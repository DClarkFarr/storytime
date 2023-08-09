<script lang="ts" setup>
import Slider from "@vueform/slider";
import { computed } from "vue";

const emit = defineEmits<{
    "update:value": [value: number];
}>();
const props = withDefaults(
    defineProps<{
        value: number;
        min?: number;
        max?: number;
        step?: number;
    }>(),
    {
        min: 0,
        max: 100,
        step: 1,
    }
);

const value = computed({
    get: () => props.value * 100,
    set: (v) => emit("update:value", v / 100),
});
</script>

<template>
    <div class="opacity-slider">
        <div class="text-sm">Opacity</div>
        <div class="pb-2 pr-2">
            <Slider
                v-model="value"
                showTooltip="drag"
                :format="(v: number) => v / 100"
            />
        </div>
    </div>
</template>

<style src="@vueform/slider/themes/default.css"></style>
