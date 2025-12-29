<template>
  <div class="detail-container">
    <div class="content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
          </KcForm>
        </el-tab-pane>
        <el-tab-pane label="菜单权限" name="menus" v-if="type !== 'add'">
          <div class="menu-permission-container">
            <el-tree ref="menuTreeRef" :data="menuTreeData" :props="{ children: 'children', label: 'title' }"
              show-checkbox node-key="id" :default-checked-keys="checkedMenuIds" :default-expand-all="false"
              check-strictly>
              <template #default="{ data }">
                <span class="tree-node">
                  <el-icon v-if="data.icon && data.icon !== '#'" style="margin-right: 4px;">
                    <MIcon :iconName="data.icon" />
                  </el-icon>
                  <span>{{ data.title || data.name }}</span>
                  <el-tag v-if="data.menuType === 'F'" size="small" type="warning" style="margin-left: 8px;">按钮</el-tag>
                </span>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 固定的 Footer -->
    <div class="footer">
      <div class="footer-actions">
        <el-button @click="close">关闭</el-button>
        <CommonButton v-if="type !== 'view'" type="primary" :label="formData.id ? '保存' : '创建'"
          :prevent-double-click="true" @click="() => onSubmit(formData)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { roleApi, type Role } from '@/api/role'
import { getMenuTree, type BackendMenu } from '@/api/sys_menu'
import { ElMessage } from 'element-plus'
import KcForm from '@/components/Kc/Form/index.vue'
import MIcon from '@/components/mIcon.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  success: []
}>()

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<Role & { menuIds?: number[] }>>({
  name: '',
  code: '',
  dataScope: '1',
  orderNum: 0,
  status: 1,
  remark: '',
  menuIds: [],
})

const type = ref<'add' | 'edit' | 'view'>('edit')
const formRef = ref()
const menuTreeRef = ref()
const activeTab = ref('basic')

// 菜单树数据
const menuTreeData = ref<BackendMenu[]>([])
const checkedMenuIds = ref<number[]>([])

// 字典选项
const statusOptions = ref<DictOption[]>([])
const dataScopeOptions = ref<DictOption[]>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    statusOptions.value = await getDictOptions('sys_normal_disable')
    dataScopeOptions.value = [
      { label: '全部数据', value: '1' },
      { label: '自定义数据', value: '2' },
      { label: '本部门数据', value: '3' },
      { label: '本部门及以下数据', value: '4' },
      { label: '仅本人数据', value: '5' },
    ]
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 加载菜单树
const loadMenuTree = async () => {
  try {
    const res = await getMenuTree()
    menuTreeData.value = (res as any) || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载菜单树失败')
  }
}

// 初始化数据
const init = async (data: any) => {
  const { id, mode } = data || {}
  type.value = mode || (id ? 'edit' : 'add')

  await loadDicts()
  await loadMenuTree()

  if (id) {
    try {
      const res = await roleApi.getRoleById(id)
      const role = res as any as Role

      formData.value = {
        id: role.id,
        name: role.name || '',
        code: role.code || '',
        dataScope: role.dataScope || '1',
        orderNum: role.orderNum ?? 0,
        status: role.status !== undefined ? role.status : 1,
        remark: role.remark || '',
        menuIds: [],
      }

      // 设置已选中的菜单ID
      if (role.menus && Array.isArray(role.menus)) {
        if (role.menus.length > 0 && typeof role.menus[0] === 'object') {
          checkedMenuIds.value = (role.menus as any[]).map((m: any) => m.id || m)
        } else {
          checkedMenuIds.value = role.menus as number[]
        }
        formData.value.menuIds = checkedMenuIds.value
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载角色信息失败')
    }
  } else {
    // 新增模式，重置表单
    formData.value = {
      name: '',
      code: '',
      dataScope: '1',
      orderNum: 0,
      status: 1,
      remark: '',
      menuIds: [],
    }
    checkedMenuIds.value = []
  }
}

const formConfig = reactive({
  fieldWidth: 350,
  fields: [
    {
      key: 'name',
      label: '角色名称',
      type: 'input' as const,
      placeholder: '请输入角色名称',
      rules: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'code',
      label: '角色代码',
      type: 'input' as const,
      placeholder: '请输入角色代码',
      rules: [{ required: true, message: '请输入角色代码', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'dataScope',
      label: '数据范围',
      type: 'select' as const,
      options: dataScopeOptions,
      placeholder: '请选择数据范围',
      rules: [{ required: true, message: '请选择数据范围', trigger: 'change' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'orderNum',
      label: '显示顺序',
      type: 'input' as const,
      placeholder: '请输入显示顺序',
      inputType: 'number',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: statusOptions,
      placeholder: '请选择状态',
      rules: [{ required: true, message: '请选择状态', trigger: 'change' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'remark',
      label: '备注',
      type: 'textarea' as const,
      placeholder: '请输入备注',
      disabled: computed(() => type.value === 'view'),
    },
  ],
})

// 提交表单
const onSubmit = async (data: any) => {
  try {
    // 获取选中的菜单ID
    let menuIds: number[] = []
    if (menuTreeRef.value) {
      const checkedKeys = menuTreeRef.value.getCheckedKeys()
      const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
      // 合并全选和半选的节点
      menuIds = [...checkedKeys, ...halfCheckedKeys] as number[]
    }

    // 排除 id 字段，因为 DTO 中不允许
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...restData } = data
    const submitData = {
      ...restData,
      menuIds: menuIds.length > 0 ? menuIds : undefined,
    }

    if (formData.value.id) {
      await roleApi.updateRole(formData.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await roleApi.createRole(submitData)
      ElMessage.success('创建成功')
    }

    emit('success')
    close?.(true)
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 重置表单
const onReset = () => {
  init({ id: formData.value.id, mode: type.value })
}

// 暴露 init 方法供 SlideContainer 调用
defineExpose({ init })
</script>

<style scoped lang="less">
.detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .content {
    flex: 1;
    overflow-y: auto;

    .menu-permission-container {
      padding: 20px;
      min-height: 400px;
      max-height: 600px;
      overflow-y: auto;

      .tree-node {
        display: flex;
        align-items: center;
        flex: 1;
      }
    }
  }

  .footer {
    border-top: 1px solid var(--el-border-color);
    padding: 16px 20px;
    background-color: var(--el-bg-color);
    flex-shrink: 0;

    .footer-actions {
      display: flex;
      justify-content: flex-start;
      gap: 12px;
    }
  }
}
</style>
