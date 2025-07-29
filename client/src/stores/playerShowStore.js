import { reactive, ref } from 'vue'
import { userStore } from './userStore.js'

// 玩家秀数据管理
const state = reactive({
  posts: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    total: 0,
    pageSize: 10,
    totalItems: 0
  }
})

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_PREFIX = '/api/v1'

export const playerShowStore = {
  // 获取状态
  getState() {
    return state
  },

  // 获取帖子列表
  async fetchPosts(page = 1, sort = 'latest') {
    state.loading = true
    state.error = null
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/player-show?page=${page}&sort=${sort}`, {
        headers: {
          'Authorization': `Bearer ${userStore.getToken()}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (page === 1) {
          state.posts = data.data.posts
        } else {
          state.posts.push(...data.data.posts)
        }
        state.pagination = data.data.pagination
      } else {
        throw new Error(data.message || '获取帖子失败')
      }
    } catch (error) {
      console.error('获取帖子失败:', error)
      state.error = error.message
      // 如果API失败，使用模拟数据
      if (page === 1) {
        this.initializeMockData()
      }
    } finally {
      state.loading = false
    }
  },

  // 创建帖子
  async createPost(postData) {
    try {
      const userInfo = userStore.getUserInfo()
      
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/player-show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userStore.getToken()}`
        },
        body: JSON.stringify({
          ...postData,
          userInfo: {
            id: userInfo.id,
            nickname: userInfo.nickname,
            avatar: userInfo.avatar
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 将新帖子添加到列表开头
        state.posts.unshift(data.data)
        return { success: true, data: data.data }
      } else {
        throw new Error(data.message || '发布帖子失败')
      }
    } catch (error) {
      console.error('发布帖子失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 点赞/取消点赞
  async toggleLike(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/player-show/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userStore.getToken()}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 更新本地状态
        const post = state.posts.find(p => p._id === postId)
        if (post) {
          post.likesCount = data.data.likesCount
          post.isLiked = data.data.isLiked
        }
        return { success: true, data: data.data }
      } else {
        throw new Error(data.message || '操作失败')
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 添加评论
  async addComment(postId, content) {
    try {
      const userInfo = userStore.getUserInfo()
      
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/player-show/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userStore.getToken()}`
        },
        body: JSON.stringify({ 
          content,
          userInfo: {
            id: userInfo.id,
            nickname: userInfo.nickname,
            avatar: userInfo.avatar
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 更新本地状态
        const post = state.posts.find(p => p._id === postId)
        if (post) {
          post.comments.push(data.data)
          post.commentsCount = post.comments.length
        }
        return { success: true, data: data.data }
      } else {
        throw new Error(data.message || '添加评论失败')
      }
    } catch (error) {
      console.error('添加评论失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 初始化模拟数据（当API不可用时使用）
  initializeMockData() {
    const userInfo = userStore.getUserInfo()
    
    // 生成头像的辅助函数
    const generateAvatar = (text, color) => {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="${color}"/>
          <text x="20" y="26" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">${text}</text>
        </svg>
      `)}`
    }

    const generateCommentAvatar = (text, color) => {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="15" fill="${color}"/>
          <text x="15" y="20" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">${text}</text>
        </svg>
      `)}`
    }
    
    state.posts = [
      {
        _id: '1',
        userId: {
          _id: '1',
          username: '盲盒收集家',
          avatar: generateAvatar('收', '#667eea')
        },
        title: '今天的收获',
        content: '今天抽到了超稀有的路飞！太开心了！这个海贼王盲盒真的太值了！',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        images: [],
        relatedBlindBox: null,
        likesCount: 0,
        isLiked: false,
        commentsCount: 0,
        comments: [],
        showComments: false
      },
      {
        _id: '2',
        userId: {
          _id: '2',
          username: '迪士尼公主控',
          avatar: generateAvatar('公', '#ff9ff3')
        },
        title: '艾莎公主',
        content: '艾莎公主太美了！这个迪士尼盲盒的质量真的很棒，推荐给大家！',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        images: [],
        relatedBlindBox: null,
        likesCount: 0,
        isLiked: false,
        commentsCount: 0,
        comments: [],
        showComments: false
      }
    ]
  },

  // 格式化时间显示
  formatTime(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now - date
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString()
  },

  // 切换评论显示状态
  toggleComments(postId) {
    const post = state.posts.find(p => p._id === postId)
    if (post) {
      post.showComments = !post.showComments
    }
  }
}