/**
 * JWT Token 工具函数
 */

/**
 * 解析 JWT Token（不验证签名，仅解析 payload）
 */
export const parseJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT 解析失败:', error)
    return null
  }
}

/**
 * 检查 token 是否过期
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJWT(token)
  if (!payload || !payload.exp) {
    return true
  }
  
  // exp 是 Unix 时间戳（秒），需要转换为毫秒
  const expirationTime = payload.exp * 1000
  const currentTime = Date.now()
  
  return currentTime >= expirationTime
}

/**
 * 检查 token 是否即将过期（在指定分钟内）
 * @param token JWT token
 * @param minutesBeforeExpiry 过期前多少分钟（默认 5 分钟）
 */
export const isTokenExpiringSoon = (token: string, minutesBeforeExpiry: number = 5): boolean => {
  const payload = parseJWT(token)
  if (!payload || !payload.exp) {
    return true
  }
  
  const expirationTime = payload.exp * 1000
  const currentTime = Date.now()
  const minutesUntilExpiry = (expirationTime - currentTime) / (1000 * 60)
  
  return minutesUntilExpiry <= minutesBeforeExpiry && minutesUntilExpiry > 0
}

/**
 * 获取 token 过期时间
 */
export const getTokenExpirationTime = (token: string): Date | null => {
  const payload = parseJWT(token)
  if (!payload || !payload.exp) {
    return null
  }
  
  return new Date(payload.exp * 1000)
}

/**
 * 获取 token 剩余有效时间（毫秒）
 */
export const getTokenRemainingTime = (token: string): number => {
  const payload = parseJWT(token)
  if (!payload || !payload.exp) {
    return 0
  }
  
  const expirationTime = payload.exp * 1000
  const currentTime = Date.now()
  const remaining = expirationTime - currentTime
  
  return remaining > 0 ? remaining : 0
}

