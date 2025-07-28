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
        <div class="message-page">
          <!-- 消息列表页面 -->
          <div v-if="!currentChat" class="message-list-page">
            <div class="message-header">
              <h2>消息</h2>
              <div class="message-actions">
                <button class="new-message-btn" @click="showNewMessageModal = true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="message-list">
              <div 
                v-for="chat in messageList" 
                :key="chat.id"
                class="message-item"
                @click="openChat(chat)"
              >
                <div class="avatar">
                  <img :src="chat.avatar" :alt="chat.name">
                  <div v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</div>
                </div>
                <div class="message-content">
                  <div class="message-top">
                    <div class="contact-name">{{ chat.name }}</div>
                    <div class="message-time">{{ formatTime(chat.lastMessageTime) }}</div>
                  </div>
                  <div class="last-message">{{ chat.lastMessage }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 聊天页面 -->
          <div v-else class="chat-page">
            <div class="chat-header">
              <button class="back-btn" @click="currentChat = null">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                </svg>
              </button>
              <div class="chat-contact">
                <img :src="currentChat.avatar" :alt="currentChat.name" class="contact-avatar">
                <div class="contact-info">
                  <div class="contact-name">{{ currentChat.name }}</div>
                  <div class="contact-status">在线</div>
                </div>
              </div>
              <div class="chat-actions">
                <button class="action-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="chat-messages" ref="chatMessages">
              <div 
                v-for="message in currentChat.messages" 
                :key="message.id"
                class="message-bubble"
                :class="{ 'own-message': message.isOwn }"
              >
                <div class="message-text">{{ message.text }}</div>
                <div class="message-time">{{ formatTime(message.time) }}</div>
              </div>
            </div>

            <div class="chat-input">
              <div class="input-container">
                <button class="emoji-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M17,9A1,1 0 0,1 16,10A1,1 0 0,1 15,9A1,1 0 0,1 16,8A1,1 0 0,1 17,9M9,9A1,1 0 0,1 8,10A1,1 0 0,1 7,9A1,1 0 0,1 8,8A1,1 0 0,1 9,9M12,17.5C14.33,17.5 16.31,16.04 17.11,14H6.89C7.69,16.04 9.67,17.5 12,17.5Z"/>
                  </svg>
                </button>
                <input 
                  v-model="newMessage" 
                  type="text" 
                  placeholder="输入消息..."
                  @keyup.enter="sendMessage"
                  class="message-input"
                >
                <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
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
        <div class="nav-icon">📦</div>
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
import SearchBar from '@/components/SearchBar.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import ProductGrid from '@/components/ProductGrid.vue'
import MessagePage from '@/views/MessagePage.vue'
import BottomNav from '@/components/BottomNav.vue'
import BackToTop from '@/components/BackToTop.vue'
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

// 消息功能相关数据
const currentChat = ref(null);
const newMessage = ref("");
const showNewMessageModal = ref(false);
const chatMessages = ref(null);

// 模拟消息列表数据
const messageList = ref([
  {
    id: 1,
    name: "盲盒小助手",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=helper",
    lastMessage: "您的海贼王盲盒已发货，请注意查收！",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    unreadCount: 1,
    messages: [
      {
        id: 1,
        text: "您好！欢迎来到盲盒世界！",
        time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
        isOwn: false
      },
      {
        id: 2,
        text: "您的海贼王盲盒已发货，请注意查收！",
        time: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
        isOwn: false
      }
    ]
  },
  {
    id: 2,
    name: "客服小美",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=service",
    lastMessage: "好的，我会为您处理退换货申请",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3小时前
    unreadCount: 0,
    messages: [
      {
        id: 1,
        text: "您好，请问有什么可以帮助您的吗？",
        time: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4小时前
        isOwn: false
      },
      {
        id: 2,
        text: "我想申请退换货",
        time: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5小时前
        isOwn: true
      },
      {
        id: 3,
        text: "好的，我会为您处理退换货申请",
        time: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3小时前
        isOwn: false
      }
    ]
  },
  {
    id: 3,
    name: "盲盒达人",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=expert",
    lastMessage: "这个系列真的很不错！",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
    unreadCount: 2,
    messages: [
      {
        id: 1,
        text: "你好！看到你也喜欢收集盲盒",
        time: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25小时前
        isOwn: false
      },
      {
        id: 2,
        text: "是的！我特别喜欢动漫系列",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24.5), // 24.5小时前
        isOwn: true
      },
      {
        id: 3,
        text: "这个系列真的很不错！",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
        isOwn: false
      }
    ]
  },
  {
    id: 4,
    name: "交易伙伴",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=trader",
    lastMessage: "交易愉快！",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2天前
    unreadCount: 0,
    messages: [
      {
        id: 1,
        text: "你好，我想和你交换盲盒",
        time: new Date(Date.now() - 1000 * 60 * 60 * 50), // 50小时前
        isOwn: false
      },
      {
        id: 2,
        text: "可以的，你想要哪个？",
        time: new Date(Date.now() - 1000 * 60 * 60 * 49), // 49小时前
        isOwn: true
      },
      {
        id: 3,
        text: "交易愉快！",
        time: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2天前
        isOwn: false
      }
    ]
  }
]);

