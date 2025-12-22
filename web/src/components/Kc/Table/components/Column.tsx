import { ElTableColumn, ElTag, ElSwitch } from 'element-plus'
import 'element-plus/es/components/table-column/style/css'
import 'element-plus/es/components/tag/style/css'
import 'element-plus/es/components/switch/style/css'
import { getCurrentInstance, isRef, unref } from 'vue'

export default defineComponent({
  props: {
    column: {
      type: Object,
      required: true,
    },
  },
  setup(props, { slots }) {
    const renderCell = (item: any, scope: any) => {
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
        // 支持 options 为数组、ref、computed
        let optionsArr = []
        if (Array.isArray(item.options)) {
          optionsArr = item.options
        } else if (isRef(item.options)) {
          optionsArr = unref(item.options)
        } else if (item.options && typeof item.options === 'object' && 'value' in item.options) {
          optionsArr = item.options.value
        }
        // 使用宽松匹配，支持数字和字符串的比较
        const option = optionsArr.find((opt: any) => {
          const optValue = opt.value
          const cellValue = value
          // 严格相等匹配
          if (optValue === cellValue) return true
          // 类型转换后匹配（处理数字和字符串的情况）
          if (String(optValue) === String(cellValue)) return true
          if (Number(optValue) === Number(cellValue) && !isNaN(Number(optValue)) && !isNaN(Number(cellValue))) return true
          return false
        })
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
    }

    return () =>
      props.column.show && (
        <ElTableColumn
          {...props.column}
          v-slots={{
            default: (scope: any) => renderCell(props.column, scope),
            header: () => props.column.headerRender?.() || props.column.label,
          }}
        />
      )
  },
})
