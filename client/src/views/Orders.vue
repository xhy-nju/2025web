<template>
  <div class="orders-container">
    <!-- 头部 -->
    <div class="header">
      <button @click="$router.go(-1)" class="back-btn">←</button>
      <h1>我的订单</h1>
      <button @click="refreshOrders" class="refresh-btn" :disabled="loading">
        {{ loading ? '⟳' : '↻' }}
      </button>
    </div>

    <!-- 状态筛选 -->
    <div class="status-tabs">
      <div 
        v-for="tab in statusTabs" 
        :key="tab.value"
        :class="['tab-item', { active: currentStatus === tab.value }]"
        @click="switchStatus(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="count-badge">{{ tab.count }}</span>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list">
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>暂无{{ getCurrentStatusLabel() }}订单</p>
      </div>
      <div v-else class="order-items">
        <div 
          v-for="order in filteredOrders" 
          :key="order._id" 
          class="order-card"
          @click="viewOrderDetail(order._id)"
        >
          <div class="order-header">
            <span class="order-id">订单号：{{ order.orderNumber }}</span>
            <span :class="`status-${order.status}`">{{ getStatusText(order.status) }}</span>
          </div>
          
          <div class="order-content">
            <img :src="order.productImage" :alt="order.productName" class="product-image" />
            <div class="product-info">
              <h3>{{ order.productName }}</h3>
              <p class="order-time">{{ order.createTime }}</p>
              <div v-if="order.drawnItem" class="drawn-result">
                <span>抽中：</span>
                <img :src="order.drawnItem.imageUrl" :alt="order.drawnItem.name" class="drawn-item-image" />
                <span class="drawn-item-name">{{ order.drawnItem.name }}</span>
                <span :class="`rarity-${order.drawnItem.rarity.toLowerCase()}`">{{ order.drawnItem.rarity }}</span>
              </div>
            </div>
            <div class="order-price">
              <span class="price">¥{{ order.price }}</span>
              <span class="quantity">×{{ order.quantity }}</span>
            </div>
          </div>

          <div class="order-actions">
            <button 
              v-if="order.status === 'pending_payment'" 
              @click.stop="payOrder(order._id)"
              class="action-btn primary"
            >
              立即付款
            </button>
            <button 
              v-if="order.status === 'pending_receipt'" 
              @click.stop="confirmReceipt(order._id)"
              class="action-btn primary"
            >
              确认收货
            </button>
            <button 
              v-if="order.status === 'completed'" 
              @click.stop="reviewOrder(order._id)"
              class="action-btn secondary"
            >
              评价
            </button>
            <button 
              @click.stop="viewOrderDetail(order._id)"
              class="action-btn secondary"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <div v-if="showOrderDetail" class="modal-overlay" @click="closeOrderDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>订单详情</h3>
          <button @click="closeOrderDetail" class="close-btn">×</button>
        </div>
        <div v-if="selectedOrder" class="order-detail">
          <div class="detail-section">
            <h4>订单信息</h4>
            <div class="info-row">
              <span class="label">订单号：</span>
              <span class="value">{{ selectedOrder.orderNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">订单状态：</span>
              <span :class="`status-${selectedOrder.status}`">{{ getStatusText(selectedOrder.status) }}</span>
            </div>
            <div class="info-row">
              <span class="label">下单时间：</span>
              <span class="value">{{ selectedOrder.createTime }}</span>
            </div>
            <div class="info-row" v-if="selectedOrder.payTime">
              <span class="label">支付时间：</span>
              <span class="value">{{ selectedOrder.payTime }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>商品信息</h4>
            <div class="product-detail">
              <img :src="selectedOrder.productImage" :alt="selectedOrder.productName" />
              <div class="product-info">
                <h5>{{ selectedOrder.productName }}</h5>
                <p>数量：{{ selectedOrder.quantity }}</p>
                <p class="price">¥{{ selectedOrder.price }}</p>
              </div>
            </div>
          </div>

          <div v-if="selectedOrder.drawnItem" class="detail-section">
            <h4>抽奖结果</h4>
            <div class="drawn-detail">
              <img :src="selectedOrder.drawnItem.imageUrl" :alt="selectedOrder.drawnItem.name" />
              <div class="item-info">
                <h5>{{ selectedOrder.drawnItem.name }}</h5>
                <span :class="`rarity-${selectedOrder.drawnItem.rarity.toLowerCase()}`">
                  {{ selectedOrder.drawnItem.rarity }}
                </span>
                <p class="item-desc">{{ selectedOrder.drawnItem.description || '恭喜获得此物品！' }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>物流信息</h4>
            <div class="logistics-timeline">
              <div class="timeline-item" v-if="selectedOrder.createTime">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <span class="time">{{ selectedOrder.createTime }}</span>
                  <span class="event">订单创建</span>
                </div>
              </div>
              <div class="timeline-item" v-if="selectedOrder.payTime">
                <div class="timeline-dot active"></div>
                <div class="timeline-content">
                  <span class="time">{{ selectedOrder.payTime }}</span>
                  <span class="event">支付完成</span>
                </div>
              </div>
              <div class="timeline-item" v-if="selectedOrder.shipTime">
                <div class="timeline-dot active"></div>
                <div class="timeline-content">
                  <span class="time">{{ selectedOrder.shipTime }}</span>
                  <span class="event">商品发货</span>
                </div>
              </div>
              <div class="timeline-item" v-if="selectedOrder.receiveTime">
                <div class="timeline-dot active"></div>
                <div class="timeline-content">
                  <span class="time">{{ selectedOrder.receiveTime }}</span>
                  <span class="event">确认收货</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedOrder.status === 'pending_receipt'" class="detail-actions">
            <button @click="confirmReceipt(selectedOrder._id)" class="confirm-btn">
              确认收货
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div class="nav-item" @click="$router.push('/home')">
        <div class="nav-icon">🏠</div>
        <div class="nav-text">首页</div>
      </div>
      <div class="nav-item" @click="$router.push('/player-show')">
         <div class="nav-icon">🎮</div>
         <div class="nav-text">玩家秀</div>
       </div>
      <div class="nav-item" @click="$router.push('/admin-auth')">
        <div class="nav-icon">📦</div>
        <div class="nav-text">管理</div>
      </div>
      <div class="nav-item" @click="$router.push('/message')">
        <div class="nav-icon">💬</div>
        <div class="nav-text">消息</div>
      </div>
      <div class="nav-item" @click="$router.push('/profile')">
        <div class="nav-icon">👤</div>
        <div class="nav-text">我的</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// 响应式数据
const currentStatus = ref('all')
const showOrderDetail = ref(false)
const selectedOrder = ref(null)
const orders = ref([])
const loading = ref(false)

// 状态标签配置
const statusTabs = computed(() => {
  const stats = getOrderStats()
  return [
    { value: 'all', label: '全部', count: stats.total },
    { value: 'pending_payment', label: '待付款', count: stats.pending_payment },
    { value: 'pending_shipment', label: '待发货', count: stats.pending_shipment },
    { value: 'pending_receipt', label: '待收货', count: stats.pending_receipt },
    { value: 'completed', label: '已完成', count: stats.completed }
  ]
})

// 计算属性
const filteredOrders = computed(() => {
  if (currentStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === currentStatus.value)
})

// 获取订单统计
const getOrderStats = () => {
  const stats = {
    total: orders.value.length,
    pending_payment: 0,
    pending_shipment: 0,
    pending_receipt: 0,
    completed: 0
  }
  
  orders.value.forEach(order => {
    if (stats[order.status] !== undefined) {
      stats[order.status]++
    }
  })
  
  return stats
}

// 从后端获取订单数据
const fetchOrders = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    console.log('当前token:', token)
    
    if (!token) {
      console.log('没有token，跳转到登录页')
      router.push('/login')
      return
    }

    console.log('开始获取订单数据...')
    const response = await axios.get('/api/v1/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('订单API响应:', response.data)

    if (response.data.success) {
      const rawOrders = response.data.data.orders || []
      console.log('原始订单数据:', rawOrders)
      console.log('订单数量:', rawOrders.length)
      
      // 转换订单数据格式
      orders.value = rawOrders.map(order => {
        const firstItem = order.items && order.items[0]
        const blindBox = firstItem?.blindBoxId
        const drawnItem = firstItem?.drawnItems && firstItem.drawnItems[0]
        
        console.log('处理订单:', order._id, '第一个商品:', firstItem, '抽奖结果:', drawnItem)
        
        return {
          ...order, // 保留原始订单数据
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          createTime: new Date(order.createdAt).toLocaleString(),
          payTime: order.paymentTime ? new Date(order.paymentTime).toLocaleString() : null,
          shipTime: order.shipmentTime ? new Date(order.shipmentTime).toLocaleString() : null,
          receiveTime: order.receiptTime ? new Date(order.receiptTime).toLocaleString() : null,
          productName: firstItem?.blindBoxName || blindBox?.name || '未知商品',
          productImage: blindBox?.imageUrl || '/images/default.jpg',
          price: order.totalAmount,
          quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
          drawnItem: drawnItem ? {
            name: drawnItem.name,
            imageUrl: drawnItem.imageUrl,
            rarity: drawnItem.rarity,
            description: drawnItem.description
          } : null
        }
      })
      
      console.log('转换后的订单数据:', orders.value)
      console.log('最终订单数量:', orders.value.length)
    } else {
      console.error('获取订单失败:', response.data.message)
    }
  } catch (error) {
    console.error('获取订单出错:', error)
    console.error('错误详情:', error.response?.data)
  } finally {
    loading.value = false
  }
}

// 刷新订单列表
const refreshOrders = async () => {
  await fetchOrders()
}

// 方法
const switchStatus = (status) => {
  currentStatus.value = status
  // 更新URL参数
  router.replace({ query: { ...route.query, status } })
}

const getCurrentStatusLabel = () => {
  const tab = statusTabs.value.find(t => t.value === currentStatus.value)
  return tab ? tab.label : ''
}

const getStatusText = (status) => {
  const statusMap = {
    'pending_payment': '待付款',
    'pending_shipment': '待发货',
    'pending_receipt': '待收货',
    'completed': '已完成'
  }
  return statusMap[status] || '未知状态'
}

const viewOrderDetail = async (orderId) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`/api/v1/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.success) {
      const order = response.data.data
      const firstItem = order.items && order.items[0]
      const blindBox = firstItem?.blindBoxId
      const drawnItem = firstItem?.drawnItems && firstItem.drawnItems[0]
      
      // 转换订单详情数据格式
      selectedOrder.value = {
        ...order, // 保留原始订单数据
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createTime: new Date(order.createdAt).toLocaleString(),
        payTime: order.paymentTime ? new Date(order.paymentTime).toLocaleString() : null,
        shipTime: order.shipmentTime ? new Date(order.shipmentTime).toLocaleString() : null,
        receiveTime: order.receiptTime ? new Date(order.receiptTime).toLocaleString() : null,
        productName: firstItem?.blindBoxName || blindBox?.name || '未知商品',
        productImage: blindBox?.imageUrl || '/images/default.jpg',
        price: order.totalAmount,
        quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        drawnItem: drawnItem ? {
          name: drawnItem.name,
          imageUrl: drawnItem.imageUrl,
          rarity: drawnItem.rarity,
          description: drawnItem.description
        } : null
      }
      
      showOrderDetail.value = true
    } else {
      console.error('获取订单详情失败:', response.data.message)
    }
  } catch (error) {
    console.error('获取订单详情出错:', error)
  }
}

const closeOrderDetail = () => {
  showOrderDetail.value = false
  selectedOrder.value = null
}

const payOrder = (orderId) => {
  // 模拟支付
  if (confirm('确认支付此订单？')) {
    // 这里应该调用支付接口
    alert('支付功能待实现')
  }
}

const confirmReceipt = async (orderId) => {
  if (confirm('确认收货？收货后订单将完成。')) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`/api/v1/orders/${orderId}/confirm`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        alert('确认收货成功！')
        closeOrderDetail()
        // 重新获取订单数据
        await fetchOrders()
      } else {
        alert('确认收货失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('确认收货出错:', error)
      alert('确认收货失败，请稍后重试')
    }
  }
}

const reviewOrder = (orderId) => {
  alert('评价功能待实现')
}

const handlePlayerShowClick = () => {
  alert('玩家秀功能即将上线，敬请期待！')
}

// 生命周期
onMounted(async () => {
  // 从URL参数获取初始状态
  const status = route.query.status
  if (status && ['all', 'pending_payment', 'pending_shipment', 'pending_receipt', 'completed'].includes(status)) {
    currentStatus.value = status
  }
  
  // 获取订单数据
  await fetchOrders()
  
  // 监听订单创建事件
  window.addEventListener('orderCreated', handleOrderCreated)
})

// 监听订单创建事件的处理函数
const handleOrderCreated = (event) => {
  console.log('收到订单创建事件:', event.detail)
  // 延迟一下再刷新，确保后端数据已保存
  setTimeout(() => {
    console.log('自动刷新订单数据...')
    fetchOrders()
  }, 1000)
}

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('orderCreated', handleOrderCreated)
})
</script>

<style scoped>
.orders-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 70px;
}

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333;
  padding: 5px;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #667eea;
  padding: 5px;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  color: #5a6fd8;
  transform: rotate(180deg);
}

.refresh-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.header h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.placeholder {
  width: 30px;
}

.status-tabs {
  background: white;
  display: flex;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
}

.tab-item {
  flex: 1;
  min-width: 80px;
  padding: 15px 10px;
  text-align: center;
  cursor: pointer;
  position: relative;
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.tab-item.active {
  color: #667eea;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background: #667eea;
}

.count-badge {
  background: #ff4757;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orders-list {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.order-id {
  font-size: 14px;
  color: #666;
}

.order-content {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.order-time {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #999;
}

.drawn-result {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.drawn-item-image {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.drawn-item-name {
  color: #333;
  font-weight: 500;
}

.order-price {
  text-align: right;
}

.price {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.quantity {
  font-size: 12px;
  color: #666;
}

.order-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5a6fd8;
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;
}

.action-btn.secondary:hover {
  background: #e9ecef;
}

/* 状态样式 */
.status-pending_payment { color: #ff9800; font-weight: 500; }
.status-pending_shipment { color: #2196f3; font-weight: 500; }
.status-pending_receipt { color: #9c27b0; font-weight: 500; }
.status-completed { color: #4caf50; font-weight: 500; }

/* 稀有度样式 */
.rarity-ssr { color: #ff6b6b; font-weight: bold; }
.rarity-sr { color: #4fbaf5; font-weight: bold; }
.rarity-r { color: #67eaf5; }
.rarity-n { color: #95a5a6; }

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  sticky: top 0;
  background: white;
  z-index: 10;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.order-detail {
  padding: 20px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-size: 14px;
}

.value {
  color: #333;
  font-size: 14px;
}

.product-detail {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.product-detail img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.product-detail .product-info h5 {
  margin: 0 0 8px 0;
  color: #333;
}

.product-detail .product-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.product-detail .price {
  font-size: 16px !important;
  font-weight: bold !important;
  color: #333 !important;
}

.drawn-detail {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.drawn-detail img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
}

.drawn-detail .item-info h5 {
  margin: 0 0 5px 0;
  color: #333;
}

.item-desc {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 12px;
}

.logistics-timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 30px;
  width: 2px;
  height: 20px;
  background: #e9ecef;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e9ecef;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #e9ecef;
}

.timeline-dot.active {
  background: #667eea;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  color: #666;
  font-size: 12px;
}

.event {
  color: #333;
  font-size: 14px;
}

.detail-actions {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.confirm-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

/* 底部导航 */
.bottom-nav {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 70px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  z-index: 1000;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-sizing: border-box;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  color: #999;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  min-height: 70px;
  box-sizing: border-box;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 3px 3px;
  transition: width 0.3s ease;
}

.nav-item.active::before {
  width: 30px;
}

.nav-item.active {
  color: #667eea;
  transform: translateY(-2px);
}

.nav-item:hover {
  color: #667eea;
  transform: translateY(-1px);
}

.nav-icon {
  margin-bottom: 4px;
  font-size: 22px;
  transition: transform 0.3s ease;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  font-size: 11px;
  margin-top: 2px;
  white-space: nowrap;
  font-weight: 500;
}
</style>