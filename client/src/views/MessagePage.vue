<template>
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
</template>

<script setup>
import { ref, nextTick } from 'vue'

const currentChat = ref(null)
const newMessage = ref('')
const showNewMessageModal = ref(false)
const chatMessages = ref(null)

// 模拟消息列表数据
const messageList = ref([
  {
    id: 1,
    name: "小明",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming",
    lastMessage: "你好，请问这个盲盒还有货吗？",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    messages: [
      { id: 1, text: "你好！", isOwn: false, time: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 2, text: "你好，有什么可以帮助您的吗？", isOwn: true, time: new Date(Date.now() - 1000 * 60 * 25) },
      { id: 3, text: "请问这个盲盒还有货吗？", isOwn: false, time: new Date(Date.now() - 1000 * 60 * 5) }
    ]
  },
  {
    id: 2,
    name: "客服小助手",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=helper",
    lastMessage: "感谢您的咨询，我们会尽快回复！",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    messages: [
      { id: 1, text: "您好，欢迎来到盲盒商城！", isOwn: false, time: new Date(Date.now() - 1000 * 60 * 60 * 3) },
      { id: 2, text: "有什么问题可以随时联系我们", isOwn: false, time: new Date(Date.now() - 1000 * 60 * 60 * 2) }
    ]
  }
])

const openChat = (chat) => {
  currentChat.value = chat
  // 标记为已读
  chat.unreadCount = 0
  nextTick(() => {
    scrollToBottom()
  })
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  const message = {
    id: Date.now(),
    text: newMessage.value,
    isOwn: true,
    time: new Date()
  }
  
  currentChat.value.messages.push(message)
  currentChat.value.lastMessage = newMessage.value
  currentChat.value.lastMessageTime = new Date()
  
  newMessage.value = ''
  
  nextTick(() => {
    scrollToBottom()
  })
  
  // 模拟对方回复
  setTimeout(() => {
    const reply = {
      id: Date.now() + 1,
      text: getAutoReply(message.text),
      isOwn: false,
      time: new Date()
    }
    currentChat.value.messages.push(reply)
    currentChat.value.lastMessage = reply.text
    currentChat.value.lastMessageTime = new Date()
    
    nextTick(() => {
      scrollToBottom()
    })
  }, 1000 + Math.random() * 2000)
}

const getAutoReply = (userMessage) => {
  const replies = [
    "好的，我明白了。",
    "感谢您的反馈！",
    "我会为您查询相关信息。",
    "请稍等，我来为您处理。",
    "您说得对，我会注意的。",
    "谢谢您的建议！"
  ]
  
  if (userMessage.includes("盲盒")) {
    return "关于盲盒的问题，我很乐意为您解答！"
  } else if (userMessage.includes("退货") || userMessage.includes("退换")) {
    return "关于退换货，我会为您详细说明流程。"
  } else if (userMessage.includes("发货") || userMessage.includes("物流")) {
    return "我会为您查询物流信息，请稍等。"
  }
  
  return replies[Math.floor(Math.random() * replies.length)]
}

const scrollToBottom = () => {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

const formatTime = (time) => {
  const now = new Date()
  const diff = now - time
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return "刚刚"
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return time.toLocaleDateString()
  }
}
</script>

<style scoped>
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