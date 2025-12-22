// 应用全局状态管理
import { defineStore } from "pinia";
import { ref } from "vue";
import { getStorage, setStorage } from "@/utils/storage";

export type ThemeMode = "light" | "dark";
export type LayoutMode = "side" | "top" | "mix";

export const useAppStore = defineStore("app", () => {
  // 主题模式
  const theme = ref<ThemeMode>((getStorage<ThemeMode>("theme") as ThemeMode) || "light");

  // 布局模式
  const layoutMode = ref<LayoutMode>((getStorage<LayoutMode>("layoutMode") as LayoutMode) || "side");

  // 侧边栏折叠状态
  const sidebarCollapsed = ref<boolean>(getStorage<boolean>("sidebarCollapsed") ?? false);

  // 设置主题
  function setTheme(mode: ThemeMode) {
    theme.value = mode;
    setStorage("theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }

  // 设置布局模式
  function setLayoutMode(mode: LayoutMode) {
    layoutMode.value = mode;
    setStorage("layoutMode", mode);
  }

  // 切换侧边栏折叠状态
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    setStorage("sidebarCollapsed", sidebarCollapsed.value);
  }

  // 设置侧边栏折叠状态
  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed;
    setStorage("sidebarCollapsed", collapsed);
  }

  // 初始化主题
  function initTheme() {
    document.documentElement.setAttribute("data-theme", theme.value);
  }

  return {
    theme,
    layoutMode,
    sidebarCollapsed,
    setTheme,
    setLayoutMode,
    toggleSidebar,
    setSidebarCollapsed,
    initTheme,
  };
});
