<template>
  <div class="home-container">
    <!-- 页面内容区域 -->
    <div class="content-area" ref="contentArea">
      <div v-if="activeTab === 'home'" class="tab-content">
        <div class="home-content">
          <!-- 顶部搜索栏 -->
          <div class="search-bar">
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="搜索盲盒..." 
              @keyup.enter="handleSearch"
              class="search-input"
            />
            <button @click="handleSearch" class="search-btn">🔍</button>
          </div>

          <!-- 分类导航栏 -->
          <div class="category-tabs">
            <div 
              v-for="category in categories" 
              :key="category"
              :class="['category-tab', { active: currentCategory === category }]"
              @click="handleCategoryChange(category)"
            >
              {{ category }}
            </div>
          </div>

          <!-- 盲盒展示区域 -->
          <div class="products-area">
            <div v-if="loading" class="loading">加载中...</div>
            <div v-else-if="filteredProducts.length === 0" class="empty-result">
              暂无相关数据
            </div>
            <div v-else class="product-grid">
              <!-- 模拟盲盒数据 -->
              <div 
                v-for="item in filteredProducts" 
                :key="item._id || item.id"
                class="product-item"
                @click="goToDetail(item._id || item.id)"
              >
                <div class="product-image">
                  <img :src="item.imageUrl" :alt="item.name" />
                  <div class="product-tags" v-if="item.isNew">
                    <span class="tag new">NEW</span>
                  </div>
                </div>
                <div class="product-info">
                  <div class="product-name">{{ item.name }}</div>
                  <div class="product-category">{{ item.category }}</div>
                  <div class="product-price-row">
                    <div class="product-price">¥{{ item.price }}</div>
                    <div class="product-sold">已售 {{ item.soldCount }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 其他标签页内容 -->
      <div v-else-if="activeTab === 'play'" class="tab-content">
        <div class="page-content">
          <h2>玩家秀</h2>
          <p>玩家秀功能开发中...</p>
        </div>
      </div>
      <div v-else-if="activeTab === 'manage'" class="tab-content">
        <div class="page-content">
          <h2>管理</h2>
          <p>管理功能开发中...</p>
        </div>
      </div>
      <div v-else-if="activeTab === 'message'" class="tab-content">
        <div class="page-content">
          <h2>消息</h2>
          <p>正在跳转到消息页面...</p>
        </div>
      </div>
      <div v-else-if="activeTab === 'my'" class="tab-content">
        <div class="page-content">
          <h2>我的</h2>
          <p>个人中心功能开发中...</p>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <div class="back-to-top" v-show="showBackToTop" @click="scrollToTop">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"/>
      </svg>
    </div>

    <!-- 底部导航栏 -->
    <div class="bottom-nav">
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'home' }"
        @click="setActiveTab('home')"
      >
        <div class="nav-icon">🏠</div>
        <div class="nav-text">首页</div>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'play' }"
        @click="$router.push('/player-show')"
      >
        <div class="nav-icon">🎮</div>
        <div class="nav-text">玩家秀</div>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'manage' }"
        @click="setActiveTab('manage')"
      >
        <div class="nav-icon">📦</div>
        <div class="nav-text">管理</div>
      </div>
      <div 
        class="nav-item" 
        @click="$router.push('/message')"
      >
        <div class="nav-icon">💬</div>
        <div class="nav-text">消息</div>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'my' }"
        @click="setActiveTab('my')"
      >
        <div class="nav-icon">👤</div>
        <div class="nav-text">我的</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { blindBoxStore } from '@/stores/blindBoxStore.js'

const router = useRouter();
const activeTab = ref("home");
const currentCategory = ref("热门");
const searchKeyword = ref("");
const searchExecuted = ref(false); // 是否已执行搜索
const actualSearchKeyword = ref(""); // 实际执行搜索的关键词
const loading = ref(false);
const products = ref([]);
const categories = ref(["热门", "新品", "动漫", "游戏", "电影", "潮玩"]);
const contentArea = ref(null);
const showBackToTop = ref(false);

// 使用共享数据存储
const allProducts = computed(() => blindBoxStore.getReactiveProducts());

const setActiveTab = (tab) => {
  if (tab === 'manage') {
    // 点击管理时跳转到管理员认证页面
    router.push('/admin-auth');
  } else if (tab === 'my') {
    // 点击我的时跳转到个人中心页面
    router.push('/profile');
  } else if (tab === 'message') {
    // 点击消息时跳转到消息页面
    router.push('/message');
  } else {
    activeTab.value = tab;
  }
};

