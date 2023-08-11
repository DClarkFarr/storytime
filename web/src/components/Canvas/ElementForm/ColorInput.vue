<script lang="ts" setup>
import { computed } from "vue";
import { ColorPicker } from "vue3-colorpicker";

const emit = defineEmits<{
    (e: "update:value", value: string): void;
}>();

const props = defineProps<{
    value: string;
}>();

const value = computed({
    get() {
        return props.value;
    },
    set(value: string) {
        emit("update:value", value);
    },
});
</script>

<template>
    <div class="color-input flex gap-x-2">
        <div class="color-input__picker">
            <ColorPicker
                format="hex"
                shape="circle"
                useType="pure"
                pickerType="chrome"
                v-model:pureColor="value"
            />
        </div>
        <div class="color-input__input">
            <input type="text" class="input input--sm" v-model="value" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
:deep(.vc-color-wrap) {
    margin: 0;
}
</style>
