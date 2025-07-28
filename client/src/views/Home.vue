<template>
  <div class="home-page">
    <div class="header">
      <h1>🎁 盲盒抽奖系统</h1>
      <div class="user-info">
        <span>欢迎，{{ user?.username }}！</span>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>
    
    <div class="content">
      <div class="user-stats">
        <div class="stat-card">
          <h3>💰 金币</h3>
          <p>{{ user?.coins || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>⭐ 等级</h3>
          <p>{{ user?.level || 1 }}</p>
        </div>
        <div class="stat-card">
          <h3>🎯 经验值</h3>
          <p>{{ user?.experience || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>🎲 抽奖次数</h3>
          <p>{{ user?.totalDraws || 0 }}</p>
        </div>
      </div>
      
      <div class="main-content">
        <h2>盲盒抽奖即将开启...</h2>
        <p>敬请期待更多精彩功能！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const user = ref(null);

onMounted(() => {
  // 获取用户信息
  const userInfo = localStorage.getItem("user");
  if (userInfo) {
    user.value = JSON.parse(userInfo);
  } else {
    // 如果没有用户信息，跳转到登录页
    router.push("/login");
  }
});

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.header h1 {
  color: white;
  margin: 0;
  font-size: 28px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content {
  max-width: 1200px;
  margin: 0 auto;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card h3 {
  color: white;
  margin: 0 0 10px 0;
  font-size: 18px;
}

.stat-card p {
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.main-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.main-content h2 {
  color: white;
  margin: 0 0 20px 0;
  font-size: 32px;
}

.main-content p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  margin: 0;
}
</style>