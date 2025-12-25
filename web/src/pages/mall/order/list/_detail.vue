<template>
  <div class="detail-container">
    <div class="content">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ orderData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusTagType(orderData.status)">{{ getStatusText(orderData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户昵称">{{ orderData.user?.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户电话">{{ orderData.user?.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="商品总金额">¥{{ orderData.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="运费">¥{{ orderData.shippingFee }}</el-descriptions-item>
        <el-descriptions-item label="优惠金额">¥{{ orderData.discountAmount }}</el-descriptions-item>
        <el-descriptions-item label="实付金额">
          <span style="color: #f56c6c; font-weight: bold;">¥{{ orderData.payAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          <el-tag :type="getPayTypeTagType(orderData.payType)">{{ getPayTypeText(orderData.payType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ orderData.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{ orderData.shipTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="确认收货时间">{{ orderData.confirmTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货人姓名">{{ orderData.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="收货人电话">{{ orderData.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ orderData.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="订单备注" :span="2">{{ orderData.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ orderData.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ orderData.updatedAt }}</el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px;">
        <h3>订单商品</h3>
        <el-table :data="orderData.items || []" border>
          <el-table-column prop="productName" label="商品名称" width="200" />
          <el-table-column prop="specName" label="规格" width="150" />
          <el-table-column prop="price" label="单价" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="subtotal" label="小计" width="120" align="right">
            <template #default="{ row }">
              ¥{{ row.subtotal }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 固定的 Footer -->
    <div class="footer">
      <div class="footer-actions">
        <el-button @click="close">关闭</el-button>
        <el-button 
          v-if="orderData.status === 1" 
          type="primary" 
          @click="handleShip"
        >
          发货
        </el-button>
        <el-button 
          v-if="orderData.status === 0 || orderData.status === 1" 
          type="warning" 
          @click="handleCancel"
        >
          取消订单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { orderApi, type Order } from '@/api/mall/order'
import { ElMessage, ElMessageBox } from 'element-plus'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const orderData = ref<Order>({
  id: 0,
  orderNo: '',
  userId: 0,
  status: 0,
  totalAmount: 0,
  shippingFee: 0,
  discountAmount: 0,
  payAmount: 0,
  addressId: 0,
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  payType: 0,
  items: [],
})

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '已取消',
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'warning',
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'danger',
  }
  return typeMap[status] || 'info'
}

const getPayTypeText = (payType: number) => {
  const typeMap: Record<number, string> = {
    0: '未支付',
    1: '微信支付',
    2: '余额支付',
  }
  return typeMap[payType] || '未知'
}

const getPayTypeTagType = (payType: number) => {
  const typeMap: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'primary',
  }
  return typeMap[payType] || 'info'
}

// 发货
const handleShip = async () => {
  try {
    await ElMessageBox.confirm('确定要发货吗？', '提示', {
      type: 'warning',
    })
    await orderApi.shipOrder(orderData.value.id)
    ElMessage.success('发货成功')
    await close?.(true)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发货失败')
    }
  }
}

// 取消订单
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning',
    })
    await orderApi.cancelOrder(orderData.value.id)
    ElMessage.success('取消成功')
    await close?.(true)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}

const init = async (data: any) => {
  const { id } = data || {}
  if (id) {
    try {
      const res = await orderApi.getOrderById(id)
      orderData.value = res as any as Order
    } catch (error: any) {
      ElMessage.error(error.message || '加载订单信息失败')
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

