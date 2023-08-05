import { createRouter, createWebHistory } from "vue-router";

import routes from "./routes";
import useUserStore from "@/stores/useUserStore";

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
});

router.isReady().then(() => {
    const user = useUserStore();
    user.refreshUser();
});
router.beforeEach(async (to, from, next) => {
    const user = useUserStore();
    const getOrLoadUser = async () => {
        return user.user || user.refreshUser();
    };
    if (to.meta.auth) {
        const me = await getOrLoadUser();
        if (!me) {
            return next({ name: "login" });
        }
    }
    next();
});

export default router;
