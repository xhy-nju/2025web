<template>
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
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  currentCategory: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['category-change'])

const handleCategoryChange = (category) => {
  emit('category-change', category)
}
</script>

<style scoped>
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
</style>