<template>
  <div class="admin-container">
    <!-- 头部 -->
    <div class="admin-header">
      <h1>盲盒管理系统</h1>
      <button @click="logout" class="logout-button">退出登录</button>
    </div>

    <!-- 统计数据 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalProducts }}</div>
          <div class="stat-label">盲盒总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalSold }}</div>
          <div class="stat-label">已售数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-number">¥{{ totalRevenue }}</div>
          <div class="stat-label">总收入</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-number">{{ averagePrice }}</div>
          <div class="stat-label">平均价格</div>
        </div>
      </div>
    </div>

    <!-- 功能按钮 -->
    <div class="action-buttons">
      <button @click="showAddModal = true" class="action-btn add-btn">
        <span class="btn-icon">➕</span>
        添加盲盒
      </button>
      <button @click="currentView = 'delete'" class="action-btn delete-btn">
        <span class="btn-icon">🗑️</span>
        删除盲盒
      </button>
      <button @click="currentView = 'update'" class="action-btn update-btn">
        <span class="btn-icon">✏️</span>
        更新盲盒
      </button>
      <button @click="currentView = 'view'" class="action-btn view-btn">
        <span class="btn-icon">👁️</span>
        查看盲盒
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 删除功能 -->
      <div v-if="currentView === 'delete'" class="delete-section">
        <h3>删除盲盒</h3>
        <div class="product-list">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="product-item"
            :class="{ selected: selectedProducts.includes(product.id) }"
            @click="toggleProductSelection(product.id)"
          >
            <img :src="product.imageUrl" :alt="product.name" class="product-image">
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <p>价格: ¥{{ product.price }}</p>
              <p>已售: {{ product.soldCount }}</p>
            </div>
            <div class="selection-indicator">
              <span v-if="selectedProducts.includes(product.id)">✓</span>
            </div>
          </div>
        </div>
        <div v-if="selectedProducts.length > 0" class="delete-actions">
          <button @click="confirmDelete" class="confirm-delete-btn">
            删除选中的盲盒 ({{ selectedProducts.length }})
          </button>
        </div>
      </div>

      <!-- 更新功能 -->
      <div v-if="currentView === 'update'" class="update-section">
        <h3>更新盲盒</h3>
        <div class="product-list">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="product-item"
            @click="editProduct(product)"
          >
            <img :src="product.imageUrl" :alt="product.name" class="product-image">
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <p>价格: ¥{{ product.price }}</p>
              <p>已售: {{ product.soldCount }}</p>
            </div>
            <div class="edit-indicator">✏️</div>
          </div>
        </div>
      </div>

      <!-- 查看功能 -->
      <div v-if="currentView === 'view'" class="view-section">
        <h3>所有盲盒</h3>
        <div class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <img :src="product.imageUrl" :alt="product.name" class="product-image">
            <div class="product-details">
              <h4>{{ product.name }}</h4>
              <p><strong>分类:</strong> {{ product.category }}</p>
              <p><strong>价格:</strong> ¥{{ product.price }}</p>
              <p><strong>已售:</strong> {{ product.soldCount }}</p>
              <p><strong>描述:</strong> {{ product.description }}</p>
              <div class="product-items">
                <h5>内容物:</h5>
                <div v-for="item in product.items" :key="item.id" class="item-detail">
                  {{ item.name }} ({{ item.rarity }}) - {{ item.probability }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑盲盒弹窗 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? '编辑盲盒' : '添加盲盒' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label>盲盒名称</label>
              <input v-model="formData.name" type="text" required>
            </div>
            <div class="form-group">
              <label>分类</label>
              <select v-model="formData.category" required>
                <option value="">请选择分类</option>
                <option value="动漫">动漫</option>
                <option value="游戏">游戏</option>
                <option value="电影">电影</option>
                <option value="潮玩">潮玩</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>价格</label>
              <input v-model="formData.price" type="number" step="0.01" required>
            </div>
            <div class="form-group">
              <label>已售数量</label>
              <input v-model="formData.soldCount" type="number" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="formData.description" rows="3" required></textarea>
          </div>
          
          <div class="form-group">
            <label>盲盒图片</label>
            <div class="image-upload">
              <input 
                ref="fileInput" 
                type="file" 
                accept="image/*" 
                @change="handleImageUpload"
                style="display: none"
              >
              <button type="button" @click="$refs.fileInput.click()" class="upload-btn">
                选择图片
              </button>
              <div v-if="formData.imageUrl" class="image-preview">
                <img :src="formData.imageUrl" alt="预览图">
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>内容物设置</label>
            <div class="items-section">
              <div v-for="(item, index) in formData.items" :key="index" class="item-row">
                <input v-model="item.name" placeholder="物品名称" required>
                <select v-model="item.rarity" required>
                  <option value="">稀有度</option>
                  <option value="SSR">SSR</option>
                  <option value="SR">SR</option>
                  <option value="R">R</option>
                  <option value="N">N</option>
                </select>
                <input v-model.number="item.probability" type="number" placeholder="概率%" required>
                <button type="button" @click="removeItem(index)" class="remove-item-btn">×</button>
              </div>
              <button type="button" @click="addItem" class="add-item-btn">添加内容物</button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">取消</button>
            <button type="submit" class="save-btn">{{ showEditModal ? '更新' : '添加' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 数据状态
const currentView = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedProducts = ref([])
const editingProduct = ref(null)

// 表单数据
const formData = ref({
  name: '',
  category: '',
  price: '',
  soldCount: 0,
  description: '',
  imageUrl: '',
  items: [
    { name: '', rarity: '', probability: 0 }
  ]
})

// 盲盒数据（从Home.vue复制过来）
const products = ref([
  {
    id: 1,
    name: "海贼王盲盒",
    category: "动漫",
    price: "99.90",
    soldCount: 1234,
    imageUrl: "/src/static/onepiece.jpg",
    isNew: true,
    description: "收集路飞、索隆、娜美等经典角色",
    items: [
      { id: 1, name: "路飞", rarity: "SSR", probability: 5 },
      { id: 2, name: "索隆", rarity: "SR", probability: 15 },
      { id: 3, name: "娜美", rarity: "SR", probability: 15 },
      { id: 4, name: "乌索普", rarity: "R", probability: 25 },
      { id: 5, name: "山治", rarity: "R", probability: 25 },
      { id: 6, name: "乔巴", rarity: "N", probability: 15 }
    ]
  },
  {
    id: 2,
    name: "迪士尼公主盲盒",
    category: "动漫",
    price: "69.90",
    soldCount: 856,
    imageUrl: "/src/static/disney.jpg",
    isNew: false,
    description: "梦幻公主系列，收集你最爱的迪士尼公主",
    items: [
      { id: 1, name: "艾莎", rarity: "SSR", probability: 5 },
      { id: 2, name: "安娜", rarity: "SR", probability: 15 },
      { id: 3, name: "白雪公主", rarity: "SR", probability: 15 },
      { id: 4, name: "灰姑娘", rarity: "R", probability: 25 },
      { id: 5, name: "贝儿", rarity: "R", probability: 25 },
      { id: 6, name: "爱丽儿", rarity: "N", probability: 15 }
    ]
  },
  {
    id: 3,
    name: "漫威英雄盲盒",
    category: "动漫",
    price: "79.90",
    soldCount: 2341,
    imageUrl: "/src/static/marvel.jpg",
    isNew: false,
    description: "超级英雄集结，拯救世界的力量",
    items: [
      { id: 1, name: "钢铁侠", rarity: "SSR", probability: 5 },
      { id: 2, name: "美国队长", rarity: "SR", probability: 15 },
      { id: 3, name: "雷神", rarity: "SR", probability: 15 },
      { id: 4, name: "蜘蛛侠", rarity: "R", probability: 25 },
      { id: 5, name: "绿巨人", rarity: "R", probability: 25 },
      { id: 6, name: "黑寡妇", rarity: "N", probability: 15 }
    ]
  },
  {
    id: 4,
    name: "王者荣耀盲盒",
    category: "游戏",
    price: "89.90",
    soldCount: 567,
    imageUrl: "/src/static/wzry.png",
    isNew: true,
    description: "峡谷英雄齐聚，开启王者之路",
    items: [
      { id: 1, name: "李白", rarity: "SSR", probability: 5 },
      { id: 2, name: "貂蝉", rarity: "SR", probability: 15 },
      { id: 3, name: "韩信", rarity: "SR", probability: 15 },
      { id: 4, name: "亚瑟", rarity: "R", probability: 25 },
      { id: 5, name: "妲己", rarity: "R", probability: 25 },
      { id: 6, name: "鲁班七号", rarity: "N", probability: 15 }
    ]
  }
])

// 计算属性
const totalProducts = computed(() => products.value.length)
const totalSold = computed(() => products.value.reduce((sum, p) => sum + p.soldCount, 0))
const totalRevenue = computed(() => {
  return products.value.reduce((sum, p) => sum + (parseFloat(p.price) * p.soldCount), 0).toFixed(2)
})
const averagePrice = computed(() => {
  if (products.value.length === 0) return '0'
  const avg = products.value.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.value.length
  return `¥${avg.toFixed(2)}`
})

// 方法
const logout = () => {
  localStorage.removeItem('adminToken')
  router.push('/home')
}

const toggleProductSelection = (id) => {
  const index = selectedProducts.value.indexOf(id)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(id)
  }
}

const confirmDelete = () => {
  if (confirm(`确定要删除选中的 ${selectedProducts.value.length} 个盲盒吗？`)) {
    products.value = products.value.filter(p => !selectedProducts.value.includes(p.id))
    selectedProducts.value = []
    alert('删除成功！')
  }
}

const editProduct = (product) => {
  editingProduct.value = product
  formData.value = {
    name: product.name,
    category: product.category,
    price: product.price,
    soldCount: product.soldCount,
    description: product.description,
    imageUrl: product.imageUrl,
    items: [...product.items]
  }
  showEditModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingProduct.value = null
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    category: '',
    price: '',
    soldCount: 0,
    description: '',
    imageUrl: '',
    items: [
      { name: '', rarity: '', probability: 0 }
    ]
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const addItem = () => {
  formData.value.items.push({ name: '', rarity: '', probability: 0 })
}

const removeItem = (index) => {
  if (formData.value.items.length > 1) {
    formData.value.items.splice(index, 1)
  }
}

const saveProduct = () => {
  // 验证概率总和
  const totalProbability = formData.value.items.reduce((sum, item) => sum + item.probability, 0)
  if (totalProbability !== 100) {
    alert('所有内容物的概率总和必须等于100%')
    return
  }

  if (showEditModal.value) {
    // 更新产品
    const index = products.value.findIndex(p => p.id === editingProduct.value.id)
    if (index > -1) {
      products.value[index] = {
        ...editingProduct.value,
        ...formData.value,
        items: formData.value.items.map((item, idx) => ({ ...item, id: idx + 1 }))
      }
    }
    alert('更新成功！')
  } else {
    // 添加新产品
    const newProduct = {
      id: Math.max(...products.value.map(p => p.id)) + 1,
      ...formData.value,
      isNew: true,
      items: formData.value.items.map((item, idx) => ({ ...item, id: idx + 1 }))
    }
    products.value.push(newProduct)
    alert('添加成功！')
  }
  
  closeModal()
}

// 生命周期
onMounted(() => {
  // 检查管理员权限
  const adminToken = localStorage.getItem('adminToken')
  if (!adminToken) {
    router.push('/admin-auth')
  }
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.admin-header h1 {
  color: #333;
  font-size: 28px;
  margin: 0;
}

.logout-button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-button:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.action-btn {
  background: white;
  border: 2px solid #e1e5e9;
  padding: 20px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.add-btn:hover { border-color: #4caf50; color: #4caf50; }
.delete-btn:hover { border-color: #f44336; color: #f44336; }
.update-btn:hover { border-color: #ff9800; color: #ff9800; }
.view-btn:hover { border-color: #2196f3; color: #2196f3; }

.btn-icon {
  font-size: 20px;
}

.content-area {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.content-area h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.product-list {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.product-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.product-item.selected {
  border-color: #4caf50;
  background: #f1f8e9;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.product-info p {
  margin: 2px 0;
  color: #666;
  font-size: 14px;
}

.selection-indicator,
.edit-indicator {
  margin-left: auto;
  font-size: 20px;
  color: #4caf50;
}

.delete-actions {
  text-align: center;
}

.confirm-delete-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.confirm-delete-btn:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  padding: 20px;
  background: #fafafa;
}

.product-card .product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-details h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.product-details p {
  margin: 5px 0;
  color: #666;
}

.product-items {
  margin-top: 15px;
}

.product-items h5 {
  margin: 0 0 10px 0;
  color: #333;
}

.item-detail {
  background: white;
  padding: 5px 10px;
  margin: 5px 0;
  border-radius: 5px;
  font-size: 12px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e5e9;
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
  color: #666;
}

.product-form {
  padding: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  align-self: flex-start;
}

.image-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.items-section {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 15px;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.remove-item-btn {
  background: #f44336;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
}

.add-item-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.cancel-btn {
  background: #666;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
}

.save-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .admin-container {
    padding: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .item-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>