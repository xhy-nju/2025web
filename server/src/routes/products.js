const express = require('express');
const router = express.Router();

// 模拟产品数据
const mockProducts = [
  {
    id: 1,
    name: "海贼王盲盒",
    category: "动漫",
    price: "99.90",
    soldCount: 1234,
    imageUrl: "/src/static/onepiece.jpg",
    isNew: true,
    description: "海贼王主题盲盒，包含路飞、索隆等经典角色手办"
  },
  {
    id: 2,
    name: "迪士尼公主盲盒",
    category: "动画",
    price: "69.90",
    soldCount: 856,
    imageUrl: "/src/static/disney.jpg",
    isNew: false,
    description: "迪士尼公主系列盲盒，包含白雪公主、灰姑娘等经典角色"
  },
  {
    id: 3,
    name: "漫威英雄盲盒",
    category: "电影",
    price: "79.90",
    soldCount: 2341,
    imageUrl: "/src/static/marvel.jpg",
    isNew: false,
    description: "漫威超级英雄盲盒，包含钢铁侠、美国队长等热门角色"
  },
  {
    id: 4,
    name: "王者荣耀盲盒",
    category: "游戏",
    price: "89.90",
    soldCount: 567,
    imageUrl: "/src/static/wzry.png",
    isNew: true,
    description: "王者荣耀游戏角色盲盒，包含李白、貂蝉等热门英雄"
  }
];

// 获取所有产品
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      products: mockProducts,
      total: mockProducts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取产品列表失败',
      error: error.message
    });
  }
});

// 搜索产品
router.post('/search', (req, res) => {
  try {
    const { keyword, category } = req.body;
    
    let filteredProducts = mockProducts;
    
    // 根据关键词搜索
    if (keyword && keyword.trim()) {
      const searchTerm = keyword.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // 根据分类过滤
    if (category === "新品") {
      // 新品分类：显示所有 isNew 为 true 的产品
      filteredProducts = filteredProducts.filter(product => product.isNew === true);
    } else if (category && category !== "热门") {
      // 其他分类：按 category 字段过滤
      filteredProducts = filteredProducts.filter(product => 
        product.category === category
      );
    }
    
    res.json({
      success: true,
      products: filteredProducts,
      total: filteredProducts.length,
      keyword: keyword,
      category: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '搜索产品失败',
      error: error.message
    });
  }
});

// 按分类获取产品
router.post('/category', (req, res) => {
  try {
    const { category } = req.body;
    
    let filteredProducts = mockProducts;
    
    // 根据分类过滤
    if (category === "新品") {
      // 新品分类：显示所有 isNew 为 true 的产品
      filteredProducts = filteredProducts.filter(product => product.isNew === true);
    } else if (category && category !== "热门") {
      // 其他分类：按 category 字段过滤
      filteredProducts = filteredProducts.filter(product => 
        product.category === category
      );
    }
    
    // 如果是热门分类，可以按销量排序
    if (!category || category === "热门") {
      filteredProducts = [...mockProducts].sort((a, b) => b.soldCount - a.soldCount);
    }
    
    res.json({
      success: true,
      products: filteredProducts,
      total: filteredProducts.length,
      category: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类产品失败',
      error: error.message
    });
  }
});

// 获取产品详情
router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = mockProducts.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    res.json({
      success: true,
      product: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取产品详情失败',
      error: error.message
    });
  }
});

module.exports = router;