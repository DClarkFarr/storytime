<script lang="ts" setup>
import httpClient from "@/services/httpClient";
import { reactive, ref } from "vue";

const isCreating = ref(false);
const error = ref("");

const onRegister = async () => {
    if (isCreating.value) return;

    isCreating.value = true;
    error.value = "";

    try {
        const created = await httpClient.post("/auth/register", {
            firstName: "John",
            lastName: "Doe",
            email: "test@email.com",
            password: "123456",
        });

        console.log(created, "from", form);
    } catch (err) {
        console.log("error creating user", err);
    }

    isCreating.value = false;
};

const form = reactive({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
});
</script>
<template>
    <div
        class="form-page flex justify-center items-center w-screen h-screen bg-gray-300"
    >
        <form @submit.prevent="onRegister" class="form bg-white p-4 shadow">
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
            <div class="lg:flex gap-x-4">
                <div class="lg:w-1/2 mb-4">
                    <label>First Name</label>
                    <input
                        class="input"
                        type="text"
                        name="firstName"
                        v-model="form.firstName"
                    />
                </div>
                <div class="lg:w-1/2 mb-4">
                    <label>Last Name</label>
                    <input
                        class="input"
                        type="text"
                        name="lastName"
                        v-model="form.lastName"
                    />
                </div>
            </div>
            <div>
                <button
                    type="submit"
                    class="bg-sky-600 hover:bg-sky-800 text-white px-3 py-1"
                    :disabled="isCreating"
                >
                    {{ isCreating ? "Creating..." : "Create User" }}
                </button>
            </div>
        </form>
    </div>
</template>
