import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessage, ElLoading } from "element-plus";
import { useUserStore } from "@/stores/user";

// 响应数据接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const userStore = useUserStore();
    // 添加 token
    if (userStore.token && config.headers) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;

    // 如果 code 不是 200，则视为错误
    if (res.code !== 200) {
      // 检查是否是登录接口，登录接口的错误由登录页面自己处理
      const isLoginRequest = response.config.url?.includes("/auth/login") || response.config.url?.includes("/login");

      if (!isLoginRequest) {
        ElMessage.error(res.message || "请求失败");
      }

      // 401 未授权，清除 token 并跳转到登录页
      if (res.code === 401) {
        const userStore = useUserStore();
        userStore.logout();
        // 这里可以添加路由跳转到登录页
        // router.push('/login');
      }

      return Promise.reject(new Error(res.message || "请求失败"));
    }

    return res.data;
  },
  (error) => {
    console.error("响应错误:", error);

    // 检查是否是登录接口，登录接口的错误由登录页面自己处理
    const isLoginRequest = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/login");

    let message = "请求失败";
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = "未授权，请重新登录";
          // 登录接口的401错误不在这里处理，由登录页面处理
          if (!isLoginRequest) {
            const userStore = useUserStore();
            userStore.logout();
          }
          break;
        case 403:
          message = "拒绝访问";
          break;
        case 404:
          message = "请求错误，未找到该资源";
          break;
        case 500:
          message = "服务器错误";
          break;
        default:
          message = error.response.data?.message || `连接错误${error.response.status}`;
      }
    } else if (error.request) {
      message = "网络连接失败";
    }

    // 登录接口的错误不显示全局提示，由登录页面自己处理
    if (!isLoginRequest) {
      ElMessage.error(message);
    }

    return Promise.reject(error);
  }
);

export default service;
