import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/stores/user";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/Login.vue"),
    meta: {
      title: "登录",
      requiresAuth: false,
    },
  },
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    redirect: "/dashboard",
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/Dashboard.vue"),
        meta: {
          title: "仪表盘",
        },
      },
      {
        path: "user",
        name: "User",
        component: () => import("@/views/user/UserList.vue"),
        meta: {
          title: "用户管理",
        },
      },
      {
        path: "permission",
        name: "Permission",
        component: () => import("@/views/permission/PermissionList.vue"),
        meta: {
          title: "权限管理",
        },
      },
      {
        path: "role",
        name: "Role",
        component: () => import("@/views/role/RoleList.vue"),
        meta: {
          title: "角色管理",
        },
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("@/views/settings/Settings.vue"),
        meta: {
          title: "系统设置",
        },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/Profile.vue"),
        meta: {
          title: "个人中心",
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || "后台管理系统"}`;
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn()) {
      // 未登录，跳转到登录页
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      // 已登录，可以访问
      next();
    }
  } else {
    // 不需要认证的页面
    if (to.path === "/login" && userStore.isLoggedIn()) {
      // 已登录访问登录页，跳转到首页
      next("/");
    } else {
      next();
    }
  }
});

export default router;
