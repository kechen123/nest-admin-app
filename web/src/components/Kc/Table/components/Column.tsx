import { ElTableColumn, ElTag, ElSwitch } from 'element-plus'
import 'element-plus/es/components/table-column/style/css'
import 'element-plus/es/components/tag/style/css'
import 'element-plus/es/components/switch/style/css'
import { getCurrentInstance } from 'vue'

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
        } else if (item.options && typeof item.options === 'object' && 'value' in item.options) {
          optionsArr = item.options.value
        }
        const option = optionsArr.find((opt: any) => opt.value === value)
        return (
          <ElTag type={option?.tagType || item.tagType || 'primary'}>
            {option?.label ?? value}
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
