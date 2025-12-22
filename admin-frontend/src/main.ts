import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import App from "./App.vue";
import router from "./router";
import "@/styles/index.scss";
import "@/styles/theme.scss";
import { useAppStore } from "./stores/app";
import { usePermissionStore } from "./stores/permission";

const app = createApp(App);
const pinia = createPinia();

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 初始化主题
const appStore = useAppStore();
appStore.initTheme();

// 初始化权限
const permissionStore = usePermissionStore();
permissionStore.initPermissions();

app.mount("#app");
