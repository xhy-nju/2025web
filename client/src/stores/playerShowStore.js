import { defineStore } from 'pinia'
import axios from 'axios'
import { useUserStore } from './userStore.js'

export const usePlayerShowStore = defineStore('playerShow', {
  state: () => ({
    posts: [],
    currentPost: null,
    loading: false,
    creating: false,
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
      totalItems: 0
    },
    sortType: 'latest' // latest, hot
  }),

  getters: {
    // 获取当前页面的帖子
    currentPosts: (state) => state.posts,
    
    // 检查是否还有更多帖子
    hasMore: (state) => {
      return state.pagination.current < state.pagination.total
    },

    // 获取帖子总数
    totalPosts: (state) => state.pagination.totalItems
  },

  actions: {

  // 获取帖子列表
    async fetchPosts(page = 1, sort = 'latest', reset = false) {
      try {
        this.loading = true
        
        const token = localStorage.getItem('token')
        const headers = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await axios.get('/api/v1/player-show', {
          params: {
            page,
            limit: this.pagination.pageSize,
            sort
          },
          headers
        })

        if (response.data.success) {
          const { posts, pagination } = response.data.data
          
          // 转换数据格式以适配前端
          const formattedPosts = posts.map(post => {
            // 安全地访问嵌套属性
            const userId = post.userId || {}
            const relatedBlindBox = post.relatedBlindBox || {}
            const blindBoxId = relatedBlindBox.blindBoxId || {}
            
            return {
              id: post._id || post.id || Math.random().toString(36).substr(2, 9),
              user: {
                id: userId._id || userId.id || userId,
                nickname: userId.nickname || userId.username || post.username || '匿名用户',
                avatar: userId.avatar || post.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId.username || 'default'}`
              },
              content: post.content || '',
              title: post.title || '',
              images: post.images || [],
              blindBox: blindBoxId._id || blindBoxId.id ? {
                id: blindBoxId._id || blindBoxId.id,
                name: relatedBlindBox.blindBoxName || blindBoxId.name || '未知盲盒',
                image: blindBoxId.imageUrl || blindBoxId.image,
                price: parseFloat(blindBoxId.price || 0).toFixed(0),
                drawnItem: relatedBlindBox.drawnItem
              } : null,
              likes: post.likesCount || 0,
              comments: (post.comments || []).map(comment => {
                const commentUserId = comment.userId || {}
                return {
                  id: comment._id || comment.id || Math.random().toString(36).substr(2, 9),
                  user: {
                    id: commentUserId._id || commentUserId.id || commentUserId,
                    nickname: commentUserId.nickname || commentUserId.username || comment.username || '匿名用户',
                    avatar: commentUserId.avatar || comment.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${commentUserId.username || 'default'}`
                  },
                  content: comment.content || '',
                  createTime: comment.createdAt ? new Date(comment.createdAt).toLocaleString() : new Date().toLocaleString()
                }
              }),
              createTime: post.createdAt ? new Date(post.createdAt).toLocaleString() : new Date().toLocaleString(),
              isLiked: post.isLiked || false, // 使用后端返回的点赞状态
              showComments: false,
              viewsCount: post.viewsCount || 0
            }
          })

          if (reset || page === 1) {
            this.posts = formattedPosts
          } else {
            this.posts.push(...formattedPosts)
          }

          this.pagination = pagination || {
            current: 1,
            total: 1,
            pageSize: 10,
            totalItems: formattedPosts.length
          }
          this.sortType = sort
        }
      } catch (error) {
        console.error('获取帖子列表失败:', error)
        // 如果API失败，使用模拟数据
        if (page === 1) {
          this.initializeMockData()
        }
      } finally {
        this.loading = false
      }
    },

    // 创建帖子
    async createPost(postData) {
      try {
        this.creating = true
        
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('请先登录')
        }

        const response = await axios.post('/api/v1/player-show', postData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.data.success) {
          // 重新获取帖子列表以显示新帖子
          await this.fetchPosts(1, this.sortType, true)
          return response.data.data
        }
      } catch (error) {
        console.error('创建帖子失败:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    // 点赞/取消点赞
    async toggleLike(postId) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('请先登录')
        }

        const response = await axios.post(`/api/v1/player-show/${postId}/like`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.data.success) {
          const { action, likesCount, isLiked } = response.data.data
          
          // 更新本地状态
          const post = this.posts.find(p => p.id === postId)
          if (post) {
            post.likes = likesCount
            post.isLiked = isLiked
          }

          return { action, likesCount, isLiked }
        }
      } catch (error) {
        console.error('点赞操作失败:', error)
        throw error
      }
    },

    // 添加评论
    async addComment(postId, content) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('请先登录')
        }

        const response = await axios.post(`/api/v1/player-show/${postId}/comments`, {
          content
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.data.success) {
          // 重新获取帖子以更新评论
          await this.fetchPosts(this.pagination.current, this.sortType, true)
          return response.data.data
        }
      } catch (error) {
        console.error('添加评论失败:', error)
        throw error
      }
    },

    // 删除帖子
    async deletePost(postId) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('请先登录')
        }

        const response = await axios.delete(`/api/v1/player-show/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.data.success) {
          // 从本地状态中移除帖子
          this.posts = this.posts.filter(post => post.id !== postId)
          return true
        }
      } catch (error) {
        console.error('删除帖子失败:', error)
        throw error
      }
    },

    // 切换评论显示状态
    toggleComments(postId) {
      const post = this.posts.find(p => p.id === postId)
      if (post) {
        post.showComments = !post.showComments
      }
    },

    // 初始化模拟数据（当API不可用时使用）
    initializeMockData() {
      const userStore = useUserStore()
      const userInfo = userStore.userInfo
      
      // 生成头像的辅助函数
      const generateAvatar = (text, color) => {
        const svgString = `
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="${color}"/>
            <text x="20" y="26" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">${text}</text>
          </svg>
        `
        // 使用encodeURIComponent来处理中文字符
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
      }
      
      this.posts = [
        {
          id: '1',
          user: {
            id: '1',
            nickname: '盲盒收集家',
            avatar: generateAvatar('收', '#667eea')
          },
          title: '今天的收获',
          content: '今天抽到了超稀有的路飞！太开心了！这个海贼王盲盒真的太值了！',
          images: [],
          blindBox: {
            id: 'one-piece-box',
            name: '海贼王盲盒',
            image: '/images/one-piece-box.jpg',
            price: 59
          },
          likes: 15,
          comments: [
            {
              id: 'c1',
              user: {
                id: '2',
                nickname: '海贼迷',
                avatar: generateAvatar('海', '#764ba2')
              },
              content: '太羡慕了！我也想要路飞！',
              createTime: new Date(Date.now() - 30 * 60 * 1000).toLocaleString()
            }
          ],
          createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
          isLiked: false,
          showComments: false,
          viewsCount: 45
        },
        {
          id: '2',
          user: {
            id: '2',
            nickname: '动漫爱好者',
            avatar: generateAvatar('动', '#f093fb')
          },
          title: '我的收藏',
          content: '分享一下我的火影忍者盲盒收藏，每一个都是心头好！',
          images: [],
          blindBox: {
            id: 'naruto-box',
            name: '火影忍者盲盒',
            image: '/images/naruto-box.jpg',
            price: 45
          },
          likes: 8,
          comments: [],
          createTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString(),
          isLiked: false,
          showComments: false,
          viewsCount: 23
        }
      ]
      
      this.pagination = {
        current: 1,
        total: 1,
        pageSize: 10,
        totalItems: 2
      }
    },

    // 重置状态
    resetState() {
      this.posts = []
      this.currentPost = null
      this.loading = false
      this.creating = false
      this.pagination = {
        current: 1,
        total: 0,
        pageSize: 10,
        totalItems: 0
      }
      this.sortType = 'latest'
    }
  }
})