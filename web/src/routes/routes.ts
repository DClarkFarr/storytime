const routes = [
    {
        path: "/",
        component: () => import("../pages/Home.vue"),
        meta: {
            auth: true,
        },
    },
    {
        path: "/register",
        component: () => import("../pages/Register.vue"),
    },
    {
        path: "/:pathMatch(.*)*",
        component: () => import("../pages/NotFound.vue"),
    },
];

export default routes;
