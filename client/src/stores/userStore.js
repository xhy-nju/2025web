import { ref, reactive } from 'vue'

// 用户信息
const userInfo = reactive({
  id: 1,
  nickname: '盲盒爱好者',
  avatar: 'data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="40" cy="40" r="40" fill="%23667eea"/%3E%3Ctext x="40" y="48" font-family="Arial" font-size="24" fill="white" text-anchor="middle"%3E用%3C/text%3E%3C/svg%3E',
  phone: '138****8888',
  email: 'user@example.com',
  coupons: 5,
  coins: 1280,
  points: 3650
})

// 订单状态枚举
const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PENDING_SHIPMENT: 'pending_shipment', 
  PENDING_RECEIPT: 'pending_receipt',
  COMPLETED: 'completed'
}

// 订单数据
const orders = ref([])

// 用户数据存储
export const userStore = {
  // 获取用户信息
  getUserInfo() {
    return userInfo
  },

  // 更新用户信息
  updateUserInfo(newInfo) {
    Object.assign(userInfo, newInfo)
  },

  // 获取订单列表
  getOrders() {
    return orders.value
  },

  // 根据状态获取订单
  getOrdersByStatus(status) {
    return orders.value.filter(order => order.status === status)
  },

  // 获取订单详情
  getOrderById(orderId) {
    return orders.value.find(order => order.id === orderId)
  },

  // 添加新订单（抽奖完成后）
  addOrder(orderData) {
    const newOrder = {
      id: `ORD${Date.now()}`,
      createTime: new Date().toLocaleString('zh-CN'),
      payTime: new Date().toLocaleString('zh-CN'),
      status: ORDER_STATUS.PENDING_RECEIPT,
      ...orderData
    }
    orders.value.unshift(newOrder)
    return newOrder
  },

  // 确认收货
  confirmReceipt(orderId) {
    const order = orders.value.find(order => order.id === orderId)
    if (order && order.status === ORDER_STATUS.PENDING_RECEIPT) {
      order.status = ORDER_STATUS.COMPLETED
      order.receiveTime = new Date().toLocaleString('zh-CN')
      return true
    }
    return false
  },

  // 获取订单状态统计
  getOrderStats() {
    const stats = {
      [ORDER_STATUS.PENDING_PAYMENT]: 0,
      [ORDER_STATUS.PENDING_SHIPMENT]: 0,
      [ORDER_STATUS.PENDING_RECEIPT]: 0,
      [ORDER_STATUS.COMPLETED]: 0
    }
    
    orders.value.forEach(order => {
      stats[order.status]++
    })
    
    return stats
  },

  // 退出登录
  logout() {
    // 清除本地存储的token
    localStorage.removeItem('token')
    localStorage.removeItem('adminToken')
    
    // 重置用户信息为默认值
    Object.assign(userInfo, {
      id: null,
      nickname: '',
      avatar: '',
      phone: '',
      email: '',
      coupons: 0,
      coins: 0,
      points: 0
    })
    
    // 清空订单数据
    orders.value = []
  },

  // 订单状态常量
  ORDER_STATUS
}