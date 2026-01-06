import { ElTableColumn, ElTag, ElSwitch } from 'element-plus'
import 'element-plus/es/components/table-column/style/css'
import 'element-plus/es/components/tag/style/css'
import 'element-plus/es/components/switch/style/css'
import { isRef, unref, computed, shallowRef } from 'vue'

export default defineComponent({
  props: {
    column: {
      type: Object,
      required: true,
    },
  },
  setup(props, { slots }) {
    // 缓存选项数组，避免每次渲染都重新计算
    const cachedOptions = computed(() => {
      const item = props.column
      if (!item.options) return []
      
      // 支持 options 为数组、ref、computed
      if (Array.isArray(item.options)) {
        return item.options
      } else if (isRef(item.options)) {
        return unref(item.options)
      } else if (item.options && typeof item.options === 'object' && 'value' in item.options) {
        return item.options.value
      }
      return []
    })

    // 创建选项映射表，提升查找性能（仅当选项数量较多时使用）
    const optionsMap = computed(() => {
      const options = cachedOptions.value
      if (options.length > 10) {
        // 当选项超过10个时，使用 Map 提升查找性能
        const map = new Map()
        options.forEach((opt: any) => {
          const key = String(opt.value)
          if (!map.has(key)) {
            map.set(key, opt)
          }
        })
        return map
      }
      return null
    })

    // 优化的选项查找函数
    const findOption = (value: any, optionsArr: any[], map: Map<string, any> | null) => {
      if (map) {
        // 使用 Map 快速查找
        const opt = map.get(String(value))
        if (opt) return opt
        
        // Map 查找失败，回退到数组查找（处理类型转换情况）
        return optionsArr.find((opt: any) => {
          const optValue = opt.value
          // 严格相等匹配
          if (optValue === value) return true
          // 类型转换后匹配
          if (String(optValue) === String(value)) return true
          if (Number(optValue) === Number(value) && !isNaN(Number(optValue)) && !isNaN(Number(value))) return true
          return false
        })
      }
      
      // 直接数组查找
      return optionsArr.find((opt: any) => {
        const optValue = opt.value
        // 严格相等匹配
        if (optValue === value) return true
        // 类型转换后匹配（处理数字和字符串的情况）
        if (String(optValue) === String(value)) return true
        if (Number(optValue) === Number(value) && !isNaN(Number(optValue)) && !isNaN(Number(value))) return true
        return false
      })
    }

    // 缓存渲染函数，避免每次创建新函数引用
    const cellRenderer = computed(() => {
      const item = props.column
      const optionsArr = cachedOptions.value
      const map = optionsMap.value
      
      return (scope: any) => {
        // 1. 优先检查是否有对应prop的插槽
        if (item.prop && slots[item.prop]) {
          return slots[item.prop]!(scope)
        }
        
        if (item.type === 'text') {
          if (item.formatter) {
            return item.formatter(scope.row, props.column, scope.row[item.prop], scope.$index)
          }
          return scope.row[props.column.prop]
        }
        
        if (item.type === 'tag') {
          const value = scope.row[props.column.prop]
          const option = findOption(value, optionsArr, map)
          
          return (
            <ElTag type={option?.tagType || item.tagType || 'primary'}>
              {option?.label ?? (value !== undefined && value !== null ? String(value) : '-')}
            </ElTag>
          )
        }
        
        if (item.type === 'switch') {
          const prop = props.column.prop
          return <ElSwitch v-model={scope.row[prop]} {...item.options} />
        }
        
        return null
      }
    })

    // 缓存 header 渲染函数
    const headerRenderer = computed(() => {
      return () => props.column.headerRender?.() || props.column.label
    })

    return () =>
      props.column.show !== false && (
        <ElTableColumn
          {...props.column}
          v-slots={{
            default: cellRenderer.value,
            header: headerRenderer.value,
          }}
        />
      )
  },
})