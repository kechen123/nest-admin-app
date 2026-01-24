<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #images="{ row }">
      <div class="images-container" v-if="row.images && row.images.length > 0">
        <el-image v-for="(img, index) in row.images.slice(0, 3)" :key="index" :src="getPreviewUrl(img)"
          :preview-src-list="row.images.map(img => getPreviewUrl(img))" fit="cover"
          style="width: 60px; height: 60px; border-radius: 4px; margin-right: 4px;" :preview-teleported="true" />
        <span v-if="row.images.length > 3" class="more-images">+{{ row.images.length - 3 }}</span>
      </div>
      <span v-else style="color: #999;">-</span>
    </template>
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton v-if="row.auditStatus === 0" type="success" plain size="small" label="通过"
          @click="() => handleAudit(row.id, 1)" />
        <CommonButton v-if="row.auditStatus === 0" type="warning" plain size="small" label="拒绝"
          @click="() => handleAudit(row.id, 2)" />
        <CommonButton type="danger" plain size="small" label="删除" @click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>

  <!-- 审核对话框 -->
  <el-dialog v-model="auditDialogVisible" :title="auditDialogTitle" width="500px">
    <el-form :model="auditForm" label-width="100px">
      <el-form-item label="审核状态">
        <el-radio-group v-model="auditForm.auditStatus">
          <el-radio :label="1">通过</el-radio>
          <el-radio :label="2">拒绝</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="审核备注">
        <el-input v-model="auditForm.auditRemark" type="textarea" :rows="4" placeholder="请输入审核备注（可选）" maxlength="500"
          show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="auditDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmAudit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { miniappApi, type CheckinRecord, type AuditCheckinDto } from '@/api/miniapp'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPreviewUrl } from '@/utils/common'

// 列显示配置
const columnDisplayConfig = {
  hiddenWhenPanelOpen: ['selection', 'images', 'content', 'actions'],
  alwaysShow: []
}

// 审核状态选项
const auditStatusOptions = [
  { label: '待审核', value: 0, tagType: 'warning' },
  { label: '已通过', value: 1, tagType: 'success' },
  { label: '已拒绝', value: 2, tagType: 'danger' },
]

// 状态选项
const statusOptions = [
  { label: '已删除', value: 0, tagType: 'danger' },
  { label: '正常', value: 1, tagType: 'success' },
]

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
    type: 'text',
    prop: 'user',
    align: 'left',
    show: true,
    label: '用户',
    width: 120,
    formatter: (row: any) => {
      return row.user?.nickname || `用户${row.userId}` || '-'
    }
  },
  {
    type: 'text',
    prop: 'address',
    align: 'left',
    show: true,
    label: '地址',
    showOverflowTooltip: true,
    width: 200,
  },
  {
    type: 'text',
    prop: 'content',
    align: 'left',
    show: true,
    label: '内容',
    showOverflowTooltip: true,
    width: 200,
    formatter: (row: any) => row.content || '-'
  },
  {
    type: 'slot',
    prop: 'images',
    label: '图片',
    show: true,
    align: 'center',
    width: 220,
  },
  {
    type: 'tag',
    prop: 'auditStatus',
    align: 'center',
    label: '审核状态',
    width: 120,
    show: true,
    options: auditStatusOptions.map(opt => ({
      value: opt.value,
      label: opt.label,
      tagType: opt.tagType
    }))
  },
  {
    type: 'text',
    prop: 'auditRemark',
    align: 'left',
    show: true,
    label: '审核备注',
    showOverflowTooltip: true,
    width: 150,
    formatter: (row: any) => row.auditRemark || '-'
  },
  {
    type: 'text',
    prop: 'auditTime',
    align: 'center',
    label: '审核时间',
    width: 180,
    formatter: (row: any) => {
      return row.auditTime ? new Date(row.auditTime).toLocaleString('zh-CN') : '-'
    }
  },
  {
    type: 'tag',
    prop: 'status',
    align: 'center',
    label: '状态',
    width: 100,
    show: true,
    options: statusOptions.map(opt => ({
      value: opt.value,
      label: opt.label,
      tagType: opt.tagType
    }))
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
    width: 200
  }
])

// 请求函数
const requestCheckinList = async (params: any) => {
  const requestParams = {
    ...params,
    pageSize: params.size || params.pageSize || 10,
  }
  delete requestParams.size
  return await miniappApi.getCheckinList(requestParams)
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
  request: requestCheckinList,
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
        key: 'userNickname',
        label: '用户昵称',
        type: 'input' as const,
        placeholder: '请输入用户昵称',
      },
      {
        key: 'auditStatus',
        label: '审核状态',
        type: 'select' as const,
        placeholder: '请选择审核状态',
        options: auditStatusOptions.map(opt => ({
          label: opt.label,
          value: opt.value
        }))
      },
      {
        key: 'status',
        label: '状态',
        type: 'select' as const,
        placeholder: '请选择状态',
        options: statusOptions.map(opt => ({
          label: opt.label,
          value: opt.value
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

// 审核相关
const auditDialogVisible = ref(false)
const auditDialogTitle = ref('审核打卡记录')
const currentCheckinId = ref<number | null>(null)
const auditForm = ref<AuditCheckinDto>({
  auditStatus: 1,
  auditRemark: '',
})

const handleAudit = (id: number, status: number) => {
  currentCheckinId.value = id
  auditForm.value = {
    auditStatus: status,
    auditRemark: '',
  }
  auditDialogTitle.value = status === 1 ? '审核通过' : '审核拒绝'
  auditDialogVisible.value = true
}

const confirmAudit = async () => {
  if (!currentCheckinId.value) return

  try {
    await miniappApi.auditCheckin(currentCheckinId.value, auditForm.value)
    ElMessage.success('审核成功')
    auditDialogVisible.value = false
    await tableRef.value?.refresh()
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该打卡记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await miniappApi.deleteCheckin(id)
    ElMessage.success('删除成功')
    await tableRef.value?.refresh()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.images-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.more-images {
  display: inline-block;
  width: 60px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-size: 12px;
}
</style>
