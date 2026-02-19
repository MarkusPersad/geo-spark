import "@/style.css";
import "vue-sonner/style.css";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "@/lib";
import { createPinia } from "pinia";
createApp(App).
    use(router()!).
    use(createPinia()).
    mount("#app");
