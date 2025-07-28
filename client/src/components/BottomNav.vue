<template>
  <div class="bottom-nav">
    <div 
      v-for="item in navItems"
      :key="item.key"
      class="nav-item" 
      :class="{ active: activeTab === item.key }"
      @click="handleTabChange(item.key)"
    >
      <div class="nav-icon">{{ item.icon }}</div>
      <div class="nav-text">{{ item.text }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['tab-change'])

const navItems = [
  { key: 'home', icon: '🏠', text: '首页' },
  { key: 'play', icon: '🎮', text: '玩家秀' },
  { key: 'manage', icon: '📦', text: '管理' },
  { key: 'message', icon: '💬', text: '消息' },
  { key: 'my', icon: '👤', text: '我的' }
]

const handleTabChange = (tab) => {
  emit('tab-change', tab)
}
</script>

<style scoped>
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