import { toUser } from "@/methods/user";
import httpClient from "@/services/httpClient";
import { User } from "@/types/User";
import { AxiosError } from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";

const useUserStore = defineStore("user", () => {
    const user = ref<User | null>(null);

    const setUser = (u: User | null) => {
        user.value = u;
    };

    const refreshUser = async () => {
        try {
            await httpClient
                .get("/user")
                .then((res) => toUser(res.data.user))
                .then((u) => {
                    setUser(u);
                });
        } catch (err) {
            if (!(err instanceof AxiosError && err.response?.status === 401)) {
                console.warn("Caught error fetching user", err);
            }
            user.value = null;
        }

        return user.value;
    };

    return {
        user,
        setUser,
        refreshUser,
    };
});

export default useUserStore;
