const routes = [
    {
        path: "/",
        component: () => import("../pages/Home.vue"),
        meta: {
            auth: true,
        },
        name: "home",
    },
    {
        path: "/story/:id",
        meta: {
            auth: true,
        },
        name: "story.edit",
        component: () => import("../pages/EditStory.vue"),
    },
    {
        path: "/register",
        component: () => import("../pages/Register.vue"),
        name: "register",
    },
    {
        path: "/login",
        component: () => import("../pages/Login.vue"),
        name: "login",
    },
    {
        path: "/:pathMatch(.*)*",
        component: () => import("../pages/NotFound.vue"),
    },
];

export default routes;
