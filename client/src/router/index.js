import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import BlindBoxDetail from '../views/BlindBoxDetail.vue'
import AdminAuth from '../views/AdminAuth.vue'
import Admin from '../views/Admin.vue'
import Profile from '../views/Profile.vue'
import Orders from '../views/Orders.vue'
import MessagePage from '../views/MessagePage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/blindbox/:id',
    name: 'BlindBoxDetail',
    component: BlindBoxDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  {
    path: '/message',
    name: 'Message',
    component: MessagePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin-auth',
    name: 'AdminAuth',
    component: AdminAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('adminToken')
  
  if (to.meta.requiresAuth && !token) {
    // 需要认证但没有token，跳转到登录页
    next('/login')
  } else if (to.meta.requiresAdmin && !adminToken) {
    // 需要管理员权限但没有管理员token，跳转到管理员认证页
    next('/admin-auth')
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    // 已登录用户访问登录/注册页，跳转到主页
    next('/home')
  } else {
    next()
  }
})

export default router