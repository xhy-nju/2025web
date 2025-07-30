<template>
  <div class="register-page">
    <!-- 恢复额外的渐变层 -->
    <div class="register-overlay"></div>

    <div class="register-box">
      <!-- 注册表单内容 -->
      <h2 class="welcome-title">账号注册</h2>
      <p class="register-subtitle">创建您的盲盒抽奖账号</p>

      <div class="form-group">
        <label>用户名</label>
        <div class="input-wrapper">
          <span class="icon-user"></span>
          <input type="text" placeholder="请输入用户名" v-model="username" />
        </div>
      </div>

      <div class="form-group">
        <label>邮箱</label>
        <div class="input-wrapper">
          <span class="icon-email"></span>
          <input type="email" placeholder="请输入邮箱地址" v-model="email" />
        </div>
      </div>

      <div class="form-group">
        <label>密码</label>
        <div class="input-wrapper">
          <span class="icon-lock"></span>
          <input type="password" placeholder="请输入密码" v-model="password" />
        </div>
      </div>

      <div class="form-group">
        <label>确认密码</label>
        <div class="input-wrapper">
          <span class="icon-lock"></span>
          <input
            type="password"
            placeholder="请再次输入密码"
            v-model="confirmPassword"
          />
        </div>
      </div>

      <div class="agreement">
        <input type="checkbox" id="agree" v-model="agreeTerms" />
        <label for="agree"
          >我已阅读并同意<a href="#">服务条款</a>和<a href="#"
            >隐私政策</a
          ></label
        >
      </div>

      <button
        class="register-btn"
        @click="handleRegister"
        :class="{ active: isFormValid }"
      >
        注 册
      </button>

      <div class="login-link">
        已有账号? <a href="#" @click="goToLogin">立即登录</a>
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
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const agreeTerms = ref(false);

// 计算属性：表单是否有效
const isFormValid = computed(() => {
  return username.value.trim() !== "" && 
         email.value.trim() !== "" && 
         password.value.trim() !== "" &&
         confirmPassword.value.trim() !== "";
});

const handleRegister = async () => {
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    alert("请填写所有必填项");
    return;
  }

  // 前端验证
  if (username.value.length < 3 || username.value.length > 20) {
    alert("用户名长度必须在3-20个字符之间");
    return;
  }

  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username.value)) {
    alert("用户名只能包含字母、数字、下划线和中文");
    return;
  }

  if (password.value.length < 6) {
    alert("密码至少需要6个字符");
    return;
  }

  if (password.value !== confirmPassword.value) {
    alert("两次输入的密码不一致");
    return;
  }

  if (!agreeTerms.value) {
    alert("请阅读并同意服务条款和隐私政策");
    return;
  }

  try {
    const res = await axios.post("/api/v1/auth/register", {
      username: username.value,
      email: email.value,
      password: password.value,
    });

    console.log("注册响应状态:", res.status);
    console.log("注册响应数据:", res.data);

    if (res.data.success) {
      alert("注册成功！请登录您的账户");
      // 注册成功后跳转到登录页，不保存token
      router.push("/login");
    } else {
      alert(res.data.message || "注册失败，请稍后再试");
    }
  } catch (error) {
    console.error("注册错误:", error);
    
    // 处理验证错误
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const errorMessages = error.response.data.errors.map(err => err.msg).join('\n');
      alert("注册失败：\n" + errorMessages);
    } else if (error.response?.data?.message) {
      alert("注册失败：" + error.response.data.message);
    } else {
      alert("注册失败，请稍后再试");
    }
  }
};

const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.register-page {
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

.register-box {
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

.register-subtitle {
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
.icon-email,
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

.icon-email::before {
  content: "";
  display: inline-block;
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>');
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

.agreement {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: left;
}

.agreement input {
  margin-right: 4px;
  margin-top: 3px;
}

.agreement label {
  color: #666;
}

.agreement a {
  color: #c5c0e5;
  text-decoration: none;
  transition: color 0.3s;
  outline: none;
}

.agreement a:hover {
  color: #8a7bc8;
}

.agreement a:focus {
  outline: none;
}

.register-btn {
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

.register-btn.active {
  background-color: #8a7bc8;
}

.register-btn:hover {
  background-color: #8a7bc8;
}

.login-link {
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #c5c0e5;
  text-decoration: none;
  transition: color 0.3s;
  outline: none;
}

.login-link a:hover {
  color: #8a7bc8;
}

.login-link a:focus {
  outline: none;
}
</style>