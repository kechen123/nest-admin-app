// 本地存储工具函数

const STORAGE_PREFIX = "admin_";

/**
 * 设置本地存储
 * @param key 键名
 * @param value 值
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedValue);
  } catch (error) {
    console.error("设置本地存储失败:", error);
  }
}

/**
 * 获取本地存储
 * @param key 键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function getStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (item === null) {
      return defaultValue ?? null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error("获取本地存储失败:", error);
    return defaultValue ?? null;
  }
}

/**
 * 删除本地存储
 * @param key 键名
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error("删除本地存储失败:", error);
  }
}

/**
 * 清空所有本地存储
 */
export function clearStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("清空本地存储失败:", error);
  }
}

/**
 * 设置会话存储
 * @param key 键名
 * @param value 值
 */
export function setSessionStorage<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedValue);
  } catch (error) {
    console.error("设置会话存储失败:", error);
  }
}

/**
 * 获取会话存储
 * @param key 键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function getSessionStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (item === null) {
      return defaultValue ?? null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error("获取会话存储失败:", error);
    return defaultValue ?? null;
  }
}

/**
 * 删除会话存储
 * @param key 键名
 */
export function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error("删除会话存储失败:", error);
  }
}
