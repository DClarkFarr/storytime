<script lang="ts" setup>
const props = defineProps<{
    msg?: string;
}>();
</script>

<template>
    <div class="msg">
        {{ props.msg || "No Message" }}
    </div>
</template>
