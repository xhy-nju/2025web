<template>
  <div class="blind-box-detail">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      返回
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 盲盒信息 -->
    <div class="box-info" v-if="!isLoading && product">
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
    <div class="items-section" v-if="!isLoading && product">
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
    <div class="lottery-section" v-if="!isLoading && product">
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
import { userStore } from '../stores/userStore.js'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// 使用共享数据存储
const product = computed(() => {
  const id = route.params.id; // 不转换为整数，保持原始格式
  console.log('BlindBoxDetail - 路由参数ID:', id, '类型:', typeof id);
  const foundProduct = blindBoxStore.getProductById(id);
  console.log('BlindBoxDetail - 找到的产品:', foundProduct);
  return foundProduct;
})

const isDrawing = ref(false)
const showDrawResult = ref(false)
const drawnItem = ref(null)
const isLoading = ref(true)

// 获取稀有度样式类
const getRarityClass = (rarity) => {
  const rarityMap = {
    // 英文缩写
    'SSR': 'ssr',
    'SR': 'sr', 
    'R': 'r',
    'N': 'n',
    // 中文稀有度（向后兼容）
    '传说': 'ssr',
    '史诗': 'sr',
    '稀有': 'r',
    '普通': 'n'
  }
  return rarityMap[rarity] || 'n'
}

// 抽奖功能 - 调用后端API
const drawItem = async () => {
  if (!product.value) return
  
  isDrawing.value = true
  
  try {
    // 获取认证token
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    // 使用 _id 或 id 字段
    const productId = product.value._id || product.value.id;
    console.log('抽奖 - 使用的产品ID:', productId);
    
    if (!productId) {
      throw new Error('产品ID不存在');
    }
    
    console.log('发送抽奖请求到:', `/api/v1/blind-boxes/${productId}/draw`)
    const response = await axios.post(`/api/v1/blind-boxes/${productId}/draw`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('抽奖API响应:', response.data)
    console.log('响应数据详情:', JSON.stringify(response.data, null, 2))
    
    if (response.data.success) {
      console.log('抽奖成功，数据:', response.data.data)
      console.log('抽中的物品:', response.data.data.drawnItem)
      console.log('剩余金币:', response.data.data.remainingCoins)
      console.log('订单号:', response.data.data.orderNumber)
      console.log('订单ID:', response.data.data.orderId)
      drawnItem.value = response.data.data.drawnItem
      showDrawResult.value = true
      
      // 更新用户金币信息
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
      userInfo.coins = response.data.data.remainingCoins
      localStorage.setItem('user', JSON.stringify(userInfo))
      
      // 可以触发用户信息更新事件
      window.dispatchEvent(new CustomEvent('userCoinsUpdated', { 
        detail: { coins: response.data.data.remainingCoins } 
      }))
      
      // 显示订单创建成功提示
      if (response.data.data.orderNumber) {
        console.log('订单创建成功，订单号:', response.data.data.orderNumber)
        console.log('订单ID:', response.data.data.orderId)
        
        // 触发订单数据刷新事件
        window.dispatchEvent(new CustomEvent('orderCreated', { 
          detail: { 
            orderNumber: response.data.data.orderNumber,
            orderId: response.data.data.orderId
          } 
        }))
        
        // 可以在这里添加一个提示，告诉用户订单已创建
        setTimeout(() => {
          alert(`抽奖成功！订单已创建，订单号：${response.data.data.orderNumber}`)
        }, 2000) // 延迟2秒显示，让用户先看到抽奖结果
      }
    } else {
      console.error('抽奖失败:', response.data.message)
      alert(response.data.message || '抽奖失败')
    }
  } catch (error) {
    console.error('抽奖失败:', error)
    console.error('错误详情:', error.response?.data)
    alert(error.response?.data?.message || '抽奖失败，请稍后再试')
  } finally {
    isDrawing.value = false
  }
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
onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  // 首先检查本地store中是否已有数据
  const localProduct = product.value;
  if (localProduct) {
    console.log('使用本地store数据:', localProduct);
    isLoading.value = false;
    return;
  }

  try {
    // 从后端API获取产品数据
    console.log('从API获取产品数据...');
    const response = await fetch('/api/v1/blind-boxes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API返回的完整数据:', data);
      if (data.success) {
        const blindBoxes = data.data.blindBoxes || [];
        console.log('API返回的盲盒数据:', blindBoxes);
        console.log('盲盒数据长度:', blindBoxes.length);
        
        // 更新store中的数据
        blindBoxStore.setProducts(blindBoxes);
        console.log('API数据更新成功');
        
        // 立即检查更新后的store数据
        const updatedProducts = blindBoxStore.getProducts();
        console.log('更新后的store数据:', updatedProducts);
        console.log('当前路由参数ID:', route.params.id);
        
        // 尝试查找当前产品
        const currentProduct = blindBoxStore.getProductById(route.params.id);
        console.log('查找到的当前产品:', currentProduct);
      }
    } else {
      console.log('API响应失败，使用本地数据');
    }
  } catch (error) {
    console.error('获取产品数据出错:', error);
    console.log('API请求失败，使用本地数据');
  } finally {
    isLoading.value = false;
    
    // 检查产品是否存在（给一些时间让数据更新）
    setTimeout(() => {
      console.log('最终检查 - 当前product.value:', product.value);
      console.log('最终检查 - 路由参数:', route.params);
      console.log('最终检查 - store中的所有产品:', blindBoxStore.getProducts());
      
      if (!product.value) {
        console.log('未找到产品，跳转回首页');
        router.push('/home');
      } else {
        console.log('产品加载成功:', product.value);
      }
    }, 100);
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

.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  font-size: 16px;
  margin: 0;
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