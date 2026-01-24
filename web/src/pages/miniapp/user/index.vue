<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #avatar="{ row }">
      <el-avatar :size="50" shape="square" :src="getPreviewUrl(row.avatar)">
        <el-icon>
          <User />
        </el-icon>
      </el-avatar>
    </template>
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="success" plain size="small" label="查看详情" @click="() => viewDetail(row)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import { miniappApi, type MiniappUser } from '@/api/miniapp'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage } from 'element-plus'
import { getPreviewUrl } from '@/utils/common'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 字典选项
const genderOptions = ref<DictOption[]>([])
const statusOptions = ref<DictOption[]>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    genderOptions.value = await getDictOptions('sys_user_sex')
    statusOptions.value = await getDictOptions('sys_normal_disable')
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

onMounted(() => {
  loadDicts()
})

// 列显示配置
const columnDisplayConfig = {
  hiddenWhenPanelOpen: ['selection', 'avatar', 'actions'],
  alwaysShow: []
}

// 基础列配置
const baseColumns = computed<ColumnProps[]>(() => [
  {
    type: 'selection',
    label: '选择',
    prop: 'selection',
    show: true,
    width: 50,
    align: 'center',
  },
  {
    type: 'text',
    label: 'ID',
    prop: 'id',
    show: true,
    width: 80,
    align: 'center',
  },
  {
    type: 'slot',
    prop: 'avatar',
    label: '头像',
    show: true,
    align: 'center',
    width: 100,
  },
  {
    type: 'text',
    prop: 'nickname',
    align: 'left',
    show: true,
    label: '昵称',
    width: 120,
  },
  {
    type: 'text',
    prop: 'openid',
    align: 'left',
    show: true,
    label: 'OpenID',
    showOverflowTooltip: true,
    width: 200,
  },
  {
    type: 'text',
    prop: 'phone',
    align: 'left',
    show: true,
    label: '手机号',
    width: 120,
    formatter: (row: any) => row.phone || '-'
  },
  {
    type: 'tag',
    prop: 'gender',
    align: 'center',
    label: '性别',
    width: 100,
    show: true,
    options: genderOptions.value.map(opt => ({
      value: Number(opt.value),
      label: opt.label,
      tagType: opt.tagType || 'info'
    }))
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
    prop: 'lastLoginIp',
    align: 'left',
    label: '最后登录IP',
    width: 130,
    formatter: (row: any) => row.lastLoginIp || '-'
  },
  {
    type: 'text',
    prop: 'lastLoginTime',
    align: 'center',
    label: '最后登录时间',
    width: 180,
    formatter: (row: any) => {
      return row.lastLoginTime ? new Date(row.lastLoginTime).toLocaleString('zh-CN') : '-'
    }
  },
  {
    type: 'text',
    prop: 'createdAt',
    align: 'center',
    show: true,
    label: '创建时间',
    width: 180,
    formatter: (row: any) => {
      return row.createdAt ? new Date(row.createdAt).toLocaleString('zh-CN') : '-'
    }
  },
  {
    label: '操作',
    prop: 'actions',
    show: true,
    type: 'slot',
    align: 'center',
    fixed: 'right',
    width: 120
  }
])

// 请求函数
const requestUserList = async (params: any) => {
  const requestParams = {
    ...params,
    pageSize: params.size || params.pageSize || 10,
  }
  delete requestParams.size
  return await miniappApi.getMiniappUserList(requestParams)
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

// 表格配置
const tableConfig: TableConfig = {
  columns: baseColumns,
  request: requestUserList,
  responseAdapter: responseAdapter,
  defaultPagination: { page: 1, size: 10 },
  showPagination: true,
  showLoading: true,
  options: {
    attributes: {
      border: false,
      'row-key': 'id',
      stripe: true,
    },
  }
}

// 工具栏配置
const toolbarConfig = computed(() => ({
  leftButtons: [],
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
}))

const kcConfig = computed<KcConfig>(() => ({
  toolbar: toolbarConfig.value,
  search: {
    fields: [
      {
        key: 'nickname',
        label: '昵称',
        type: 'input' as const,
        placeholder: '请输入昵称',
      },
      {
        key: 'phone',
        label: '手机号',
        type: 'input' as const,
        placeholder: '请输入手机号',
      },
      {
        key: 'status',
        label: '状态',
        type: 'select' as const,
        placeholder: '请选择状态',
        options: statusOptions.value.map((opt: DictOption) => ({
          label: opt.label,
          value: Number(opt.value)
        }))
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

const viewDetail = (row: MiniappUser) => {
  ElMessage.info(`查看用户详情: ${row.nickname || row.id}`)
  // 可以在这里打开详情面板
}
</script>
