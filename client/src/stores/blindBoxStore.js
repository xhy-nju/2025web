import { reactive } from 'vue'

// 创建响应式的盲盒数据存储
const blindBoxData = reactive({
  products: [
    {
      id: 1,
      name: "海贼王盲盒",
      category: "动漫",
      price: "59.90",
      soldCount: 1234,
      imageUrl: "/src/static/onepiece.jpg",
      isNew: true,
      description: "草帽海贼团集结，开启伟大航路的冒险",
      items: [
        { id: 1, name: "路飞", rarity: "SSR", probability: 5, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%23FF6B6B'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E路飞%3C/text%3E%3C/svg%3E" },
        { id: 2, name: "索隆", rarity: "SR", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%234FBAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E索隆%3C/text%3E%3C/svg%3E" },
        { id: 3, name: "娜美", rarity: "SR", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%234FBAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E娜美%3C/text%3E%3C/svg%3E" },
        { id: 4, name: "乌索普", rarity: "R", probability: 25, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2367EAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='10' fill='white' text-anchor='middle'%3E乌索普%3C/text%3E%3C/svg%3E" },
        { id: 5, name: "山治", rarity: "R", probability: 25, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2367EAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E山治%3C/text%3E%3C/svg%3E" },
        { id: 6, name: "乔巴", rarity: "N", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2395A5A6'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E乔巴%3C/text%3E%3C/svg%3E" }
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
        { id: 1, name: "艾莎", rarity: "SSR", probability: 5, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%23FF6B6B'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E艾莎%3C/text%3E%3C/svg%3E" },
        { id: 2, name: "安娜", rarity: "SR", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%234FBAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E安娜%3C/text%3E%3C/svg%3E" },
        { id: 3, name: "白雪公主", rarity: "SR", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%234FBAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='8' fill='white' text-anchor='middle'%3E白雪公主%3C/text%3E%3C/svg%3E" },
        { id: 4, name: "灰姑娘", rarity: "R", probability: 25, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2367EAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='10' fill='white' text-anchor='middle'%3E灰姑娘%3C/text%3E%3C/svg%3E" },
        { id: 5, name: "贝儿", rarity: "R", probability: 25, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2367EAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E贝儿%3C/text%3E%3C/svg%3E" },
        { id: 6, name: "爱丽儿", rarity: "N", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2395A5A6'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='10' fill='white' text-anchor='middle'%3E爱丽儿%3C/text%3E%3C/svg%3E" }
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
        { id: 1, name: "钢铁侠", rarity: "SSR", probability: 5, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%23FF6B6B'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='10' fill='white' text-anchor='middle'%3E钢铁侠%3C/text%3E%3C/svg%3E" },
        { id: 2, name: "美国队长", rarity: "SR", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%234FBAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='8' fill='white' text-anchor='middle'%3E美国队长%3C/text%3E%3C/svg%3E" },
        { id: 3, name: "雷神", rarity: "SR", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%234FBAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E雷神%3C/text%3E%3C/svg%3E" },
        { id: 4, name: "蜘蛛侠", rarity: "R", probability: 25, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2367EAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='10' fill='white' text-anchor='middle'%3E蜘蛛侠%3C/text%3E%3C/svg%3E" },
        { id: 5, name: "绿巨人", rarity: "R", probability: 25, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2367EAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='10' fill='white' text-anchor='middle'%3E绿巨人%3C/text%3E%3C/svg%3E" },
        { id: 6, name: "黑寡妇", rarity: "N", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2395A5A6'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='10' fill='white' text-anchor='middle'%3E黑寡妇%3C/text%3E%3C/svg%3E" }
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
        { id: 1, name: "李白", rarity: "SSR", probability: 5, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%23FF6B6B'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E李白%3C/text%3E%3C/svg%3E" },
        { id: 2, name: "貂蝉", rarity: "SR", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%234FBAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E貂蝉%3C/text%3E%3C/svg%3E" },
        { id: 3, name: "韩信", rarity: "SR", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%234FBAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E韩信%3C/text%3E%3C/svg%3E" },
        { id: 4, name: "亚瑟", rarity: "R", probability: 25, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2367EAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E亚瑟%3C/text%3E%3C/svg%3E" },
        { id: 5, name: "妲己", rarity: "R", probability: 25, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2367EAF5'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E妲己%3C/text%3E%3C/svg%3E" },
        { id: 6, name: "鲁班七号", rarity: "N", probability: 15, imageUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%2395A5A6'/%3E%3Ctext x='20' y='24' font-family='Arial' font-size='8' fill='white' text-anchor='middle'%3E鲁班七号%3C/text%3E%3C/svg%3E" }
      ]
    }
  ]
})

// 数据操作方法
export const blindBoxStore = {
  // 获取所有产品
  getProducts() {
    return blindBoxData.products
  },

  // 根据ID获取产品
  getProductById(id) {
    return blindBoxData.products.find(product => product.id === parseInt(id))
  },

  // 更新产品
  updateProduct(updatedProduct) {
    const index = blindBoxData.products.findIndex(product => product.id === updatedProduct.id)
    if (index !== -1) {
      blindBoxData.products[index] = { ...blindBoxData.products[index], ...updatedProduct }
      return true
    }
    return false
  },

  // 添加产品
  addProduct(newProduct) {
    const maxId = Math.max(...blindBoxData.products.map(p => p.id), 0)
    newProduct.id = maxId + 1
    blindBoxData.products.push(newProduct)
    return newProduct
  },

  // 删除产品
  deleteProduct(id) {
    const index = blindBoxData.products.findIndex(product => product.id === parseInt(id))
    if (index !== -1) {
      blindBoxData.products.splice(index, 1)
      return true
    }
    return false
  },

  // 更新产品内容物图片
  updateItemImage(productId, itemId, imageUrl) {
    const product = this.getProductById(productId)
    if (product) {
      const item = product.items.find(item => item.id === parseInt(itemId))
      if (item) {
        item.imageUrl = imageUrl
        return true
      }
    }
    return false
  },

  // 获取响应式数据（用于组件中的响应式更新）
  getReactiveProducts() {
    return blindBoxData.products
  }
}

export default blindBoxStore