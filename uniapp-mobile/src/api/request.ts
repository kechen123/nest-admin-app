import { useAuthStore } from '@/stores/auth';

// 响应数据接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 请求配置接口
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: any;
  header?: Record<string, string>;
  showLoading?: boolean;
  loadingText?: string;
}

// 请求封装
export function request<T = any>(config: RequestConfig): Promise<T> {
  const authStore = useAuthStore();
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

  return new Promise((resolve, reject) => {
    // 显示加载提示
    if (config.showLoading !== false) {
      uni.showLoading({
        title: config.loadingText || '加载中...',
        mask: true,
      });
    }

    // 构建请求头
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.header,
    };

    // 添加 token
    if (authStore.token) {
      header.Authorization = `Bearer ${authStore.token}`;
    }

    // 构建完整 URL
    let url = baseURL + config.url;
    if (config.params && config.method === 'GET') {
      const params = new URLSearchParams(config.params).toString();
      url += (url.includes('?') ? '&' : '?') + params;
    }

    // 发送请求
    uni.request({
      url,
      method: config.method || 'GET',
      data: config.data,
      header,
      success: (res) => {
        // 隐藏加载提示
        if (config.showLoading !== false) {
          uni.hideLoading();
        }

        const response = res.data as ApiResponse<T>;

        // 检查响应状态码
        if (res.statusCode === 200) {
          // 检查业务状态码
          if (response.code === 200) {
            resolve(response.data);
          } else {
            // 业务错误
            uni.showToast({
              title: response.message || '请求失败',
              icon: 'none',
              duration: 2000,
            });

            // 401 未授权，清除 token 并跳转到登录页
            if (response.code === 401) {
              authStore.logout();
              uni.reLaunch({
                url: '/pages/login/login',
              });
            }

            reject(new Error(response.message || '请求失败'));
          }
        } else {
          // HTTP 错误
          let message = '请求失败';
          switch (res.statusCode) {
            case 401:
              message = '未授权，请重新登录';
              authStore.logout();
              uni.reLaunch({
                url: '/pages/login/login',
              });
              break;
            case 403:
              message = '拒绝访问';
              break;
            case 404:
              message = '请求错误，未找到该资源';
              break;
            case 500:
              message = '服务器错误';
              break;
            default:
              message = `连接错误 ${res.statusCode}`;
          }

          uni.showToast({
            title: message,
            icon: 'none',
            duration: 2000,
          });

          reject(new Error(message));
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        if (config.showLoading !== false) {
          uni.hideLoading();
        }

        uni.showToast({
          title: '网络连接失败',
          icon: 'none',
          duration: 2000,
        });

        reject(err);
      },
    });
  });
}

// 便捷方法
export const api = {
  get<T = any>(url: string, params?: any, config?: Partial<RequestConfig>) {
    return request<T>({ ...config, url, method: 'GET', params });
  },
  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return request<T>({ ...config, url, method: 'POST', data });
  },
  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return request<T>({ ...config, url, method: 'PUT', data });
  },
  patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return request<T>({ ...config, url, method: 'PATCH', data });
  },
  delete<T = any>(url: string, config?: Partial<RequestConfig>) {
    return request<T>({ ...config, url, method: 'DELETE' });
  },
};

export default request;