// 计算过滤后的产品列表
const filteredProducts = computed(() => {
  let result = allProducts.value;
  
  // 只有在执行搜索后才根据搜索关键词过滤
  if (searchExecuted.value && actualSearchKeyword.value.trim()) {
    result = result.filter(product => 
      product.name.toLowerCase().includes(actualSearchKeyword.value.toLowerCase()) ||
      product.category.toLowerCase().includes(actualSearchKeyword.value.toLowerCase())
    );
  }
  
  // 根据分类过滤
  if (currentCategory.value === "新品") {
    // 新品分类：显示所有 isNew 为 true 的产品
    result = result.filter(product => product.isNew === true);
  } else if (currentCategory.value !== "热门") {
    // 其他分类：按 category 字段过滤
    result = result.filter(product => product.category === currentCategory.value);
  }
  // 热门分类：显示所有产品（可以按销量排序）
  
  return result;
});

const handleSearch = async () => {
  // 设置搜索执行状态
  searchExecuted.value = true;
  actualSearchKeyword.value = searchKeyword.value;
  
  if (!searchKeyword.value.trim()) {
    // 如果搜索关键词为空，重置搜索状态
    searchExecuted.value = false;
    actualSearchKeyword.value = "";
    return;
  }
  
  loading.value = true;
  console.log("搜索关键词:", searchKeyword.value);
  
  try {
    // 调用后端搜索API
    const response = await fetch('/api/v1/products/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        keyword: searchKeyword.value,
        category: currentCategory.value !== "热门" ? currentCategory.value : null
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      // 如果后端返回数据，使用后端数据；否则使用本地过滤
      if (data.success && data.products && data.products.length > 0) {
        products.value = data.products;
      }
    } else {
      console.warn('搜索API调用失败，使用本地数据');
    }
  } catch (error) {
    console.warn('搜索API调用出错，使用本地数据:', error);
  } finally {
    loading.value = false;
  }
};

const handleCategoryChange = async (category) => {
  currentCategory.value = category;
  // 切换分类时重置搜索状态
  searchExecuted.value = false;
  actualSearchKeyword.value = "";
  searchKeyword.value = "";
  
  console.log("切换分类:", category);
  
  loading.value = true;
  
  try {
    // 调用后端分类API
    const response = await fetch('/api/v1/products/category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        category: category === "热门" ? null : category
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      // 如果后端返回数据，使用后端数据；否则使用本地过滤
      if (data.success && data.products && data.products.length > 0) {
        products.value = data.products;
      }
    } else {
      console.warn('分类API调用失败，使用本地数据');
    }
  } catch (error) {
    console.warn('分类API调用出错，使用本地数据:', error);
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id, event) => {
  // 阻止默认行为和事件冒泡
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  console.log('=== 点击盲盒详情 ===');
  console.log('盲盒ID:', id);
  console.log('filteredProducts数据:', filteredProducts.value);
  console.log('filteredProducts第一个产品:', filteredProducts.value[0]);
  console.log('filteredProducts第一个产品的id:', filteredProducts.value[0]?.id);
  console.log('allProducts数据:', allProducts.value);
  console.log('allProducts第一个产品:', allProducts.value[0]);
  console.log('allProducts第一个产品的id:', allProducts.value[0]?.id);
  console.log('store中的原始数据:', blindBoxStore.getProducts());
  console.log('store第一个产品:', blindBoxStore.getProducts()[0]);
  console.log('store第一个产品的id:', blindBoxStore.getProducts()[0]?.id);
  console.log('当前路由:', router.currentRoute.value.path);
  console.log('目标路由:', `/blindbox/${id}`);
  console.log('router对象:', router);
  
  // 如果ID是undefined，尝试从事件中获取
  if (id === undefined && event && event.target) {
    console.log('ID为undefined，尝试从DOM中获取...');
    const productItem = event.target.closest('.product-item');
    if (productItem) {
      const productIndex = Array.from(productItem.parentNode.children).indexOf(productItem);
      console.log('产品索引:', productIndex);
      if (filteredProducts.value[productIndex]) {
        id = filteredProducts.value[productIndex].id;
        console.log('从DOM获取的ID:', id);
      }
    }
  }
  
  if (id === undefined) {
    console.error('无法获取有效的产品ID');
    return;
  }
  
  try {
    // 使用 router.push 进行导航
    const targetRoute = `/blindbox/${id}`;
    console.log('开始路由跳转...');
    
    router.push(targetRoute).then(() => {
      console.log('路由跳转成功完成');
    }).catch((error) => {
      console.error('路由跳转Promise失败:', error);
      // 如果push失败，尝试使用replace
      console.log('尝试使用router.replace...');
      router.replace(targetRoute);
    });
    
  } catch (error) {
    console.error('路由跳转异常:', error);
    // 备选方案：使用window.location
    console.log('使用window.location作为备选方案');
    window.location.href = `#/blindbox/${id}`;
  }
};

// 监听滚动事件，控制回到顶部按钮的显示
const handleScroll = () => {
  if (contentArea.value) {
    showBackToTop.value = contentArea.value.scrollTop > 100;
  }
};

// 回到顶部方法
const scrollToTop = () => {
  if (contentArea.value) {
    // 使用更快的滚动动画
    const startPosition = contentArea.value.scrollTop;
    const startTime = performance.now();
    const duration = 600; // 600ms，比默认的smooth更快

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用easeOutCubic缓动函数，开始快，结束慢，保持平滑
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentPosition = startPosition * (1 - easeOutCubic);
      
      contentArea.value.scrollTop = currentPosition;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  }
};

onMounted(async () => {
  // 检查是否有token
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  try {
    // 从后端API获取产品数据
    const response = await fetch('/api/v1/blind-boxes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // 更新store中的数据
        blindBoxStore.setProducts(data.data.blindBoxes || []);
        // allProducts是计算属性，会自动更新，不需要手动赋值
        products.value = [...allProducts.value];
      } else {
        console.error('获取产品数据失败:', data.message);
        // 使用store中的默认数据
        // allProducts是计算属性，会自动更新，不需要手动赋值
        products.value = [...allProducts.value];
      }
    } else {
      console.error('API调用失败:', response.status);
      // 使用store中的默认数据
      // allProducts是计算属性，会自动更新，不需要手动赋值
      products.value = [...allProducts.value];
    }
  } catch (error) {
    console.error('获取产品数据出错:', error);
    // 如果API调用失败，使用store中的默认数据
    // allProducts是计算属性，会自动更新，不需要手动赋值
    products.value = [...allProducts.value];
  }

  // 添加滚动监听
  if (contentArea.value) {
    contentArea.value.addEventListener("scroll", handleScroll);
  }
});

