<template>
  <div class="player-show-container">
    <!-- 头部 -->
    <div class="header">
      <h1>玩家秀</h1>
      <button @click="showCreatePost = true" class="create-btn">发帖</button>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-list">
      <div v-if="posts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p>还没有帖子，快来发布第一个吧！</p>
      </div>
      <div v-else class="post-items">
        <div 
          v-for="post in posts" 
          :key="post.id" 
          class="post-card"
        >
          <!-- 用户信息 -->
          <div class="post-header">
            <img :src="post.user.avatar" :alt="post.user.nickname" class="user-avatar" />
            <div class="user-info">
              <h3 class="username">{{ post.user.nickname }}</h3>
              <span class="post-time">{{ post.createTime }}</span>
            </div>
          </div>

          <!-- 帖子内容 -->
          <div class="post-content">
            <p class="post-text">{{ post.content }}</p>
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <img 
                v-for="(image, index) in post.images" 
                :key="index"
                :src="image" 
                :alt="`图片${index + 1}`"
                class="post-image"
                @click="previewImage(image)"
              />
            </div>
          </div>

          <!-- 盲盒链接 -->
          <div v-if="post.blindBox" class="blindbox-link" @click="goToBlindBox(post.blindBox.id)">
            <img :src="post.blindBox.image" :alt="post.blindBox.name" class="blindbox-image" />
            <div class="blindbox-info">
              <h4>{{ post.blindBox.name }}</h4>
              <p class="blindbox-price">¥{{ post.blindBox.price }}</p>
            </div>
            <div class="link-arrow">→</div>
          </div>

          <!-- 互动区域 -->
          <div class="post-actions">
            <button 
              :class="['action-btn', 'like-btn', { active: post.isLiked }]"
              @click="toggleLike(post.id)"
            >
              <span class="action-icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
              <span class="action-text">{{ post.likes }}</span>
            </button>
            <button 
              class="action-btn comment-btn"
              @click="showComments(post.id)"
            >
              <span class="action-icon">💬</span>
              <span class="action-text">{{ post.comments.length }}</span>
            </button>
            <button class="action-btn share-btn" @click="sharePost(post.id)">
              <span class="action-icon">📤</span>
              <span class="action-text">分享</span>
            </button>
          </div>

          <!-- 评论区域 -->
          <div v-if="post.showComments" class="comments-section">
            <div class="comments-list">
              <div 
                v-for="comment in post.comments" 
                :key="comment.id"
                class="comment-item"
              >
                <img :src="comment.user.avatar" :alt="comment.user.nickname" class="comment-avatar" />
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
                @keyup.enter="addComment(post.id)"
              />
              <button @click="addComment(post.id)" class="send-btn">发送</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发帖弹窗 -->
    <div v-if="showCreatePost" class="modal-overlay" @click="closeCreatePost">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>发布帖子</h3>
          <button @click="closeCreatePost" class="close-btn">×</button>
        </div>
        <div class="create-post-form">
          <textarea 
            v-model="newPost.content"
            placeholder="分享你的盲盒收获..."
            class="post-textarea"
            rows="4"
          ></textarea>
          
          <div class="form-section">
            <label>选择关联盲盒（可选）</label>
            <select v-model="newPost.blindBoxId" class="blindbox-select">
              <option value="">不关联盲盒</option>
              <option v-for="box in availableBlindBoxes" :key="box.id" :value="box.id">
                {{ box.name }} - ¥{{ box.price }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button @click="closeCreatePost" class="cancel-btn">取消</button>
            <button @click="createPost" class="submit-btn" :disabled="!newPost.content.trim()">
              发布
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="previewImageUrl" class="image-preview-overlay" @click="closeImagePreview">
      <img :src="previewImageUrl" alt="预览图片" class="preview-image" />
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
        <div class="nav-icon">⚙️</div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '../stores/userStore.js'

const router = useRouter()

// 响应式数据
const posts = ref([])
const showCreatePost = ref(false)
const newComment = reactive({})
const previewImageUrl = ref('')

const newPost = reactive({
  content: '',
  blindBoxId: ''
})

// 可用的盲盒列表
const availableBlindBoxes = ref([
  { id: 1, name: '海贼王盲盒', price: 59.90, image: '/src/static/onepiece.jpg' },
  { id: 2, name: '迪士尼公主盲盒', price: 69.90, image: '/src/static/disney.jpg' },
  { id: 3, name: '漫威英雄盲盒', price: 79.90, image: '/src/static/marvel.jpg' }
])

// 初始化示例帖子数据
const initializePosts = () => {
  posts.value = [
    {
      id: 1,
      user: {
        id: 1,
        nickname: '盲盒收集家',
        avatar: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23667eea"/%3E%3Ctext x="20" y="24" font-family="Arial" font-size="12" fill="white" text-anchor="middle"%3E收%3C/text%3E%3C/svg%3E'
      },
      content: '今天抽到了超稀有的路飞！太开心了！这个海贼王盲盒真的太值了！',
      createTime: '2小时前',
      images: [],
      blindBox: {
        id: 1,
        name: '海贼王盲盒',
        price: 59.90,
        image: '/src/static/onepiece.jpg'
      },
      likes: 15,
      isLiked: false,
      comments: [
        {
          id: 1,
          user: {
            nickname: '动漫迷',
            avatar: 'data:image/svg+xml,%3Csvg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="15" cy="15" r="15" fill="%23ff6b6b"/%3E%3Ctext x="15" y="18" font-family="Arial" font-size="10" fill="white" text-anchor="middle"%3E动%3C/text%3E%3C/svg%3E'
          },
          content: '哇，好羡慕！我也想要路飞',
          createTime: '1小时前'
        }
      ],
      showComments: false
    },
    {
      id: 2,
      user: {
        id: 2,
        nickname: '迪士尼公主控',
        avatar: 'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23ff9ff3"/%3E%3Ctext x="20" y="24" font-family="Arial" font-size="12" fill="white" text-anchor="middle"%3E公%3C/text%3E%3C/svg%3E'
      },
      content: '艾莎公主太美了！这个迪士尼盲盒的质量真的很棒，推荐给大家！',
      createTime: '5小时前',
      images: [],
      blindBox: {
        id: 2,
        name: '迪士尼公主盲盒',
        price: 69.90,
        image: '/src/static/disney.jpg'
      },
      likes: 23,
      isLiked: true,
      comments: [
        {
          id: 2,
          user: {
            nickname: '童话梦想家',
            avatar: 'data:image/svg+xml,%3Csvg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="15" cy="15" r="15" fill="%2354a0ff"/%3E%3Ctext x="15" y="18" font-family="Arial" font-size="10" fill="white" text-anchor="middle"%3E童%3C/text%3E%3C/svg%3E'
          },
          content: '我也抽到了艾莎！确实很漂亮',
          createTime: '3小时前'
        },
        {
          id: 3,
          user: {
            nickname: '盲盒新手',
            avatar: 'data:image/svg+xml,%3Csvg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="15" cy="15" r="15" fill="%2326de81"/%3E%3Ctext x="15" y="18" font-family="Arial" font-size="10" fill="white" text-anchor="middle"%3E新%3C/text%3E%3C/svg%3E'
          },
          content: '请问这个盲盒在哪里可以买到？',
          createTime: '2小时前'
        }
      ],
      showComments: false
    }
  ]
}

// 方法
const toggleLike = (postId) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.isLiked = !post.isLiked
    post.likes += post.isLiked ? 1 : -1
  }
}

