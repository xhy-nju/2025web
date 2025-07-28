<template>
  <div class="login-page">
    <!-- 恢复额外的渐变层 -->
    <div class="login-overlay"></div>

    <div class="login-box">
      <!-- 登录表单内容 -->
      <h2 class="welcome-title">账号登录</h2>
      <p class="login-subtitle">欢迎回到盲盒抽奖世界</p>

      <div class="form-group">
        <label>用户名/邮箱</label>
        <div class="input-wrapper">
          <span class="icon-user"></span>
          <input type="text" placeholder="请输入用户名或邮箱" v-model="username" />
        </div>
      </div>

      <div class="form-group">
        <label>密码</label>
        <div class="input-wrapper">
          <span class="icon-lock"></span>
          <input type="password" placeholder="请输入密码" v-model="password" />
        </div>
      </div>

      <div class="remember-forgot">
        <div class="remember">
          <input type="checkbox" id="remember" v-model="rememberMe" />
          <label for="remember">记住我</label>
        </div>
        <a href="#" class="forgot-password">忘记密码?</a>
      </div>

      <button
        class="login-btn"
        @click="handleLogin"
        :class="{ active: isFormValid }"
      >
        登 录
      </button>

      <div class="register-link">
        还没有账号? <a href="#" @click="goToRegister">立即注册</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const username = ref("");
const password = ref("");
const rememberMe = ref(false);

// 计算属性：表单是否有效（用户名和密码均不为空）
const isFormValid = computed(() => {
  return username.value.trim() !== "" && password.value.trim() !== "";
});

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert("请填写用户名和密码");
    return;
  }

  try {
    const res = await axios.post("/api/v1/auth/login", {
      username: username.value,
      password: password.value,
    });

    console.log("登录响应状态:", res.status);
    console.log("登录响应数据:", res.data);

    if (res.data.success) {
      // 保存token和用户信息
      if (res.data.data.token) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        console.log("Token已保存:", res.data.data.token);
      }

      // 登录成功后跳转到主页
      router.push("/home");
    } else {
      alert(res.data.message || "登录失败，请稍后再试");
    }
  } catch (error) {
    console.error("登录错误:", error);
    alert(error.response?.data?.message || "登录失败，请稍后再试");
  }
};

const goToRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 移除复杂的背景效果，使用简洁的渐变背景 */

.login-box {
  width: 400px;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(48, 13, 142, 0.3); /* 更深的阴影 */
  text-align: center;
  position: relative;
  z-index: 2;
}

.welcome-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 5px;
  font-weight: 500;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.icon-user,
.icon-lock {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.icon-user::before {
  content: "";
  display: inline-block;
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>');
  background-size: contain;
}

.icon-lock::before {
  content: "";
  display: inline-block;
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>');
  background-size: contain;
}

.input-wrapper input {
  flex: 1;
  height: 40px;
  border: none;
  outline: none;
  padding: 0 10px;
  font-size: 14px;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.remember {
  display: flex;
  align-items: center;
}

.remember input {
  margin-right: 4px;
}

.remember label {
  color: #666;
}

.forgot-password {
  color: #c5c0e5;
  text-decoration: none;
  transition: color 0.3s;
  outline: none;
}

.forgot-password:hover {
  color: #8a7bc8;
}

.forgot-password:focus {
  outline: none;
}

.login-btn {
  width: 100%;
  height: 40px;
  background-color: #c5c0e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.3s;
}

.login-btn.active {
  background-color: #8a7bc8;
}

.login-btn:hover {
  background-color: #8a7bc8;
}

.register-link {
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #c5c0e5;
  text-decoration: none;
  transition: color 0.3s;
  outline: none;
}

.register-link a:hover {
  color: #8a7bc8;
}

.register-link a:focus {
  outline: none;
}
</style>