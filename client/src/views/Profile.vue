<template>
  <div class="profile-container">
    <!-- 用户信息区域 -->
    <div class="user-header">
      <div class="user-avatar" @click="showEditProfile = true">
        <img :src="userInfo.avatar" :alt="userInfo.nickname" />
        <div class="edit-icon">✏️</div>
      </div>
      <div class="user-info">
        <h2>{{ userInfo.nickname }}</h2>
        <p>{{ userInfo.phone }}</p>
      </div>
    </div>

    <!-- 个人中心栏 -->
    <div class="stats-section">
      <div class="stat-item">
        <div class="stat-number">{{ userInfo.coupons }}</div>
        <div class="stat-label">卡券</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ userInfo.coins }}</div>
        <div class="stat-label">金币</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ userInfo.points }}</div>
        <div class="stat-label">积分</div>
      </div>
    </div>

    <!-- 订单状态栏 -->
    <div class="order-section">
      <div class="section-header">
        <h3>我的订单</h3>
        <button @click="viewAllOrders" class="view-all-btn">查看全部</button>
      </div>
      <div class="order-status-grid">
        <div 
          class="status-item" 
          @click="viewOrdersByStatus('pending_payment')"
        >
          <div class="status-icon">💰</div>
          <div class="status-label">待付款</div>
          <div class="status-count">{{ orderStats.pending_payment }}</div>
        </div>
        <div 
          class="status-item" 
          @click="viewOrdersByStatus('pending_shipment')"
        >
          <div class="status-icon">📦</div>
          <div class="status-label">待发货</div>
          <div class="status-count">{{ orderStats.pending_shipment }}</div>
        </div>
        <div 
          class="status-item" 
          @click="viewOrdersByStatus('pending_receipt')"
        >
          <div class="status-icon">🚚</div>
          <div class="status-label">待收货</div>
          <div class="status-count">{{ orderStats.pending_receipt }}</div>
        </div>
        <div 
          class="status-item" 
          @click="viewOrdersByStatus('completed')"
        >
          <div class="status-icon">✅</div>
          <div class="status-label">已完成</div>
          <div class="status-count">{{ orderStats.completed }}</div>
        </div>
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="recent-orders">
      <h3>最近订单</h3>
      <div v-if="recentOrders.length === 0" class="empty-orders">
        <div class="empty-icon">📦</div>
        <p>暂无订单</p>
      </div>
      <div v-else class="order-list">
        <div 
          v-for="order in recentOrders" 
          :key="order._id" 
          class="order-item"
          @click="viewOrderDetail(order._id)"
        >
          <img :src="order.productImage" :alt="order.productName" class="order-image" />
          <div class="order-info">
            <h4>{{ order.productName }}</h4>
            <p class="order-time">{{ order.createTime }}</p>
            <div class="order-result" v-if="order.drawnItem">
              <span>抽中：</span>
              <img :src="order.drawnItem.imageUrl" :alt="order.drawnItem.name" class="drawn-item-image" />
              <span class="drawn-item-name">{{ order.drawnItem.name }}</span>
              <span :class="`rarity-${order.drawnItem.rarity.toLowerCase()}`">{{ order.drawnItem.rarity }}</span>
            </div>
          </div>
          <div class="order-status">
            <span :class="`status-${order.status}`">{{ getStatusText(order.status) }}</span>
            <span class="order-price">¥{{ order.price }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑个人资料弹窗 -->
    <div v-if="showEditProfile" class="modal-overlay" @click="closeEditProfile">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑个人资料</h3>
          <button @click="closeEditProfile" class="close-btn">×</button>
        </div>
        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="form-group">
            <label>头像</label>
            <div class="avatar-upload">
              <img :src="editForm.avatar" alt="头像预览" class="avatar-preview" />
              <input 
                ref="avatarInput" 
                type="file" 
                accept="image/*" 
                @change="handleAvatarUpload"
                style="display: none"
              />
              <button type="button" @click="$refs.avatarInput.click()" class="upload-btn">
                更换头像
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>昵称</label>
            <input v-model="editForm.nickname" type="text" required />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input v-model="editForm.phone" type="tel" required />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="editForm.email" type="email" required />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeEditProfile" class="cancel-btn">取消</button>
            <button type="submit" class="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <div v-if="showOrderDetail" class="modal-overlay" @click="closeOrderDetail">
      <div class="modal-content order-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>订单详情</h3>
          <button @click="closeOrderDetail" class="close-btn">×</button>
        </div>
        <div v-if="selectedOrder" class="order-detail">
          <div class="order-header">
            <span class="order-id">订单号：{{ selectedOrder.orderNumber }}</span>
            <span :class="`status-${selectedOrder.status}`">{{ getStatusText(selectedOrder.status) }}</span>
          </div>
          
          <div class="product-info">
            <img :src="selectedOrder.items?.[0]?.blindBoxId?.imageUrl || '/images/default.jpg'" :alt="selectedOrder.items?.[0]?.blindBoxName" />
            <div class="product-details">
              <h4>{{ selectedOrder.items?.[0]?.blindBoxName || '未知商品' }}</h4>
              <p>数量：{{ selectedOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 1 }}</p>
              <p class="price">¥{{ selectedOrder.totalAmount }}</p>
            </div>
          </div>

          <div v-if="selectedOrder.items?.[0]?.drawnItems?.[0]" class="drawn-result">
            <h4>抽奖结果</h4>
            <div class="drawn-item">
              <img :src="selectedOrder.items[0].drawnItems[0].imageUrl" :alt="selectedOrder.items[0].drawnItems[0].name" />
              <div class="item-info">
                <span class="item-name">{{ selectedOrder.items[0].drawnItems[0].name }}</span>
                <span :class="`rarity-${selectedOrder.items[0].drawnItems[0].rarity.toLowerCase()}`">
                  {{ selectedOrder.items[0].drawnItems[0].rarity }}
                </span>
              </div>
            </div>
          </div>

          <div class="order-timeline">
            <div class="timeline-item" v-if="selectedOrder.createdAt">
              <span class="time">{{ new Date(selectedOrder.createdAt).toLocaleString() }}</span>
              <span class="event">订单创建</span>
            </div>
            <div class="timeline-item" v-if="selectedOrder.paymentTime">
              <span class="time">{{ new Date(selectedOrder.paymentTime).toLocaleString() }}</span>
              <span class="event">支付完成</span>
            </div>
            <div class="timeline-item" v-if="selectedOrder.shipmentTime">
              <span class="time">{{ new Date(selectedOrder.shipmentTime).toLocaleString() }}</span>
              <span class="event">商品发货</span>
            </div>
            <div class="timeline-item" v-if="selectedOrder.receiptTime">
              <span class="time">{{ new Date(selectedOrder.receiptTime).toLocaleString() }}</span>
              <span class="event">确认收货</span>
            </div>
          </div>

          <div v-if="selectedOrder.status === 'pending_receipt'" class="order-actions">
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
      <div class="nav-item active">
        <div class="nav-icon">👤</div>
        <div class="nav-text">我的</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 响应式数据
const showEditProfile = ref(false)
const showOrderDetail = ref(false)
const selectedOrder = ref(null)
const userInfo = ref({
  nickname: '',
  phone: '',
  email: '',
  avatar: '',
  coupons: 0,
  coins: 0,
  points: 0
})
const orders = ref([])
const loading = ref(false)

// 编辑表单数据
const editForm = ref({
  nickname: '',
  phone: '',
  email: '',
  avatar: ''
})

// 计算属性
const orderStats = computed(() => {
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
})

const recentOrders = computed(() => orders.value.slice(0, 3))

// 从后端获取用户信息
const fetchUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.get('/api/v1/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.success) {
       const userData = response.data.data.user
       userInfo.value = {
         nickname: userData.nickname || userData.username,
         phone: userData.phone || '',
         email: userData.email || '',
         avatar: userData.avatar || '',
         coupons: userData.coupons || 0,
         coins: userData.coins || 0,
         points: userData.points || 0
       }
       // 同时更新编辑表单
       editForm.value = {
         nickname: userData.nickname || userData.username,
         phone: userData.phone || '',
         email: userData.email || '',
         avatar: userData.avatar || ''
       }
     } else {
      console.error('获取用户信息失败:', response.data.message)
    }
  } catch (error) {
    console.error('获取用户信息出错:', error)
  }
}

