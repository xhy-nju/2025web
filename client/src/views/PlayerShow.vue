<template>
  <div class="player-show-container">
    <!-- 头部 -->
    <div class="header">
      <h1>玩家秀</h1>
      <button class="create-btn" @click="showCreatePost = true">
        ✏️ 发帖
      </button>
    </div>

    <!-- 排序选择 -->
    <div class="sort-tabs">
      <button 
        class="sort-tab" 
        :class="{ active: playerShowStore.sortType === 'latest' }"
        @click="changeSortType('latest')"
      >
        最新
      </button>
      <button 
        class="sort-tab" 
        :class="{ active: playerShowStore.sortType === 'hot' }"
        @click="changeSortType('hot')"
      >
        热门
      </button>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-list">
      <!-- 加载状态 -->
      <div v-if="playerShowStore.loading && playerShowStore.posts.length === 0" class="loading-state">
        <div class="loading-spinner">⏳</div>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!playerShowStore.loading && playerShowStore.posts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p>还没有帖子，快来发布第一个吧！</p>
      </div>

      <!-- 帖子列表 -->
      <div v-else class="post-items">
        <div v-for="post in playerShowStore.posts" :key="post.id" class="post-card">
          <!-- 帖子头部 -->
          <div class="post-header">
            <img :src="post.user.avatar" :alt="post.user.nickname" class="user-avatar">
            <div class="user-info">
              <h3 class="username">{{ post.user.nickname }}</h3>
              <p class="post-time">{{ post.createTime }}</p>
            </div>
          </div>

          <!-- 帖子内容 -->
          <div class="post-content">
            <h4 v-if="post.title" class="post-title">{{ post.title }}</h4>
            <p class="post-text">{{ post.content }}</p>
            
            <!-- 图片 -->
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <img 
                v-for="(image, index) in post.images" 
                :key="index"
                :src="image" 
                :alt="`图片${index + 1}`"
                class="post-image"
                @click="previewImage(image)"
              >
            </div>

            <!-- 关联盲盒 -->
            <div v-if="post.blindBox" class="blindbox-link" @click="goToBlindBox(post.blindBox.id)">
              <img :src="post.blindBox.image" :alt="post.blindBox.name" class="blindbox-image">
              <div class="blindbox-info">
                <h4>{{ post.blindBox.name }}</h4>
                <p class="blindbox-price">¥{{ post.blindBox.price }}</p>
                <p v-if="post.blindBox.drawnItem" class="drawn-item">抽中：{{ post.blindBox.drawnItem }}</p>
              </div>
              <span class="link-arrow">→</span>
            </div>
          </div>

          <!-- 帖子操作 -->
          <div class="post-actions">
            <button 
              class="action-btn" 
              :class="{ active: post.isLiked }"
              @click="handleToggleLike(post.id)"
            >
              <span class="action-icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
              <span class="action-text">{{ post.likes }}</span>
            </button>
            
            <button class="action-btn" @click="playerShowStore.toggleComments(post.id)">
              <span class="action-icon">💬</span>
              <span class="action-text">{{ post.comments.length }}</span>
            </button>

            <button class="action-btn">
              <span class="action-icon">👁️</span>
              <span class="action-text">{{ post.viewsCount || 0 }}</span>
            </button>
          </div>

          <!-- 评论区 -->
          <div v-if="post.showComments" class="comments-section">
            <div v-if="post.comments.length > 0" class="comments-list">
              <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                <img :src="comment.user.avatar" :alt="comment.user.nickname" class="comment-avatar">
                <div class="comment-content">
                  <span class="comment-user">{{ comment.user.nickname }}</span>
                  <p class="comment-text">{{ comment.content }}</p>
                  <span class="comment-time">{{ comment.createTime }}</span>
                </div>
              </div>
            </div>
            
            <div class="comment-input-area">
              <input 
                v-model="newComment[post.id]" 
                type="text" 
                placeholder="写评论..." 
                class="comment-input"
                @keyup.enter="handleAddComment(post.id)"
              >
              <button class="send-btn" @click="handleAddComment(post.id)">发送</button>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="playerShowStore.hasMore && !playerShowStore.loading" class="load-more">
          <button class="load-more-btn" @click="loadMore">加载更多</button>
        </div>

        <!-- 底部加载状态 -->
        <div v-if="playerShowStore.loading && playerShowStore.posts.length > 0" class="loading-more">
          <div class="loading-spinner">⏳</div>
          <p>加载更多...</p>
        </div>
      </div>
    </div>

    <!-- 发帖弹窗 -->
    <div v-if="showCreatePost" class="modal-overlay" @click.self="closeCreatePost">
      <div class="modal-content">
        <div class="modal-header">
          <h3>发布新帖</h3>
          <button class="close-btn" @click="closeCreatePost">×</button>
        </div>
        <div class="create-post-form">
          <div class="form-section">
            <label>标题（可选）</label>
            <input 
              v-model="newPost.title" 
              type="text" 
              placeholder="给你的帖子起个标题..." 
              class="post-input"
            >
          </div>
          
          <div class="form-section">
            <label>内容</label>
            <textarea 
              v-model="newPost.content" 
              placeholder="分享你的盲盒收获或心得..." 
              rows="4" 
              class="post-textarea"
            ></textarea>
          </div>
          
          <div class="form-section">
            <label>关联盲盒（可选）</label>
            <select v-model="newPost.blindBoxId" class="blindbox-select">
              <option value="">选择相关盲盒</option>
              <option 
                v-for="blindBox in availableBlindBoxes" 
                :key="blindBox.id" 
                :value="blindBox.id"
              >
                {{ blindBox.name }} - ¥{{ blindBox.price }}
              </option>
            </select>
          </div>
          
          <div class="form-actions">
            <button class="cancel-btn" @click="closeCreatePost">取消</button>
            <button 
              class="submit-btn" 
              :disabled="!newPost.content.trim() || playerShowStore.creating"
              @click="handleCreatePost"
            >
              {{ playerShowStore.creating ? '发布中...' : '发布' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="previewImageUrl" class="image-preview-overlay" @click="closeImagePreview">
      <img :src="previewImageUrl" alt="预览图片" class="preview-image">
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div class="nav-item" @click="$router.push('/home')">
        <div class="nav-icon">🏠</div>
        <div class="nav-text">首页</div>
      </div>
      <div class="nav-item active">
        <div class="nav-icon">🎮</div>
        <div class="nav-text">玩家秀</div>
      </div>
      <div class="nav-item" @click="$router.push('/admin-auth')">
        <div class="nav-icon">📦</div>
        <div class="nav-text">管理</div>
      </div>
      <div class="nav-item" @click="$router.push('/message')">
        <div class="nav-icon">💬</div>
        <div class="nav-text">消息</div>
      </div>
      <div class="nav-item" @click="$router.push('/profile')">
        <div class="nav-icon">👤</div>
        <div class="nav-text">我的</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerShowStore } from '@/stores/playerShowStore'
import { useUserStore } from '@/stores/userStore'
import { useBlindBoxStore } from '@/stores/blindBoxStore'

// 路由和状态管理
const router = useRouter()
const playerShowStore = usePlayerShowStore()
const userStore = useUserStore()
const blindBoxStore = useBlindBoxStore()

// 响应式数据
const showCreatePost = ref(false)
const previewImageUrl = ref('')
const newComment = reactive({})

// 新帖子数据
const newPost = reactive({
  title: '',
  content: '',
  blindBoxId: '',
  images: []
})

// 计算属性
const availableBlindBoxes = computed(() => {
  const products = blindBoxStore.getProducts()
  return products.map(product => ({
    id: product._id || product.id, // 支持后端的_id和前端的id
    name: product.name,
    price: product.price,
    image: product.imageUrl
  }))
})

// 方法
const changeSortType = async (sortType) => {
  if (sortType !== playerShowStore.sortType) {
    await playerShowStore.fetchPosts(1, sortType, true)
  }
}

const handleToggleLike = async (postId) => {
  try {
    if (!userStore.isLoggedIn) {
      alert('请先登录')
      router.push('/login')
      return
    }
    
    await playerShowStore.toggleLike(postId)
  } catch (error) {
    console.error('点赞失败:', error)
    alert(error.message || '点赞失败，请重试')
  }
}

const handleAddComment = async (postId) => {
  const commentText = newComment[postId]
  if (!commentText || !commentText.trim()) return

  try {
    if (!userStore.isLoggedIn) {
      alert('请先登录')
      router.push('/login')
      return
    }

    await playerShowStore.addComment(postId, commentText.trim())
    newComment[postId] = ''
  } catch (error) {
    console.error('添加评论失败:', error)
    alert(error.message || '添加评论失败，请重试')
  }
}

const handleCreatePost = async () => {
  if (!newPost.content.trim()) return

  try {
    if (!userStore.isLoggedIn) {
      alert('请先登录')
      router.push('/login')
      return
    }

    // 构建符合后端期望的数据格式
    const postData = {
      title: newPost.title.trim() || '分享我的收获',
      content: newPost.content.trim(),
      images: newPost.images || []
    }

    // 如果选择了盲盒，添加关联信息
    if (newPost.blindBoxId) {
      const selectedBlindBox = availableBlindBoxes.value.find(box => box.id === newPost.blindBoxId)
      if (selectedBlindBox) {
        postData.relatedBlindBox = {
          blindBoxId: newPost.blindBoxId,
          blindBoxName: selectedBlindBox.name
        }
      }
    }

    await playerShowStore.createPost(postData)
    closeCreatePost()
    alert('发布成功！')
  } catch (error) {
    console.error('发布帖子失败:', error)
    alert(error.message || '发布失败，请重试')
  }
}

const loadMore = async () => {
  if (playerShowStore.hasMore && !playerShowStore.loading) {
    const nextPage = playerShowStore.pagination.current + 1
    await playerShowStore.fetchPosts(nextPage, playerShowStore.sortType, false)
  }
}

const goToBlindBox = (blindBoxId) => {
  if (blindBoxId) {
    router.push(`/blindbox/${blindBoxId}`)
  }
}

const previewImage = (imageUrl) => {
  previewImageUrl.value = imageUrl
}

const closeImagePreview = () => {
  previewImageUrl.value = ''
}

const closeCreatePost = () => {
  showCreatePost.value = false
  newPost.title = ''
  newPost.content = ''
  newPost.blindBoxId = ''
  newPost.images = []
}

// 生命周期
onMounted(async () => {
  // 确保用户信息已加载
  if (!userStore.userInfo && userStore.isLoggedIn) {
    await userStore.fetchUserInfo()
  }
  
  // 从后端API获取最新的盲盒数据
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const response = await fetch('/api/v1/blind-boxes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          blindBoxStore.setProducts(data.data.blindBoxes || [])
        }
      }
    }
  } catch (error) {
    console.error('获取盲盒数据失败:', error)
  }
  
  // 确保盲盒数据已初始化（使用默认数据作为备用）
  blindBoxStore.initializeData()
  
  // 获取帖子列表
  await playerShowStore.fetchPosts(1, 'latest', true)
})

