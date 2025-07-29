import { defineStore } from 'pinia'

// 订单状态枚举
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PENDING_SHIPMENT: 'pending_shipment', 
  PENDING_RECEIPT: 'pending_receipt',
  COMPLETED: 'completed'
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      id: 1,
      nickname: '盲盒爱好者',
      avatar: 'data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="40" cy="40" r="40" fill="%23667eea"/%3E%3Ctext x="40" y="48" font-family="Arial" font-size="24" fill="white" text-anchor="middle"%3E用%3C/text%3E%3C/svg%3E',
      phone: '138****8888',
      email: 'user@example.com',
      coupons: 5,
      coins: 1280,
      points: 3650
    },
    orders: [],
    isLoggedIn: true
  }),

  getters: {
    // 根据状态获取订单
    getOrdersByStatus: (state) => (status) => {
      return state.orders.filter(order => order.status === status)
    },

    // 获取订单详情
    getOrderById: (state) => (orderId) => {
      return state.orders.find(order => order.id === orderId)
    },

    // 获取订单状态统计
    orderStats: (state) => {
      const stats = {
        [ORDER_STATUS.PENDING_PAYMENT]: 0,
        [ORDER_STATUS.PENDING_SHIPMENT]: 0,
        [ORDER_STATUS.PENDING_RECEIPT]: 0,
        [ORDER_STATUS.COMPLETED]: 0
      }
      
      state.orders.forEach(order => {
        stats[order.status]++
      })
      
      return stats
    }
  },

  actions: {
    // 获取用户信息
    getUserInfo() {
      return this.userInfo
    },

    // 更新用户信息
    updateUserInfo(newInfo) {
      Object.assign(this.userInfo, newInfo)
    },

    // 获取订单列表
    getOrders() {
      return this.orders
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
      this.orders.unshift(newOrder)
      return newOrder
    },

    // 确认收货
    confirmReceipt(orderId) {
      const order = this.orders.find(order => order.id === orderId)
      if (order && order.status === ORDER_STATUS.PENDING_RECEIPT) {
        order.status = ORDER_STATUS.COMPLETED
        order.receiveTime = new Date().toLocaleString('zh-CN')
        return true
      }
      return false
    },

    // 获取用户信息（异步）
    async fetchUserInfo() {
      // 这里可以添加API调用
      // 目前返回模拟数据
      return this.userInfo
    },

    // 退出登录
    logout() {
      // 清除本地存储的token
      localStorage.removeItem('token')
      localStorage.removeItem('adminToken')
      
      // 重置用户信息为默认值
      Object.assign(this.userInfo, {
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
      this.orders = []
      this.isLoggedIn = false
    }
  }
})