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
      id: null,
      nickname: '',
      avatar: '',
      phone: '',
      email: '',
      coupons: 0,
      coins: 0,
      points: 0
    },
    orders: [],
    isLoggedIn: false
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
      localStorage.removeItem('user')
      
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
    },

    // 初始化用户状态（从localStorage恢复）
    initializeFromStorage() {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          this.updateUserInfo({
            id: user._id || user.id,
            nickname: user.username || user.nickname,
            avatar: user.avatar || 'data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="40" cy="40" r="40" fill="%23667eea"/%3E%3Ccircle cx="40" cy="32" r="12" fill="white"/%3E%3Cpath d="M20 65c0-11 9-20 20-20s20 9 20 20" fill="white"/%3E%3C/svg%3E',
            phone: user.phone || '',
            email: user.email || '',
            coupons: user.coupons || 0,
            coins: user.coins || 0,
            points: user.points || 0
          })
          this.isLoggedIn = true
        } catch (error) {
          console.error('恢复用户状态失败:', error)
          this.logout()
        }
      } else {
        this.isLoggedIn = false
      }
    },

    // 登录成功后更新状态
    loginSuccess(userData, token) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      this.updateUserInfo({
        id: userData._id || userData.id,
        nickname: userData.username || userData.nickname,
        avatar: userData.avatar || 'data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="40" cy="40" r="40" fill="%23667eea"/%3E%3Ccircle cx="40" cy="32" r="12" fill="white"/%3E%3Cpath d="M20 65c0-11 9-20 20-20s20 9 20 20" fill="white"/%3E%3C/svg%3E',
        phone: userData.phone || '',
        email: userData.email || '',
        coupons: userData.coupons || 0,
        coins: userData.coins || 0,
        points: userData.points || 0
      })
      this.isLoggedIn = true
    }
  }
})