onUnmounted(() => {
  // 清理滚动监听
  if (contentArea.value) {
    try {
      contentArea.value.removeEventListener("scroll", handleScroll);
    } catch (error) {
      console.warn("清理滚动监听器时发生错误:", error);
    }
  }
});
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

.tab-content {
  min-height: 100%;
  background: white;
}

.home-content {
  padding: 0;
}

/* 搜索栏样式 */
.search-bar {
  display: flex;
  gap: 10px;
  padding: 10px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.search-input:focus {
  border-color: rgba(255, 255, 255, 0.8);
  background: white;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.search-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 分类标签样式 */
.category-tabs {
  display: flex;
  gap: 12px;
  padding: 20px 15px;
  background: white;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f0;
}

.category-tab {
  padding: 10px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #666;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid transparent;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-tab:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

/* 产品区域样式 */
.products-area {
  padding: 20px 15px;
  background: white;
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.loading,
.empty-result {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: calc(100vh - 200px);
  color: #999;
  font-size: 16px;
  font-weight: 500;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  padding: 10px 0;
}

.product-item {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.product-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.product-item:active {
  transform: scale(0.98) translateY(-2px);
}

.product-image {
  height: 180px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  backdrop-filter: blur(10px);
}

.tag.new {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.product-info {
  padding: 16px;
  background: white;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  max-height: 2.8em;
}

.product-category {
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
  font-weight: 500;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 17px;
  font-weight: bold;
  color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.product-sold {
  font-size: 11px;
  color: #999;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

/* 底部导航栏样式 */
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

/* 回到顶部按钮样式 */
.back-to-top {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  cursor: pointer;
  z-index: 99;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.back-to-top:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.back-to-top:active {
  transform: scale(0.95);
}

.back-to-top svg {
  width: 26px;
  height: 26px;
}

/* 页面内容样式 */
.page-content {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.page-content h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 媒体查询以适应不同屏幕 */
@media (min-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 消息页面样式 */
.message-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 消息列表页面样式 */
.message-list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.message-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.message-actions {
  display: flex;
  gap: 10px;
}

.new-message-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  background: white;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
}

.message-item:last-child {
  border-bottom: none;
}

.avatar {
  position: relative;
  margin-right: 15px;
}

.avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  border: 2px solid white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.contact-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.last-message {
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 聊天页面样式 */
.chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.back-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-contact {
  display: flex;
  align-items: center;
  flex: 1;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.contact-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.chat-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-bubble {
  max-width: 70%;
  word-wrap: break-word;
  animation: fadeInUp 0.3s ease;
}

.message-bubble.own-message {
  align-self: flex-end;
}

.message-bubble:not(.own-message) {
  align-self: flex-start;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  position: relative;
}

.message-bubble.own-message .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 6px;
}

.message-bubble:not(.own-message) .message-text {
  background: white;
  color: #333;
  border: 1px solid #e9ecef;
  border-bottom-left-radius: 6px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.message-bubble:not(.own-message) .message-time {
  text-align: left;
}

.chat-input {
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  border-radius: 25px;
  padding: 8px 15px;
  border: 1px solid #e9ecef;
}

.emoji-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  padding: 8px 0;
  color: #333;
}

.message-input::placeholder {
  color: #999;
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .chat-messages {
    padding: 15px;
  }
  
  .message-header {
    padding: 15px;
  }
  
  .chat-header {
    padding: 12px 15px;
  }
}
</style>