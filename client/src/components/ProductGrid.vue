<template>
  <div class="products-area">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="products.length === 0" class="empty-result">
      暂无相关数据
    </div>
    <div v-else class="product-grid">
      <div 
        v-for="item in products" 
        :key="item.id"
        class="product-item"
        @click="handleProductClick(item.id)"
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
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['product-click'])

const handleProductClick = (productId) => {
  emit('product-click', productId)
}
</script>

<style scoped>
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