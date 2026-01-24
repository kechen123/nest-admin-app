import axios from '@/utils/http/axios'

export const isValueExistsInTree = (tree: any, key: string, value: string): boolean => {
  if (Array.isArray(tree)) {
    return tree.some((node: any) => isValueExistsInTree(node, key, value))
  }

  if (tree && typeof tree === 'object') {
    if (tree[key] === value) {
      return true
    }

    if (Array.isArray(tree.children)) {
      return tree.children.some((child: any) => isValueExistsInTree(child, key, value))
    }
  }

  return false
}

type AnyObject = Record<string, any>
/**
 * 将数组转换为树结构
 * @param data 扁平数组
 * @param idKey 唯一 ID 字段名（默认 "id"）
 * @param parentKey 父级字段名（默认 "parent_id"）
 * @param childrenKey 子节点字段名（默认 "children"）
 * @returns 树形结构数组
 */
export function arrayToTree(
  data: AnyObject[],
  idKey: string = 'id',
  parentKey: string = 'parent_id',
  childrenKey: string = 'children',
): AnyObject[] {
  const result: AnyObject[] = []
  const map = new Map<string, AnyObject>()

  // 创建副本并初始化 map
  data.forEach((item) => {
    const node = { ...item, [childrenKey]: [] }
    map.set(item[idKey], node)
  })

  // 构建树
  data.forEach((item) => {
    const id = item[idKey]
    const parentId = item[parentKey]
    const node = map.get(id)!

    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId)!
      parent[childrenKey].push(node)
    } else {
      result.push(node)
    }
  })
  return result
}

/**
 * 获取后端服务的基础 URL
 * @returns 后端服务的基础 URL（如 http://localhost:3000）
 */
export function getBackendBaseUrl(): string {
  // 开发环境：使用 vite 代理配置的后端地址
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_APP_IMAEG_BASE_URL || ''
  }

  // 生产环境：从环境变量获取，或从 axios baseURL 推断
  const baseAPI = import.meta.env.VITE_APP_IMAEG_BASE_URL

  if (baseAPI.startsWith('http://') || baseAPI.startsWith('https://')) {
    // baseAPI 是完整 URL，提取 origin
    try {
      const url = new URL(baseAPI)
      return url.origin
    } catch {
      // 如果解析失败，尝试提取 origin
      const match = baseAPI.match(/^(https?:\/\/[^/]+)/)
      if (match) {
        return match[1]
      }
    }
  }

  // 如果 baseAPI 是相对路径，使用当前页面的 origin（生产环境通常前后端同域）
  return window.location.origin
}

/**
 * 将相对路径转换为完整 URL（用于预览）
 * @param path 相对路径（如 /uploads/images/xxx.png）
 * @returns 完整 URL（使用后端服务地址）
 */
export function getPreviewUrl(path: string): string {
  if (!path) return ''

  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 如果是相对路径，使用后端服务地址构建完整 URL
  const backendBaseUrl = getBackendBaseUrl()
  return `${backendBaseUrl}${path}`
}

/**
 * 将完整 URL 转换为相对路径（用于提交）
 * @param url 完整 URL 或相对路径
 * @returns 相对路径
 */
export function getRelativePath(url: string): string {
  if (!url) return ''

  // 如果已经是相对路径，直接返回
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url
  }

  // 如果是完整 URL，提取路径部分
  try {
    const urlObj = new URL(url)
    return urlObj.pathname
  } catch {
    // 如果 URL 解析失败，尝试简单提取路径
    const match = url.match(/\/uploads\/.*$/)
    if (match) {
      return match[0]
    }
    return url
  }
}