// 使用共享数据存储
const allProducts = computed(() => blindBoxStore.getReactiveProducts());

const setActiveTab = (tab) => {
  if (tab === 'manage') {
    // 点击管理时跳转到管理员认证页面
    router.push('/admin-auth');
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

const goToDetail = (id) => {
  router.push(`/blindbox/${id}`);
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

// 消息功能方法
const openChat = (chat) => {
  currentChat.value = chat;
  // 标记消息为已读
  chat.unreadCount = 0;
  // 滚动到底部
  setTimeout(() => {
    scrollToBottom();
  }, 100);
};

const sendMessage = () => {
  if (!newMessage.value.trim() || !currentChat.value) return;
  
  const message = {
    id: Date.now(),
    text: newMessage.value.trim(),
    time: new Date(),
    isOwn: true
  };
  
  currentChat.value.messages.push(message);
  currentChat.value.lastMessage = message.text;
  currentChat.value.lastMessageTime = message.time;
  
  // 清空输入框
  newMessage.value = "";
  
  // 滚动到底部
  setTimeout(() => {
    scrollToBottom();
  }, 100);
  
  // 模拟对方回复（仅用于演示）
  setTimeout(() => {
    if (currentChat.value) {
      const autoReply = {
        id: Date.now() + 1,
        text: getAutoReply(message.text),
        time: new Date(),
        isOwn: false
      };
      currentChat.value.messages.push(autoReply);
      currentChat.value.lastMessage = autoReply.text;
      currentChat.value.lastMessageTime = autoReply.time;
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, 1000 + Math.random() * 2000); // 1-3秒后回复
};

const getAutoReply = (userMessage) => {
  const replies = [
    "收到您的消息，我会尽快处理！",
    "好的，我明白了。",
    "感谢您的反馈！",
    "我会为您查询相关信息。",
    "请稍等，我来为您处理。",
    "您说得对，我会注意的。",
    "谢谢您的建议！"
  ];
  
  if (userMessage.includes("盲盒")) {
    return "关于盲盒的问题，我很乐意为您解答！";
  } else if (userMessage.includes("退货") || userMessage.includes("退换")) {
    return "关于退换货，我会为您详细说明流程。";
  } else if (userMessage.includes("发货") || userMessage.includes("物流")) {
    return "我会为您查询物流信息，请稍等。";
  }
  
  return replies[Math.floor(Math.random() * replies.length)];
};

const scrollToBottom = () => {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
  }
};

const formatTime = (time) => {
  const now = new Date();
  const diff = now - time;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) {
    return "刚刚";
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return time.toLocaleDateString();
  }
};

onMounted(async () => {
  // 检查是否有token
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  // 初始化产品数据
  products.value = [...allProducts.value];

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