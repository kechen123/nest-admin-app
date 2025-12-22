export type TableColumn = {
  label: string
  prop: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  fixed?: 'left' | 'right'
  slot?: string
  hideInCompact?: boolean
  formatter?: (row: any, col: any, value: any) => string
}

export const userTableColumns: TableColumn[] = [
  { label: 'ID', prop: 'id', width: 60, fixed: 'left' },
  { label: '用户名', prop: 'username', width: 120 },
  { label: '邮箱', prop: 'email', width: 200 },
  { label: '手机号', prop: 'phone', width: 140 },
  { label: '状态', prop: 'status', width: 100, slot: 'statusSwitch', sortable: true },
  { label: 'VIP', prop: 'is_vip', width: 100, slot: 'vipSwitch' },
  { label: '部门', prop: 'department', width: 100 },
  { label: '职位', prop: 'position', width: 120 },
  { label: '标签', prop: 'tags', width: 160, slot: 'tagSlot' },
  { label: '注册时间', prop: 'created_at', width: 180, sortable: true },
  {
    label: '操作',
    prop: 'actions',
    width: 160,
    slot: 'actions',
    fixed: 'right',
    hideInCompact: true,
  },
]
