import { dictApi, type DictOption } from '@/api/dict'

// 字典缓存
const dictCache = new Map<string, DictOption[]>()

/**
 * 获取字典选项（带缓存）
 * @param dictType 字典类型
 * @param forceRefresh 是否强制刷新缓存
 */
export async function getDictOptions(
  dictType: string,
  forceRefresh = false,
): Promise<DictOption[]> {
  // 如果缓存中存在且不强制刷新，直接返回缓存
  if (!forceRefresh && dictCache.has(dictType)) {
    return dictCache.get(dictType)!
  }

  try {
    const options = await dictApi.getDictOptions(dictType)
    // 缓存结果
    dictCache.set(dictType, options)
    return options
  } catch (error) {
    console.error(`获取字典 ${dictType} 失败:`, error)
    // 如果请求失败，返回空数组
    return []
  }
}

/**
 * 清除指定字典类型的缓存
 */
export function clearDictCache(dictType?: string) {
  if (dictType) {
    dictCache.delete(dictType)
  } else {
    dictCache.clear()
  }
}

/**
 * 根据字典值获取标签
 */
export function getDictLabel(
  dictType: string,
  value: string | number,
  options?: DictOption[],
): string {
  const dictOptions = options || dictCache.get(dictType) || []
  const option = dictOptions.find((opt) => opt.value === String(value))
  return option?.label || String(value)
}

/**
 * 预加载常用字典
 */
export async function preloadCommonDicts() {
  const commonDictTypes = ['sys_user_sex', 'sys_normal_disable']
  await Promise.all(commonDictTypes.map((type) => getDictOptions(type)))
}
