<script lang="ts" setup>
import SceneThumbnail from "@/components/Scene/SceneThumbnail.vue";
import Timeline from "@/components/Timeline.vue";
import httpClient from "@/services/httpClient";
import { StoryWithScenes } from "@/types/Story";
import { nextTick, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import IconPlus from "~icons/fa6-solid/plus";
import IconSpinner from "~icons/fa6-solid/spinner";
import IconCaretLeft from "~icons/fa6-solid/caret-left";
import IconPencil from "~icons/fa6-solid/pencil";
import IconCopy from "~icons/fa6-solid/copy";
import IconPlay from "~icons/fa6-solid/play";
import { Scene } from "@/types/Scene";
import { useModal } from "vue-final-modal";
import ShortcodeModal from "@/components/Modals/ShortcodeModal.vue";
import { Shortcode } from "@/types/Shortcode";
import { AxiosResponse } from "axios";

const router = useRouter();
const route = useRoute();
const isLoading = ref(false);
const story = ref<StoryWithScenes | null>(null);
const shortcodes = ref<Shortcode[]>([]);

const creatingScene = ref(false);

const editName = ref(false);
const editDescription = ref(false);

const nameRef = ref<HTMLInputElement | null>(null);

const shortcodeModal = useModal({
    component: ShortcodeModal,
    attrs: {
        shortcode: null,
        storyId: "",
        onCancel: () => {
            shortcodeModal.close();
        },
        onChange: (shortcode: Shortcode) => {
            console.log("shortcode changed", shortcode);
        },
    },
});

const onCreateScene = () => {
    creatingScene.value = true;
    httpClient
        .post(`/story/${story.value?.id}/scene`)
        .then((response) => response.data.row)
        .then((scene) => {
            router.push({
                name: "scene.edit",
                params: {
                    id: scene.id,
                    storyId: story.value?.id,
                },
            });
        })
        .finally(() => {
            creatingScene.value = false;
        });
};

const loadStory = async (id: string) => {
    isLoading.value = true;
    try {
        story.value = await httpClient
            .get(`/story/${id}`)
            .then((response) => response.data.row);

        await loadShortcodes();
    } catch (err) {
        console.error("Error loading story", err);
    }
    isLoading.value = false;
};

const loadShortcodes = async () => {
    shortcodes.value = await httpClient
        .get<any, AxiosResponse<{ rows: Shortcode[] }>>(
            `/story/${story.value?.id}/shortcode`
        )
        .then(({ data }) => data.rows);
};

const saveStory = () => {
    return httpClient
        .put(`/story/${story.value?.id}`, {
            name: story.value?.name,
            description: story.value?.description,
        })
        .then((response) => response.data.row);
};

const onBlurName = () => {
    editName.value = false;
    saveStory();
};

const onBlurDescription = () => {
    editDescription.value = false;
    saveStory();
};

const onEditName = async () => {
    editName.value = true;
    await nextTick();
    nameRef.value?.focus();
};

const onEditDescription = async () => {
    editDescription.value = true;
    await nextTick();
    nameRef.value?.focus();
};

const onClickCopyScene = async (scene: Scene) => {
    httpClient
        .post(`/story/${story.value?.id}/scene/${scene.id}/copy`)
        .then((response) => {
            router.push({
                name: "scene.edit",
                params: {
                    id: response.data.row.id,
                    storyId: story.value?.id,
                },
            });
        });
};

const onCreateShortcode = () => {
    shortcodeModal.patchOptions({
        attrs: {
            shortcode: null,
            storyId: story.value?.id || "",
        },
    });
    shortcodeModal.open();
};

const makeSlug = (slug: string) => {
    return `[${slug}]`;
};

const onClickEditShortcode = (shortcode: Shortcode) => {
    shortcodeModal.patchOptions({
        attrs: {
            shortcode,
            storyId: story.value?.id || "",
        },
    });
    shortcodeModal.open();
};

onMounted(() => {
    loadStory(route.params.id.toString());
});
</script>
<template>
    <div class="edit-story">
        <div
            class="edit-story__header bg-slate-200 border border-slate-500 p-4 mb-8"
        >
            <div class="flex flex items-center gap-x-3">
                <div>
                    <RouterLink
                        class="btn btn--light"
                        :to="{
                            name: 'home',
                        }"
                    >
                        <IconCaretLeft class="text-xs inline" />
                        Back
                    </RouterLink>
                </div>
                <div>
                    <h1 class="text-2xl font-semibold">Story Editor</h1>
                </div>
                <div v-if="story" class="ml-2">
                    <div v-if="!editName" @click="onEditName">
                        <div
                            class="flex items-center gap-x-2 cursor-pointer px-2 py-1 hover:bg-white rounded"
                        >
                            <h2 class="font-bold text-xl text-gray-700">
                                {{ story.name }}
                            </h2>
                            <div>
                                <IconPencil class="text-xs" />
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <input
                            type="text"
                            class="input text-lg"
                            ref="nameRef"
                            v-model="story.name"
                            @blur="onBlurName"
                        />
                    </div>
                </div>

                <div class="ml-auto flex items-center gap-x-2">
                    <div>
                        <RouterLink
                            target="_blank"
                            :to="{
                                name: 'story.play',
                                params: { id: story?.id },
                            }"
                            class="btn btn--success"
                        >
                            <IconPlay class="text-sm inline" />
                            Play
                        </RouterLink>
                    </div>
                    <div>
                        <button
                            class="btn btn--primary"
                            @click="onCreateScene"
                            :disabled="creatingScene"
                        >
                            <template v-if="creatingScene">
                                <IconSpinner
                                    class="text-sm inline animate-spin"
                                />
                                Creating...
                            </template>
                            <template v-else>
                                <IconPlus class="text-sm inline" />
                                Scene
                            </template>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div
            class="edit-story__description mx-auto mb-8 px-4 max-w-[1600px]"
            v-if="story"
        >
            <h3 class="font-semibold">Description</h3>
            <div
                class="text-gray-700 hover:bg-gray-100 p-2 cursor-pointer"
                @click="onEditDescription"
                v-if="!editDescription"
            >
                {{ story?.description }}
                <span class="pl-3">
                    <IconPencil class="text-xs inline" />
                </span>
            </div>
            <div v-else>
                <textarea
                    ref="descriptionRef"
                    class="input"
                    rows="8"
                    v-model="story.description"
                    @blur="onBlurDescription"
                ></textarea>
            </div>
        </div>

        <div class="edit-story__content mx-auto px-4 max-w-[1600px]">
            <h3 class="font-semibold">Scenes</h3>
            <div class="scenes mb-8">
                <div class="grid gap-3">
                    <SceneThumbnail
                        v-for="scene in story?.scenes"
                        :key="scene.id"
                        :scene="scene"
                        class="h-full"
                    >
                        <template #actions>
                            <div>
                                <button
                                    class="btn btn--light"
                                    @click.stop.prevent="
                                        onClickCopyScene(scene)
                                    "
                                >
                                    <IconCopy class="text-sm" />
                                </button>
                            </div>
                            <div>
                                <RouterLink
                                    class="btn btn--primary"
                                    :to="{
                                        name: 'scene.edit',
                                        params: {
                                            storyId: story?.id,
                                            id: scene.id,
                                        },
                                    }"
                                >
                                    <IconPencil class="text-sm" />
                                </RouterLink>
                            </div>
                        </template>
                    </SceneThumbnail>
                </div>
                <div
                    v-if="story && !story.scenes.length"
                    class="p-4 bg-sky-200 border border-sky-600 text-sky-700"
                >
                    No scenes yet. Create one!
                </div>
            </div>

            <h3 class="font-semibold">Shortcodes</h3>
            <div class="flex flex-col gap-x-1 mb-4 lg:w-1/2">
                <div
                    v-for="sc in shortcodes"
                    :key="sc.id"
                    class="flex gap-x-3 items-center p-2 border border-gray-200 bg-gray-100"
                >
                    <div class="font-semibold">{{ makeSlug(sc.slug) }}</div>
                    <div>Type: {{ sc.returnType }}</div>
                    <div class="ml-auto">
                        <button
                            class="btn btn--primary btn--sm"
                            @click="onClickEditShortcode(sc)"
                        >
                            <IconPencil class="inline text-xs" />
                        </button>
                    </div>
                </div>
                <div
                    class="text-center p-4 text-gray-500 bg-gray-100"
                    v-if="!isLoading && !shortcodes.length"
                >
                    Add shortcodes to begin
                </div>
            </div>
            <div class="mb-8">
                <button class="btn btn--light" @click="onCreateShortcode()">
                    <IconPlus class="text-sm inline" />
                    Shortcode
                </button>
            </div>

            <h3 class="font-semibold">Construct Timeline</h3>
            <div class="timeline" v-if="story">
                <Timeline :story="story" :shortcodes="shortcodes" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.scenes .grid {
    grid-template-columns: repeat(auto-fill, 250px);
}
</style>
