import "vue-final-modal/style.css";
import "./assets/main.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVfm } from "vue-final-modal";

import App from "./App.vue";
import router from "./routes";

const pinia = createPinia();
const vmf = createVfm();

const app = createApp(App);

app.use(vmf);
app.use(pinia);
app.use(router);
app.mount("#app");