// 从后端获取订单数据
const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get('/api/v1/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.success) {
      const rawOrders = response.data.data.orders || []
      // 映射订单数据结构以适配前端显示
      orders.value = rawOrders.map(order => ({
        ...order,
        id: order._id, // 添加id字段以兼容现有代码
        productName: order.items[0]?.blindBoxName || '未知商品',
        productImage: order.items[0]?.blindBoxId?.imageUrl || '/images/default.jpg',
        price: order.totalAmount,
        quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        createTime: new Date(order.createdAt).toLocaleString(),
        drawnItem: order.items[0]?.drawnItems?.[0] || null
      }))
    } else {
      console.error('获取订单失败:', response.data.message)
    }
  } catch (error) {
    console.error('获取订单出错:', error)
  }
}

// 方法
const viewAllOrders = () => {
  router.push('/orders')
}

const viewOrdersByStatus = (status) => {
  router.push(`/orders?status=${status}`)
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
      selectedOrder.value = response.data.data
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

const confirmReceipt = async (orderId) => {
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

const getStatusText = (status) => {
  const statusMap = {
    'pending_payment': '待付款',
    'pending_shipment': '待发货',
    'pending_receipt': '待收货',
    'completed': '已完成'
  }
  return statusMap[status] || '未知状态'
}

const closeEditProfile = () => {
  showEditProfile.value = false
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      editForm.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put('/api/v1/users/profile', editForm.value, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.success) {
      alert('个人资料更新成功！')
      closeEditProfile()
      // 重新获取用户信息
      await fetchUserInfo()
    } else {
      alert('更新失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('更新个人资料出错:', error)
    alert('更新失败，请稍后重试')
  }
}

const handlePlayerShowClick = () => {
  alert('玩家秀功能即将上线，敬请期待！')
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchUserInfo(),
      fetchOrders()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.user-avatar {
  position: relative;
  cursor: pointer;
}

.user-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.edit-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.user-info h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
}

.user-info p {
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
}

.stats-section {
  background: white;
  margin: -20px 20px 20px;
  border-radius: 15px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.order-section {
  background: white;
  margin: 0 20px 20px;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.view-all-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
}

.order-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.status-item {
  text-align: center;
  padding: 15px 10px;
  border-radius: 10px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.status-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.status-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.status-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.status-count {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.recent-orders {
  background: white;
  margin: 0 20px 20px;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.recent-orders h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.empty-orders {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.order-item:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.order-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.order-info {
  flex: 1;
}

.order-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
}

.order-time {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #999;
}

.order-result {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.drawn-item-image {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.drawn-item-name {
  color: #333;
  font-weight: 500;
}

.order-status {
  text-align: right;
}

.order-price {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-top: 5px;
}

/* 状态样式 */
.status-pending_payment { color: #ff9800; }
.status-pending_shipment { color: #2196f3; }
.status-pending_receipt { color: #9c27b0; }
.status-completed { color: #4caf50; }

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
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
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

.profile-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-preview {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.upload-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
}

.save-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
}

/* 订单详情弹窗 */
.order-detail-modal {
  max-width: 600px;
}

.order-detail {
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.order-id {
  font-weight: 500;
  color: #333;
}

.product-info {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.product-info img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.product-details h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.product-details p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.price {
  font-size: 18px !important;
  font-weight: bold !important;
  color: #333 !important;
}

.drawn-result {
  margin-bottom: 20px;
}

.drawn-result h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.drawn-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.drawn-item img {
  width: 50px;
  height: 50px;
  border-radius: 6px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.order-timeline {
  margin-bottom: 20px;
}

.timeline-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.timeline-item:last-child {
  border-bottom: none;
}

.time {
  color: #666;
  font-size: 14px;
}

.event {
  color: #333;
  font-weight: 500;
}

.order-actions {
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