onUnmounted(() => {
  // 清理状态
  playerShowStore.resetState()
})
</script>

<style scoped>
.player-show-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 70px;
}

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.create-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.create-btn:hover {
  background: #5a6fd8;
}

/* 排序选择 */
.sort-tabs {
  display: flex;
  background: white;
  padding: 10px 20px;
  border-bottom: 1px solid #e9ecef;
  gap: 10px;
}

.sort-tab {
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.sort-tab.active {
  background: #667eea;
  color: white;
}

.sort-tab:hover:not(.active) {
  background: #f8f9fa;
  color: #333;
}

.posts-list {
  padding: 20px;
}

/* 加载状态 */
.loading-state, .loading-more {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.loading-spinner {
  font-size: 24px;
  margin-bottom: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.post-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.username {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-content {
  margin-bottom: 15px;
}

.post-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.post-text {
  margin: 0 0 10px 0;
  line-height: 1.6;
  color: #333;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.post-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
}

.blindbox-link {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e9ecef;
}

.blindbox-link:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.blindbox-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 12px;
}

.blindbox-info {
  flex: 1;
}

.blindbox-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
}

.blindbox-price {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #667eea;
}

.drawn-item {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #28a745;
  font-weight: 500;
}

.link-arrow {
  font-size: 18px;
  color: #999;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s;
  color: #666;
}

.action-btn:hover {
  background: #f8f9fa;
}

.action-btn.active {
  color: #ff6b6b;
}

.action-icon {
  font-size: 16px;
}

.action-text {
  font-size: 14px;
}

.comments-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.comments-list {
  margin-bottom: 15px;
}

.comment-item {
  display: flex;
  margin-bottom: 12px;
}

.comment-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.comment-text {
  margin: 4px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-input-area {
  display: flex;
  gap: 10px;
}

.comment-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.comment-input:focus {
  border-color: #667eea;
}

.send-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px;
}

.load-more-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.load-more-btn:hover {
  background: #5a6fd8;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.create-post-form {
  padding: 20px;
}

.post-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  margin-bottom: 15px;
  box-sizing: border-box;
}

.post-input:focus {
  border-color: #667eea;
}

.post-textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  resize: vertical;
  outline: none;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.post-textarea:focus {
  border-color: #667eea;
}

.form-section {
  margin-bottom: 20px;
}

.form-section label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.blindbox-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.blindbox-select:focus {
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.submit-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 图片预览 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

/* 底部导航 */
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
  -webkit-backdrop-filter: blur(10px);
  box-sizing: border-box;
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
  min-height: 70px;
  box-sizing: border-box;
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