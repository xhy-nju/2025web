const express = require('express');
const router = express.Router();
const BlindBox = require('../models/BlindBox');
const { auth, adminAuth } = require('../middleware/auth');

// 获取所有盲盒（分页）
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (category && category !== '全部') {
      query.category = category;
    }

    const blindBoxes = await BlindBox.find(query)
      .sort({ isNew: -1, soldCount: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlindBox.countDocuments(query);

    res.json({
      success: true,
      data: {
        blindBoxes,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          pageSize: limit,
          totalItems: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取盲盒列表失败',
      error: error.message
    });
  }
});

// 根据ID获取盲盒详情
router.get('/:id', async (req, res) => {
  try {
    const blindBox = await BlindBox.findById(req.params.id);
    
    if (!blindBox || !blindBox.isActive) {
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      });
    }

    res.json({
      success: true,
      data: blindBox
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取盲盒详情失败',
      error: error.message
    });
  }
});

// 搜索盲盒
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blindBoxes = await BlindBox.searchBlindBoxes(keyword)
      .skip(skip)
      .limit(limit);

    const total = await BlindBox.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
          ]
        }
      ]
    }).countDocuments();

    res.json({
      success: true,
      data: {
        blindBoxes,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          pageSize: limit,
          totalItems: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '搜索失败',
      error: error.message
    });
  }
});

// 根据分类获取盲盒
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blindBoxes = await BlindBox.findByCategory(category)
      .skip(skip)
      .limit(limit);

    const total = await BlindBox.countDocuments({ category, isActive: true });

    res.json({
      success: true,
      data: {
        blindBoxes,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          pageSize: limit,
          totalItems: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类盲盒失败',
      error: error.message
    });
  }
});

// 抽奖接口
router.post('/:id/draw', auth, async (req, res) => {
  try {
    const blindBox = await BlindBox.findById(req.params.id);
    
    if (!blindBox || !blindBox.isActive) {
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      });
    }

    // 检查用户金币是否足够
    if (req.user.coins < blindBox.price) {
      return res.status(400).json({
        success: false,
        message: '金币不足'
      });
    }

    // 抽奖
    const drawnItem = blindBox.drawItem();
    
    // 扣除金币
    req.user.coins -= blindBox.price;
    req.user.totalDraws += 1;
    req.user.totalSpent += blindBox.price;
    
    // 添加到用户库存
    req.user.inventory.push({
      blindBoxId: blindBox._id,
      itemName: drawnItem.name,
      itemRarity: drawnItem.rarity,
      itemImageUrl: drawnItem.imageUrl,
      quantity: 1
    });

    // 增加盲盒销售数量
    blindBox.soldCount += 1;

    // 保存更改
    await Promise.all([
      req.user.save(),
      blindBox.save()
    ]);

    res.json({
      success: true,
      data: {
        drawnItem,
        remainingCoins: req.user.coins,
        totalDraws: req.user.totalDraws
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '抽奖失败',
      error: error.message
    });
  }
});

// ===== 管理员接口 =====

// 创建盲盒（管理员）
router.post('/', adminAuth, async (req, res) => {
  try {
    const blindBox = new BlindBox(req.body);
    
    // 验证概率总和
    if (!blindBox.validateProbabilities()) {
      return res.status(400).json({
        success: false,
        message: '物品概率总和必须为100%'
      });
    }

    await blindBox.save();

    res.status(201).json({
      success: true,
      data: blindBox,
      message: '盲盒创建成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '创建盲盒失败',
      error: error.message
    });
  }
});

// 更新盲盒（管理员）
router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log('更新盲盒请求 - ID:', req.params.id);
    console.log('更新盲盒请求 - 数据:', JSON.stringify(req.body, null, 2));
    
    const blindBox = await BlindBox.findById(req.params.id);
    
    if (!blindBox) {
      console.log('盲盒不存在:', req.params.id);
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      });
    }

    console.log('原始盲盒数据:', JSON.stringify(blindBox.toObject(), null, 2));

    Object.assign(blindBox, req.body);
    
    console.log('合并后的盲盒数据:', JSON.stringify(blindBox.toObject(), null, 2));
    
    // 验证概率总和
    if (!blindBox.validateProbabilities()) {
      const totalProbability = blindBox.items.reduce((sum, item) => sum + item.probability, 0);
      console.log('概率验证失败 - 总概率:', totalProbability);
      return res.status(400).json({
        success: false,
        message: `物品概率总和必须为100%，当前为${totalProbability}%`
      });
    }

    await blindBox.save();

    res.json({
      success: true,
      data: blindBox,
      message: '盲盒更新成功'
    });
  } catch (error) {
    console.error('更新盲盒失败:', error);
    console.error('错误详情:', error.message);
    if (error.name === 'ValidationError') {
      console.error('验证错误详情:', error.errors);
    }
    res.status(400).json({
      success: false,
      message: '更新盲盒失败',
      error: error.message,
      details: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
});

// 删除盲盒（管理员）
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const blindBox = await BlindBox.findById(req.params.id);
    
    if (!blindBox) {
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      });
    }

    // 软删除：设置为不活跃
    blindBox.isActive = false;
    await blindBox.save();

    res.json({
      success: true,
      message: '盲盒删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除盲盒失败',
      error: error.message
    });
  }
});

// 获取所有盲盒（包括不活跃的，管理员）
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blindBoxes = await BlindBox.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlindBox.countDocuments({});

    res.json({
      success: true,
      data: {
        blindBoxes,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          pageSize: limit,
          totalItems: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取盲盒列表失败',
      error: error.message
    });
  }
});

module.exports = router;