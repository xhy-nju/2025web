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
                <div class="item-basic-info">
                  <input v-model="item.name" placeholder="物品名称" required>
                  <select v-model="item.rarity" required>
                    <option value="">稀有度</option>
                    <option value="SSR">SSR</option>
                    <option value="SR">SR</option>
                    <option value="R">R</option>
                    <option value="N">N</option>
                  </select>
                  <input v-model.number="item.probability" type="number" placeholder="概率%" required>
                </div>
                <div class="item-image-upload">
                  <input 
                    :ref="`itemFileInput${index}`" 
                    type="file" 
                    accept="image/*" 
                    @change="(e) => handleFormItemImageUpload(e, index)"
                    style="display: none"
                  >
                  <button type="button" @click="$refs[`itemFileInput${index}`][0].click()" class="upload-btn small">
                    选择图片
                  </button>
                  <div v-if="item.imageUrl" class="item-image-preview">
                    <img :src="item.imageUrl" alt="内容物预览图">
                  </div>
                </div>
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
import axios from 'axios'

const router = useRouter()

// 数据状态
const currentView = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedProducts = ref([])
const editingProduct = ref(null)
const products = ref([])
const loading = ref(false)

// 表单数据
const formData = ref({
  name: '',
  category: '',
  price: '',
  soldCount: 0,
  description: '',
  imageUrl: '',
  items: [
    { name: '', rarity: '', probability: 0, imageUrl: '' }
  ]
})

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

// 获取盲盒数据
const fetchBlindBoxes = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('adminToken')
    const response = await axios.get('/api/v1/blind-boxes/admin/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.data.success) {
      products.value = response.data.data.blindBoxes
    } else {
      console.error('获取盲盒数据失败:', response.data.message)
    }
  } catch (error) {
    console.error('获取盲盒数据失败:', error)
  } finally {
    loading.value = false
  }
}

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

const confirmDelete = async () => {
  if (confirm(`确定要删除选中的 ${selectedProducts.value.length} 个盲盒吗？`)) {
    try {
      const token = localStorage.getItem('adminToken')
      
      for (const id of selectedProducts.value) {
        await axios.delete(`/api/v1/blind-boxes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
      
      selectedProducts.value = []
      alert('删除成功！')
      await fetchBlindBoxes() // 重新获取数据
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
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
    category: '动漫',
    price: '',
    soldCount: 0,
    description: '',
    imageUrl: '',
    items: [
      { name: '', rarity: 'N', probability: 0, imageUrl: '' }
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

// 处理表单中内容物图片上传
const handleFormItemImageUpload = (event, index) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.items[index].imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 处理产品列表中内容物图片上传
const handleItemImageUpload = async (event, productIndex, itemIndex) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const imageUrl = e.target.result
        const product = products.value[productIndex]
        const token = localStorage.getItem('adminToken')
        
        // 更新产品数据
        const updatedProduct = { ...product }
        updatedProduct.items[itemIndex].imageUrl = imageUrl
        
        await axios.put(`/api/v1/blind-boxes/${product._id}`, updatedProduct, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // 更新本地数据
        products.value[productIndex].items[itemIndex].imageUrl = imageUrl
      } catch (error) {
        console.error('更新图片失败:', error)
        alert('更新图片失败，请重试')
      }
    }
    reader.readAsDataURL(file)
  }
}

const addItem = () => {
  formData.value.items.push({ name: '', rarity: 'N', probability: 0, imageUrl: '' })
}

const removeItem = (index) => {
  if (formData.value.items.length > 1) {
    formData.value.items.splice(index, 1)
  }
}

const saveProduct = async () => {
  // 验证表单数据
  if (!formData.value.name.trim()) {
    alert('请输入盲盒名称')
    return
  }
  
  if (!formData.value.category) {
    alert('请选择分类')
    return
  }
  
  if (!formData.value.price || parseFloat(formData.value.price) <= 0) {
    alert('请输入有效的价格')
    return
  }
  
  if (!formData.value.description.trim()) {
    alert('请输入描述')
    return
  }
  
  // 验证内容物
  for (let i = 0; i < formData.value.items.length; i++) {
    const item = formData.value.items[i]
    if (!item.name.trim()) {
      alert(`请输入第${i + 1}个内容物的名称`)
      return
    }
    if (!item.rarity) {
      alert(`请选择第${i + 1}个内容物的稀有度`)
      return
    }
    if (!item.probability || item.probability <= 0) {
      alert(`请输入第${i + 1}个内容物的有效概率`)
      return
    }
  }
  
  // 验证概率总和
  const totalProbability = formData.value.items.reduce((sum, item) => sum + parseFloat(item.probability), 0)
  if (Math.abs(totalProbability - 100) > 0.01) {
    alert(`所有内容物的概率总和必须等于100%，当前为${totalProbability}%`)
    return
  }

  try {
    const token = localStorage.getItem('adminToken')
    
    // 格式化数据
    const submitData = {
      name: formData.value.name.trim(),
      category: formData.value.category,
      price: parseFloat(formData.value.price),
      description: formData.value.description.trim(),
      imageUrl: formData.value.imageUrl || '',
      items: formData.value.items.map(item => ({
        name: item.name.trim(),
        rarity: item.rarity,
        probability: parseFloat(item.probability),
        imageUrl: item.imageUrl || ''
      }))
    }
    
    // 如果是编辑模式，保留soldCount
    if (showEditModal.value) {
      submitData.soldCount = formData.value.soldCount || 0
    }
    
    console.log('提交的数据:', submitData) // 调试用
    
    if (showEditModal.value) {
      // 更新产品
      await axios.put(`/api/v1/blind-boxes/${editingProduct.value._id}`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      alert('更新成功！')
    } else {
      // 添加新产品
      await axios.post('/api/v1/blind-boxes', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      alert('添加成功！')
    }
    
    closeModal()
    await fetchBlindBoxes() // 重新获取数据
  } catch (error) {
    console.error('保存失败:', error)
    if (error.response && error.response.data) {
      alert(`保存失败: ${error.response.data.message || '未知错误'}`)
    } else {
      alert('保存失败，请重试')
    }
  }
}

// 生命周期
onMounted(async () => {
  // 检查管理员权限
  const adminToken = localStorage.getItem('adminToken')
  if (!adminToken) {
    router.push('/admin-auth')
    return
  }
  
  // 获取盲盒数据
  await fetchBlindBoxes()
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  position: relative;
}

.item-basic-info {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
  align-items: center;
}

.item-image-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.upload-btn.small {
  background: #667eea;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.item-image-preview {
  display: flex;
  align-items: center;
}

.item-image-preview img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
}

.remove-item-btn {
  background: #f44336;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  position: absolute;
  top: 8px;
  right: 8px;
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