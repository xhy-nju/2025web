import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { useUserStore } from './stores/userStore'

// 配置axios默认设置
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
axios.defaults.timeout = 10000

// 请求拦截器 - 添加token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理token过期
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && error.response.status === 401) {
      // token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 清除userStore状态
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)
const pinia = createPinia()

// 全局配置axios
app.config.globalProperties.$http = axios

app.use(pinia)
app.use(router)

// 在应用挂载后初始化用户状态
app.mount('#app')

// 初始化用户状态
const userStore = useUserStore()
userStore.initializeFromStorage()
