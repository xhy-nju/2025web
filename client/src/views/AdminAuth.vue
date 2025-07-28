<template>
  <div class="admin-auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>管理员身份认证</h1>
        <p>请输入管理员账号和密码</p>
      </div>
      
      <form @submit.prevent="handleAuth" class="auth-form">
        <div class="form-group">
          <label for="username">管理员账号</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入管理员账号"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">管理员密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入管理员密码"
            required
          />
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="auth-button" :disabled="!isFormValid">
          进入管理页面
        </button>
      </form>
      
      <div class="back-link">
        <button @click="goBack" class="back-button">
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const isFormValid = computed(() => {
  return username.value.trim() && password.value.trim()
})

const handleAuth = () => {
  errorMessage.value = ''
  
  // 验证管理员账号密码
  if (username.value === 'administrator' && password.value === 'admin@admin') {
    // 设置管理员token
    localStorage.setItem('adminToken', 'admin_authenticated')
    router.push('/admin')
  } else {
    errorMessage.value = '账号或密码错误，请重新输入'
    // 清空密码
    password.value = ''
  }
}

const goBack = () => {
  router.push('/home')
}
</script>

<style scoped>
.admin-auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 600;
}

.auth-header p {
  color: #666;
  font-size: 14px;
}

.auth-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  border: 1px solid #fed7d7;
}

.auth-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.back-link {
  text-align: center;
}

.back-button {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s;
}

.back-button:hover {
  color: #764ba2;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }
  
  .auth-header h1 {
    font-size: 24px;
  }
}
</style>