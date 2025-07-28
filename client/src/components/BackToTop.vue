<template>
  <div class="back-to-top" v-show="show" @click="scrollToTop">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"/>
    </svg>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['scroll-to-top'])

const scrollToTop = () => {
  emit('scroll-to-top')
}
</script>

<style scoped>
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
</style>