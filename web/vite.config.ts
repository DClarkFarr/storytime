import { defineConfig, loadEnv } from "vite";
import Vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "url";
import Icons from "unplugin-icons/vite";

// https://vitejs.dev/config/

export default ({ mode }) => {
    const env = loadEnv(mode, ".");

    console.log("loaded env", env);

    return defineConfig({
        plugins: [
            Vue({}),
            Icons({
                compiler: "vue3",
            }),
        ],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
    });
};
