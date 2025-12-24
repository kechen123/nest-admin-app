<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="success" plain size="small" :label="'查看详情'" :on-click="() => openDetail(row.id)" />
        <CommonButton type="danger" plain size="small" :label="'删除'" :prevent-double-click="true" :on-click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { loginLogApi, type LoginLog } from '@/api/login-log'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 选中的行数据
const selectedRows = ref<LoginLog[]>([])

// 字典选项
const statusOptions = ref<DictOption[]>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    statusOptions.value = await getDictOptions('sys_login_status')
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

onMounted(() => {
  loadDicts()
})

// 列显示配置
const columnDisplayConfig = {
  hiddenWhenPanelOpen: ['selection', 'actions'],
  alwaysShow: []
}

// 基础列配置
const baseColumns = computed<ColumnProps[]>(() => [
  {
    type: 'text',
    label: 'ID',
    prop: 'id',
    show: true,
    width: 80,
    align: 'center',
  },
  {
    type: 'text',
    prop: 'username',
    align: 'left',
    show: true,
    label: '登录账号',
    width: 120,
  },
  {
    type: 'text',
    prop: 'ipaddr',
    align: 'left',
    show: true,
    label: '登录IP',
    width: 200,
  },
  {
    type: 'text',
    prop: 'loginLocation',
    align: 'left',
    show: true,
    label: '登录地点',
    width: 150,
  },
  {
    type: 'text',
    prop: 'browser',
    align: 'left',
    show: true,
    label: '浏览器',
    width: 150,
  },
  {
    type: 'text',
    prop: 'os',
    align: 'left',
    show: true,
    label: '操作系统',
    width: 150,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'tag',
    show: true,
    align: 'center',
    width: 100,
    options: statusOptions.value.map((opt: DictOption) => ({
      value: Number(opt.value),
      label: opt.label,
      tagType: opt.tagType || (opt.value === '1' ? 'success' : 'danger')
    }))
  },
  {
    type: 'text',
    prop: 'msg',
    align: 'left',
    show: true,
    label: '提示消息',
    width: 200,
    showOverflowTooltip: true,
  },
  {
    type: 'text',
    prop: 'loginTime',
    align: 'center',
    show: true,
    label: '登录时间',
    formatter: (row: any) => {
      return row.loginTime ? new Date(row.loginTime).toLocaleString('zh-CN') : '-'
    }
  },
  {
    label: '操作',
    prop: 'actions',
    show: true,
    type: 'slot',
    align: 'center',
    fixed: 'right',
    width: 180
  }
])

// 请求函数
const requestLoginLogList = async (params: any) => {
  const requestParams = {
    ...params,
    pageSize: params.size || params.pageSize || 10,
  }
  delete requestParams.size
  return await loginLogApi.getLoginLogList(requestParams)
}

// 响应适配器
const responseAdapter = (raw: any, params: any) => {
  return {
    list: raw.list || [],
    total: raw.total || 0,
    page: raw.page || params.page || 1,
    size: raw.pageSize || params.size || 10,
  }
}

const tableConfig: TableConfig = {
  columns: baseColumns,
  request: requestLoginLogList,
  responseAdapter: responseAdapter,
  defaultPagination: { page: 1, size: 10 },
  beforeRequest: (params: any) => {
    const requestParams = {
      ...params,
      pageSize: params.size || params.pageSize || 10,
    }
    delete requestParams.size
    return requestParams
  },
  showPagination: true,
  showLoading: true,
  options: {
    attributes: {
      border: false,
      'row-key': 'id',
      stripe: true,
    },
    events: {
      onSelectionChange: (selection: any[]) => {
        selectedRows.value = selection
      },
    }
  }
}

// 工具栏配置
const toolbarConfig = computed(() => {
  const leftButtons = []

  // 批量删除按钮
  if (selectedRows.value.length > 0) {
    leftButtons.push({
      key: 'batchDelete',
      label: `批量删除${selectedRows.value.length > 0 ? `(${selectedRows.value.length})` : ''}`,
      type: 'danger' as const,
      disabled: selectedRows.value.length === 0,
      onClick: async () => {
        try {
          await ElMessageBox.confirm(
            `确定要删除选中的 ${selectedRows.value.length} 条日志吗？`,
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          )

          const ids = selectedRows.value.map(log => log.id)
          await loginLogApi.deleteLoginLogBatch(ids)

          ElMessage.success('批量删除成功')
          selectedRows.value = []
          await tableRef.value?.refresh()
        } catch (error) {
          if (error !== 'cancel') {
            ElMessage.error('批量删除失败')
          }
        }
      }
    })
  }

  return {
    leftButtons,
    rightButtons: [
      {
        key: 'refresh',
        label: '刷新',
        type: 'info' as const,
        icon: 'Refresh',
        onClick: async () => {
          await tableRef.value?.refresh()
          ElMessage.success('刷新成功')
        }
      }
    ]
  }
})

const kcConfig = computed<KcConfig>(() => ({
  toolbar: toolbarConfig.value,
  search: {
    fields: [
      {
        key: 'username',
        label: '登录账号',
        type: 'input' as const,
        placeholder: '请输入登录账号',
      },
      {
        key: 'ipaddr',
        label: '登录IP',
        type: 'input' as const,
        placeholder: '请输入登录IP',
      },
      {
        key: 'status',
        label: '状态',
        type: 'select' as const,
        placeholder: '请选择状态',
        options: statusOptions.value.map(opt => ({
          label: opt.label,
          value: Number(opt.value)
        }))
      },
      {
        key: 'startTime',
        label: '开始时间',
        type: 'datetime' as const,
        placeholder: '请选择开始时间',
      },
      {
        key: 'endTime',
        label: '结束时间',
        type: 'datetime' as const,
        placeholder: '请选择结束时间',
      },
    ],
    defaultCount: 2,
    fieldWidth: '250px',
    showSearch: true,
    showReset: true
  },
  table: tableConfig
}))

const tableRef = ref()

const openDetail = async (id: number) => {
  try {
    const log = await loginLogApi.getLoginLogById(id)
    ElMessageBox.alert(
      `
        <div style="text-align: left;">
          <p><strong>登录账号：</strong>${log.username || '-'}</p>
          <p><strong>登录IP：</strong>${log.ipaddr || '-'}</p>
          <p><strong>登录地点：</strong>${log.loginLocation || '-'}</p>
          <p><strong>浏览器：</strong>${log.browser || '-'}</p>
          <p><strong>操作系统：</strong>${log.os || '-'}</p>
          <p><strong>状态：</strong>${log.status === 1 ? '成功' : '失败'}</p>
          <p><strong>提示消息：</strong>${log.msg || '-'}</p>
          <p><strong>登录时间：</strong>${log.loginTime ? new Date(log.loginTime).toLocaleString('zh-CN') : '-'}</p>
        </div>
      `,
      '登录日志详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭',
      }
    )
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该日志吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await loginLogApi.deleteLoginLog(id)
    ElMessage.success('删除成功')
    await tableRef.value?.refresh()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<route>
{
  meta: {
    title: '登录日志',
    requiresAuth: true,
    permissions: ['monitor:logininfor:list']
  }
}
</route>
