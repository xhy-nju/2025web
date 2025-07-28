<template>
  <div class="blind-box-detail">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      返回
    </div>

    <!-- 盲盒信息 -->
    <div class="box-info" v-if="product">
      <div class="box-image">
        <img :src="product.imageUrl" :alt="product.name" />
      </div>
      <div class="box-details">
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>
        <div class="price">¥{{ product.price }}</div>
        <div class="sold-count">已售 {{ product.soldCount }} 件</div>
      </div>
    </div>

    <!-- 盲盒内容物 -->
    <div class="items-section" v-if="product">
      <h2>盲盒内容物</h2>
      <div class="items-grid">
        <div 
          v-for="item in product.items" 
          :key="item.id" 
          class="item-card"
          :class="getRarityClass(item.rarity)"
        >
          <div class="item-image">
            <!-- 显示内容物的实际图片 -->
            <img :src="item.imageUrl" :alt="item.name" />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-rarity">{{ item.rarity }}</div>
            <div class="item-probability">{{ item.probability }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 抽奖按钮 -->
    <div class="lottery-section">
      <button 
        class="lottery-button" 
        @click="drawItem"
        :disabled="isDrawing"
      >
        {{ isDrawing ? '抽奖中...' : '开始抽奖' }}
      </button>
    </div>

    <!-- 抽奖结果弹窗 -->
    <div v-if="showDrawResult" class="result-modal" @click="closeDrawResult">
      <div class="result-content" @click.stop>
        <h3>恭喜获得</h3>
        <div class="result-item" :class="getRarityClass(drawnItem.rarity)">
          <div class="result-image">
            <!-- 显示抽中内容物的实际图片 -->
            <img :src="drawnItem.imageUrl" :alt="drawnItem.name" />
          </div>
          <div class="result-name">{{ drawnItem.name }}</div>
          <div class="result-rarity">{{ drawnItem.rarity }}</div>
        </div>
        <button class="close-button" @click="closeDrawResult">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { blindBoxStore } from '../stores/blindBoxStore.js'

const route = useRoute()
const router = useRouter()

// 使用共享数据存储
const product = computed(() => {
  const id = parseInt(route.params.id)
  return blindBoxStore.getProductById(id)
})

const isDrawing = ref(false)
const showDrawResult = ref(false)
const drawnItem = ref(null)

// 获取稀有度样式类
const getRarityClass = (rarity) => {
  const rarityMap = {
    'SSR': 'ssr',
    'SR': 'sr', 
    'R': 'r',
    'N': 'n'
  }
  return rarityMap[rarity] || 'n'
}

// 抽奖功能
const drawItem = () => {
  if (!product.value || !product.value.items) return
  
  isDrawing.value = true
  
  // 模拟抽奖延迟
  setTimeout(() => {
    const items = product.value.items
    const random = Math.random() * 100
    let currentProbability = 0
    
    for (const item of items) {
      currentProbability += item.probability
      if (random <= currentProbability) {
        drawnItem.value = item
        showDrawResult.value = true
        isDrawing.value = false
        break
      }
    }
  }, 2000)
}

// 关闭结果弹窗
const closeDrawResult = () => {
  showDrawResult.value = false
  drawnItem.value = null
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 组件挂载时获取盲盒数据
onMounted(() => {
  if (!product.value) {
    router.push('/')
  }
})
</script>

<style scoped>
.blind-box-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 16px;
  transition: opacity 0.3s;
}

.back-button:hover {
  opacity: 0.8;
}

.box-info {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.box-image img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 15px;
}

.box-details h1 {
  font-size: 32px;
  margin-bottom: 15px;
  color: #fff;
}

.description {
  font-size: 16px;
  margin-bottom: 20px;
  opacity: 0.9;
  line-height: 1.6;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 10px;
}

.sold-count {
  font-size: 14px;
  opacity: 0.8;
}

.items-section {
  margin-bottom: 40px;
}

.items-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.item-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
  transition: all 0.3s;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.item-image {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
}

.item-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.item-rarity {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.item-probability {
  font-size: 12px;
  opacity: 0.8;
}

/* 稀有度颜色 */
.rarity-ssr {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1));
}

.rarity-ssr .item-rarity {
  color: #ff6b6b;
}

.rarity-sr {
  border-color: #4ecdc4;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(78, 205, 196, 0.1));
}

.rarity-sr .item-rarity {
  color: #4ecdc4;
}

.rarity-r {
  border-color: #45b7d1;
  background: linear-gradient(135deg, rgba(69, 183, 209, 0.2), rgba(69, 183, 209, 0.1));
}

.rarity-r .item-rarity {
  color: #45b7d1;
}

.rarity-n {
  border-color: #96ceb4;
  background: linear-gradient(135deg, rgba(150, 206, 180, 0.2), rgba(150, 206, 180, 0.1));
}

.rarity-n .item-rarity {
  color: #96ceb4;
}

.lottery-section {
  text-align: center;
  margin-bottom: 40px;
}

.lottery-button {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
}

.lottery-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
}

.lottery-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.result-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.result-content h3 {
  font-size: 24px;
  margin-bottom: 30px;
  color: #ffd700;
}

.result-item {
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 15px;
  border: 2px solid;
}

.result-image {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
}

.result-image img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
}

.result-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.result-rarity {
  font-size: 16px;
  font-weight: bold;
}

.close-button {
  background: #fff;
  color: #333;
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-button:hover {
  background: #f0f0f0;
}

@media (max-width: 768px) {
  .box-info {
    flex-direction: column;
    text-align: center;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
  }
  
  .item-card {
    padding: 15px;
  }
}
</style>