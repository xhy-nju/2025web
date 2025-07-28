<template>
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
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const searchKeyword = ref('')
const emit = defineEmits(['search'])

const handleSearch = () => {
  emit('search', searchKeyword.value)
}
</script>

<style scoped>
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
</style>