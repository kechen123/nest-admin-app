/**
 * 表单比较工具函数
 * 用于检测表单数据的变化
 */

/**
 * 深度比较两个值是否相等
 * 将 null/undefined/空字符串视为相等
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  // 规范化值：将 null/undefined/空字符串视为相等
  const normalize = (val: any) => {
    if (val == null || val === '') return ''
    return val
  }

  const normalized1 = normalize(obj1)
  const normalized2 = normalize(obj2)

  if (normalized1 === normalized2) {
    return true
  }

  if (typeof normalized1 !== typeof normalized2) {
    return false
  }

  if (typeof normalized1 !== 'object') {
    return false
  }

  // 如果是数组
  if (Array.isArray(normalized1) && Array.isArray(normalized2)) {
    if (normalized1.length !== normalized2.length) return false
    for (let i = 0; i < normalized1.length; i++) {
      if (!deepEqual(normalized1[i], normalized2[i])) return false
    }
    return true
  }

  // 如果是对象
  const keys1 = Object.keys(normalized1).sort()
  const keys2 = Object.keys(normalized2).sort()

  if (keys1.length !== keys2.length) {
    return false
  }

  if (!keys1.every(key => keys2.includes(key))) {
    return false
  }

  for (const key of keys1) {
    if (!deepEqual(normalized1[key], normalized2[key])) {
      return false
    }
  }

  return true
}

/**
 * 检查表单是否有未保存的修改
 */
export function checkFormChanges(
  formData: Record<string, any>,
  formConfig: any,
  initialSnapshot: Record<string, any> | null
): boolean {
  if (!formData || !formConfig || !initialSnapshot) {
    return false
  }

  // 获取需要比较的字段
  const fieldsToCompare = formConfig.fields?.filter((field: any) => {
    // 密码字段不比较
    if (field.key === 'password') return false

    // 在编辑模式下，username 字段不比较（因为它是 disabled 的）
    if (field.key === 'username' && formData?.id) return false

    // 其他字段都比较（除非明确设置了 compare: false）
    return field.compare !== false
  }) || []

  const compareKeys = fieldsToCompare.map((field: any) => field.key)

  // 只比较配置了 compare 的字段，并且确保两个对象都有这个字段
  const currentData: Record<string, any> = {}
  const initialData: Record<string, any> = {}

  for (const key of compareKeys) {
    if (key in formData && key in initialSnapshot) {
      currentData[key] = formData[key]
      initialData[key] = initialSnapshot[key]
    }
  }

  // 比较表单数据
  return !deepEqual(currentData, initialData)
}
