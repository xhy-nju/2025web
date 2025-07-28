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
                :key="item.id"
                class="product-item"
                @click="goToDetail(item.id)"
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
          <p>消息功能开发中...</p>
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
        @click="setActiveTab('play')"
      >
        <div class="nav-icon">🎮</div>
        <div class="nav-text">玩家秀</div>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'manage' }"
        @click="setActiveTab('manage')"
      >
        <div class="nav-icon">⚙️</div>
        <div class="nav-text">管理</div>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'message' }"
        @click="setActiveTab('message')"
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

const router = useRouter();
const activeTab = ref("home");
const currentCategory = ref("热门");
const searchKeyword = ref("");
const searchExecuted = ref(false); // 是否已执行搜索
const actualSearchKeyword = ref(""); // 实际执行搜索的关键词
const loading = ref(false);
const products = ref([]);
const categories = ref(["热门", "新品", "游戏", "动漫", "电影", "手办"]);
const contentArea = ref(null);
const showBackToTop = ref(false);

// 模拟盲盒数据
const mockProducts = ref([
  {
    id: 1,
    name: "海贼王盲盒",
    category: "动漫",
    price: "99.90",
    soldCount: 1234,
    imageUrl: "/src/static/onepiece.jpg",
    isNew: true
  },
  {
    id: 2,
    name: "迪士尼公主盲盒",
    category: "动画",
    price: "69.90",
    soldCount: 856,
    imageUrl: "/src/static/disney.jpg",
    isNew: false
  },
  {
    id: 3,
    name: "漫威英雄盲盒",
    category: "电影",
    price: "79.90",
    soldCount: 2341,
    imageUrl: "/src/static/marvel.jpg",
    isNew: false
  },
  {
    id: 4,
    name: "王者荣耀盲盒",
    category: "游戏",
    price: "89.90",
    soldCount: 567,
    imageUrl: "/src/static/wzry.png",
    isNew: true
  }
]);

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// 计算过滤后的产品列表
const filteredProducts = computed(() => {
  let result = mockProducts.value;
  
  // 只有在执行搜索后才根据搜索关键词过滤
  if (searchExecuted.value && actualSearchKeyword.value.trim()) {
    result = result.filter(product => 
      product.name.toLowerCase().includes(actualSearchKeyword.value.toLowerCase()) ||
      product.category.toLowerCase().includes(actualSearchKeyword.value.toLowerCase())
    );
  }
  
  // 根据分类过滤
  if (currentCategory.value !== "热门") {
    result = result.filter(product => product.category === currentCategory.value);
  }
  
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

const goToDetail = (id) => {
  console.log("跳转到盲盒详情:", id);
  // 这里后续会实现跳转逻辑
};

// 监听滚动事件，控制回到顶部按钮的显示
const handleScroll = () => {
  if (contentArea.value) {
    showBackToTop.value = contentArea.value.scrollTop > 300;
  }
};

// 回到顶部方法
const scrollToTop = () => {
  if (contentArea.value) {
    contentArea.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

onMounted(async () => {
  // 检查是否有token
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
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
  width: 100vw;
  background: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 90px;
  width: 100%;
}

.tab-content {
  height: 100%;
  width: 100%;
  padding: 0;
}

.home-content {
  width: 100%;
  padding: 0;
}

/* 搜索栏样式 */
.search-bar {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
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
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
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
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
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
</style>