const showComments = (postId) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.showComments = !post.showComments
  }
}

const addComment = (postId) => {
  const commentText = newComment[postId]
  if (!commentText || !commentText.trim()) return

  const post = posts.value.find(p => p.id === postId)
  if (post) {
    const userInfo = userStore.getUserInfo()
    const newCommentObj = {
      id: Date.now(),
      user: {
        nickname: userInfo.nickname,
        avatar: userInfo.avatar
      },
      content: commentText.trim(),
      createTime: '刚刚'
    }
    post.comments.push(newCommentObj)
    newComment[postId] = ''
  }
}

const sharePost = (postId) => {
  alert('分享功能待实现')
}

const goToBlindBox = (blindBoxId) => {
  router.push(`/blindbox/${blindBoxId}`)
}

const previewImage = (imageUrl) => {
  previewImageUrl.value = imageUrl
}

const closeImagePreview = () => {
  previewImageUrl.value = ''
}

const closeCreatePost = () => {
  showCreatePost.value = false
  newPost.content = ''
  newPost.blindBoxId = ''
}

const createPost = () => {
  if (!newPost.content.trim()) return

  const userInfo = userStore.getUserInfo()
  const selectedBlindBox = availableBlindBoxes.value.find(box => box.id == newPost.blindBoxId)
  
  const post = {
    id: Date.now(),
    user: {
      id: userInfo.id,
      nickname: userInfo.nickname,
      avatar: userInfo.avatar
    },
    content: newPost.content.trim(),
    createTime: '刚刚',
    images: [],
    blindBox: selectedBlindBox || null,
    likes: 0,
    isLiked: false,
    comments: [],
    showComments: false
  }

  posts.value.unshift(post)
  closeCreatePost()
  alert('发布成功！')
}

// 生命周期
onMounted(() => {
  initializePosts()
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

.posts-list {
  padding: 20px;
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