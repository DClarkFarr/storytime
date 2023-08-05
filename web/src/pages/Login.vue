<script lang="ts" setup>
import httpClient from "@/services/httpClient";
import { reactive, ref } from "vue";
import { AxiosError } from "axios";
import { toUser } from "@/methods/user";

const isCreating = ref(false);
const error = ref("");

const form = reactive({
    email: "",
    password: "",
});

const resetForm = () => {
    form.email = "";
    form.password = "";
};

const onLogin = async () => {
    if (isCreating.value) return;

    isCreating.value = true;
    error.value = "";

    try {
        const loggedUser = await httpClient
            .post("/auth/login", form)
            .then((res) => toUser(res.data.user));

        console.log("loggedUser", loggedUser);
        resetForm();
    } catch (err) {
        console.log("error creating user", err);
        if (err instanceof AxiosError) {
            error.value = err.response?.data.message;
        }
    }

    isCreating.value = false;
};
</script>
<template>
    <div
        class="form-page flex justify-center items-center w-screen h-screen bg-gray-300"
    >
        <form
            @submit.prevent="onLogin"
            class="form bg-white p-4 shadow w-full max-w-[600px]"
        >
            <div class="text-center mb-4">
                <h2 class="text-2xl font-semibold text-center">Login</h2>
            </div>
            <div class="mb-4">
                <label>Email</label>
                <input
                    class="input"
                    type="text"
                    name="email"
                    v-model="form.email"
                />
            </div>
            <div class="mb-4">
                <label>Password</label>
                <input
                    class="input"
                    type="password"
                    name="password"
                    v-model="form.password"
                />
            </div>

            <div class="mb-4" v-if="error">
                <div class="text-red-500">{{ error }}</div>
            </div>
            <div>
                <button
                    type="submit"
                    class="bg-sky-600 hover:bg-sky-800 text-white px-3 py-1"
                    :disabled="isCreating"
                >
                    {{ isCreating ? "Logging in..." : "Login" }}
                </button>
            </div>
        </form>
    </div>
</template>
