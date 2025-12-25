<template>
  <div class="detail-container">
    <div class="content">
      <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
      </KcForm>

      <el-divider>余额和积分管理</el-divider>

      <el-form :model="adjustForm" label-width="120px" style="margin-top: 20px;">
        <el-form-item label="调整余额">
          <el-inputNumber v-model="adjustForm.balanceAmount" :precision="2" :step="10" :min="-999999.99"
            :max="999999.99" style="width: 200px;" :disabled="type === 'view'" />
          <el-input v-model="adjustForm.balanceRemark" placeholder="备注（可选）" style="width: 200px; margin-left: 10px;"
            :disabled="type === 'view'" />
          <el-button type="primary" @click="handleAdjustBalance" :disabled="type === 'view'" style="margin-left: 10px;">
            调整余额
          </el-button>
        </el-form-item>
        <el-form-item label="调整积分">
          <el-inputNumber v-model="adjustForm.pointsAmount" :step="10" :min="-999999" :max="999999"
            style="width: 200px;" :disabled="type === 'view'" />
          <el-input v-model="adjustForm.pointsRemark" placeholder="备注（可选）" style="width: 200px; margin-left: 10px;"
            :disabled="type === 'view'" />
          <el-button type="primary" @click="handleAdjustPoints" :disabled="type === 'view'" style="margin-left: 10px;">
            调整积分
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 固定的 Footer -->
    <div class="footer">
      <div class="footer-actions">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="onSubmit(formData)" v-if="type !== 'view'">
          保存
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { miniappUserApi, type MiniappUser, type UpdateMiniappUserDto } from '@/api/mall/miniapp-user'
import { ElMessage, ElMessageBox } from 'element-plus'
import KcForm from '@/components/Kc/Form/index.vue'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<MiniappUser & UpdateMiniappUserDto>>({
  nickname: '',
  phone: '',
  status: 1,
  memberLevel: 0,
})

const adjustForm = ref({
  balanceAmount: 0,
  balanceRemark: '',
  pointsAmount: 0,
  pointsRemark: '',
})

const type = ref<'edit' | 'view' | 'create'>('view')
const formRef = ref()

const formConfig = computed(() => ({
  fields: [
    {
      key: 'nickname',
      label: '昵称',
      type: 'input' as const,
      placeholder: '请输入昵称',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'phone',
      label: '手机号',
      type: 'input' as const,
      placeholder: '请输入手机号',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '禁用', value: 0 },
        { label: '正常', value: 1 },
      ],
      placeholder: '请选择状态',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'memberLevel',
      label: '会员等级',
      type: 'select' as const,
      options: [
        { label: '普通', value: 0 },
        { label: '银卡', value: 1 },
        { label: '金卡', value: 2 },
        { label: '钻石', value: 3 },
      ],
      placeholder: '请选择会员等级',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'balance',
      label: '余额',
      type: 'input' as const,
      placeholder: '',
      width: 240,
      disabled: true,
    },
    {
      key: 'points',
      label: '积分',
      type: 'input' as const,
      placeholder: '',
      width: 240,
      disabled: true,
    },
    {
      key: 'totalConsumption',
      label: '累计消费',
      type: 'input' as const,
      placeholder: '',
      width: 240,
      disabled: true,
    },
  ],
  labelWidth: '120px',
  fieldWidth: 250,
}))

const onSubmit = async (data: any) => {
  try {
    if (type.value === 'view') {
      close?.()
      return
    }

    if (data.id) {
      // 更新用户
      const updateData: UpdateMiniappUserDto = {
        nickname: data.nickname,
        phone: data.phone,
        status: data.status !== undefined ? data.status : 1,
        memberLevel: data.memberLevel ?? 0,
      }
      await miniappUserApi.updateMiniappUser(data.id, updateData)
      ElMessage.success('更新成功')
    }

    await close?.(true)
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const onReset = () => {
  formData.value = {
    nickname: '',
    phone: '',
    status: 1,
    memberLevel: 0,
  }
}

// 调整余额
const handleAdjustBalance = async () => {
  try {
    if (!formData.value.id) return
    if (adjustForm.value.balanceAmount === 0) {
      ElMessage.warning('请输入调整金额')
      return
    }

    await ElMessageBox.confirm(
      `确定要${adjustForm.value.balanceAmount > 0 ? '增加' : '减少'}余额 ¥${Math.abs(adjustForm.value.balanceAmount)} 吗？`,
      '提示',
      {
        type: 'warning',
      }
    )

    await miniappUserApi.adjustBalance(
      formData.value.id,
      adjustForm.value.balanceAmount,
      adjustForm.value.balanceRemark
    )
    ElMessage.success('调整成功')

    // 重新加载用户数据
    await loadUserData()

    // 清空调整表单
    adjustForm.value.balanceAmount = 0
    adjustForm.value.balanceRemark = ''
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '调整失败')
    }
  }
}

// 调整积分
const handleAdjustPoints = async () => {
  try {
    if (!formData.value.id) return
    if (adjustForm.value.pointsAmount === 0) {
      ElMessage.warning('请输入调整积分')
      return
    }

    await ElMessageBox.confirm(
      `确定要${adjustForm.value.pointsAmount > 0 ? '增加' : '减少'}积分 ${Math.abs(adjustForm.value.pointsAmount)} 吗？`,
      '提示',
      {
        type: 'warning',
      }
    )

    await miniappUserApi.adjustPoints(
      formData.value.id,
      adjustForm.value.pointsAmount,
      adjustForm.value.pointsRemark
    )
    ElMessage.success('调整成功')

    // 重新加载用户数据
    await loadUserData()

    // 清空调整表单
    adjustForm.value.pointsAmount = 0
    adjustForm.value.pointsRemark = ''
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '调整失败')
    }
  }
}

// 加载用户数据
const loadUserData = async () => {
  if (formData.value.id) {
    try {
      const res = await miniappUserApi.getMiniappUserById(formData.value.id)
      const user = res as any as MiniappUser
      formData.value = {
        ...formData.value,
        ...user,
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载用户信息失败')
    }
  }
}

const init = async (data: any) => {
  const { id, mode } = data || {}
  type.value = mode || (id ? 'edit' : 'view')

  if (id) {
    try {
      const res = await miniappUserApi.getMiniappUserById(id)
      const user = res as any as MiniappUser

      formData.value = {
        ...user,
        status: user.status !== undefined ? user.status : 1,
        memberLevel: user.memberLevel ?? 0,
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载用户信息失败')
    }
  }
}

defineExpose({ init })
</script>

<style scoped lang="less">
.detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content {
  flex: 1;
  overflow: auto;
}

.footer {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
  display: flex;
  justify-content: flex-start;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
