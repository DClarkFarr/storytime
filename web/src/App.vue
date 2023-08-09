<script lang="ts" setup>
// const props = defineProps<{
//     msg?: string;
// }>();

import { ModalsContainer } from "vue-final-modal";
</script>

<template>
    <div>
        <router-view />
        <ModalsContainer />
    </div>
</template>

<style scoped></style>
