<script lang="ts" setup>
import { VueFinalModal } from "vue-final-modal";
import IconBars from "~icons/fa6-solid/bars";
import IconPlus from "~icons/fa6-solid/plus";
import IconMinus from "~icons/fa6-solid/minus";
import Dropdown from "../controls/Dropdown.vue";
import { debounce, update } from "lodash-es";
import { computed, reactive, ref, watch } from "vue";
import { Shortcode } from "@/types/Shortcode";
import httpClient from "@/services/httpClient";
import { AxiosResponse } from "axios";

const emit = defineEmits<{
    cancel: [];
    change: [shortcode: Shortcode];
}>();

const props = withDefaults(
    defineProps<{
        storyId: string;
        shortcode: Shortcode | null;
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
        modalId: "shortcode-modal",
        show: undefined,
        onOpen: undefined,
        onClose: undefined,
        onClickOutside: undefined,
    }
);

const form = reactive({
    slug: "",
    returnType: "",
    formatState: "",
    initState: "",
});

const errorMessage = ref("");

const isSaving = ref(false);

const onCancel = () => {
    emit("cancel");
};

const emitSave = (shortcode: Shortcode) => {
    emit("change", shortcode);
};

const updateShortcode = () => {
    return httpClient
        .put<any, AxiosResponse<{ row: Shortcode }>>(
            `/story/${props.storyId}/shortcode/${props.shortcode?.id}`,
            {
                slug: form.slug,
                returnType: form.returnType,
                formatState: form.formatState,
                initState: form.initState,
            }
        )
        .then(({ data }) => data.row);
};

const createShortcode = () => {
    return httpClient
        .post<any, AxiosResponse<{ row: Shortcode }>>(
            `/story/${props.storyId}/shortcode`,
            {
                slug: form.slug,
                returnType: form.returnType,
                formatState: form.formatState,
                initState: form.initState,
            }
        )
        .then(({ data }) => data.row);
};

const onHandleSave = async () => {
    if (isSaving.value) return;

    isSaving.value = true;
    errorMessage.value = "";

    const method = props.shortcode ? updateShortcode : createShortcode;
    try {
        emitSave(await method());
    } catch (err) {
        if (err instanceof Error) {
            errorMessage.value = err.message;
        }
    }

    isSaving.value = false;
};

watch(
    () => props.shortcode,
    (shortcode) => {
        form.slug = shortcode?.slug || "";
        form.returnType = shortcode?.returnType || "string";
        form.formatState =
            shortcode?.formatState ||
            `function formatState(state) {
    return state;
}`;
        form.initState =
            shortcode?.initState ||
            `function initState(){
    var state = '';
    return state;
}`;
    },
    { immediate: true }
);
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
                    Shortcode
                </h3>
            </slot>
        </div>
        <div class="modal__content p-4">
            <div class="mb-4">
                <div>Unique Name</div>
                <input class="input" v-model="form.slug" />
            </div>
            <div class="mb-4">
                <div>Return Type</div>
                <input class="input" v-model="form.returnType" />
            </div>
            <div class="mb-4">
                <div>Init State</div>
                <textarea
                    class="input"
                    v-model="form.initState"
                    rows="8"
                ></textarea>
            </div>
            <div class="mb-4">
                <div>Format State</div>
                <textarea
                    class="input"
                    v-model="form.formatState"
                    rows="8"
                ></textarea>
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
                    <div>
                        <button
                            class="btn btn--success"
                            @click="onHandleSave"
                            :disabled="isSaving"
                        >
                            {{ isSaving ? "Saving..." : "Save" }}
                        </button>
                    </div>
                </div>
            </slot>
        </div>
    </VueFinalModal>
</template>
