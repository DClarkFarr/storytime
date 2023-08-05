<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import CaretDownIcon from "~icons/fa6-solid/caret-down";
import { onClickOutside } from "@vueuse/core";

const props = withDefaults(
    defineProps<{
        text?: string;
        open?: boolean;
        paneWidth?: string;
    }>(),
    {
        text: "Dropdown",
        open: false,
        paneWidth: "100%",
    }
);

const emit = defineEmits<{
    (e: "update:open", val: boolean): void;
}>();

const isOpen = ref(false);

watch(
    () => props.open,
    (val) => {
        isOpen.value = val;
    },
    {
        immediate: true,
    }
);

const dropdown = ref<HTMLDivElement | null>(null);

const setIsOpen = (val: boolean) => {
    emit("update:open", val);
    isOpen.value = val;
};

const toggleOpen = () => {
    setIsOpen(!isOpen.value);
};

const close = () => {
    setIsOpen(false);
};
const open = () => {
    setIsOpen(true);
};

onClickOutside(dropdown, () => {
    close();
});

const stateProps = computed(() => {
    return {
        isOpen,
        toggleOpen,
        close,
        open,
    };
});
</script>

<template>
    <div
        class="dropdown relative"
        ref="dropdown"
        :class="{ 'dropdown--open': isOpen }"
    >
        <div class="dropdown__toggle">
            <slot name="button" v-bind="stateProps">
                <div
                    class="dropdown__button bg-white hover:bg-gray-100 border-gray-100 border cursor-pointer select-none flex items-center justify-between gap-x-3 py-1 px-2"
                    @click="toggleOpen"
                >
                    <div>
                        {{ props.text }}
                    </div>
                    <div>
                        <CaretDownIcon :class="{ 'rotate-90': !isOpen }" />
                    </div>
                </div>
            </slot>
        </div>
        <div
            class="dropdown__pane absolute min-w-full bg-white border border-gray-100 shadow-lg p-2"
            :style="{ width: paneWidth }"
            v-show="isOpen"
        >
            <slot v-bind="stateProps">
                <p>Default content here</p>
            </slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dropdown {
    &__pane {
        z-index: 500;
    }

    :deep() &__item {
        @apply py-1 px-2 block w-full text-left cursor-pointer hover:bg-gray-100 text-black border border-sky-500 mb-1;
    }
}
</style>
