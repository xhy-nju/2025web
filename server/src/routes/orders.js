const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const BlindBox = require('../models/BlindBox');
const { auth } = require('../middleware/auth');

// 创建订单
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, remark } = req.body;
    
    // 验证盲盒是否存在并计算总金额
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const blindBox = await BlindBox.findById(item.blindBoxId);
      if (!blindBox || !blindBox.isActive) {
        return res.status(400).json({
          success: false,
          message: `盲盒 ${item.blindBoxId} 不存在或已下架`
        });
      }
      
      const orderItem = {
        blindBoxId: blindBox._id,
        blindBoxName: blindBox.name,
        price: blindBox.price,
        quantity: item.quantity || 1,
        drawnItems: []
      };
      
      totalAmount += blindBox.price * orderItem.quantity;
      orderItems.push(orderItem);
    }

    // 检查用户金币是否足够
    if (req.user.coins < totalAmount) {
      return res.status(400).json({
        success: false,
        message: '金币不足'
      });
    }

    // 创建订单
    const order = new Order({
      orderNumber: Order.generateOrderNumber(),
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress,
      remark
    });

    // 执行抽奖并扣除金币
    for (const orderItem of order.items) {
      const blindBox = await BlindBox.findById(orderItem.blindBoxId);
      
      for (let i = 0; i < orderItem.quantity; i++) {
        const drawnItem = blindBox.drawItem();
        orderItem.drawnItems.push({
          name: drawnItem.name,
          rarity: drawnItem.rarity,
          imageUrl: drawnItem.imageUrl
        });
        
        // 添加到用户库存
        req.user.inventory.push({
          blindBoxId: blindBox._id,
          itemName: drawnItem.name,
          itemRarity: drawnItem.rarity,
          itemImageUrl: drawnItem.imageUrl,
          quantity: 1
        });
      }
      
      // 增加销售数量
      blindBox.soldCount += orderItem.quantity;
      await blindBox.save();
    }

    // 扣除用户金币并更新统计
    req.user.coins -= totalAmount;
    req.user.totalDraws += orderItems.reduce((sum, item) => sum + item.quantity, 0);
    req.user.totalSpent += totalAmount;
    req.user.stats.totalOrders += 1;

    // 更新订单状态为已支付
    await order.updateStatus('pending_receipt');

    // 保存更改
    await Promise.all([
      order.save(),
      req.user.save()
    ]);

    res.status(201).json({
      success: true,
      data: order,
      message: '订单创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建订单失败',
      error: error.message
    });
  }
});

// 获取用户订单列表
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.blindBoxId', 'name imageUrl');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
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
      message: '获取订单列表失败',
      error: error.message
    });
  }
});

// 获取订单详情
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('items.blindBoxId', 'name imageUrl description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取订单详情失败',
      error: error.message
    });
  }
});

// 确认收货
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.status !== 'pending_receipt') {
      return res.status(400).json({
        success: false,
        message: '订单状态不允许确认收货'
      });
    }

    await order.updateStatus('completed');

    res.json({
      success: true,
      data: order,
      message: '确认收货成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '确认收货失败',
      error: error.message
    });
  }
});

// 取消订单
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: '只能取消待支付的订单'
      });
    }

    await order.updateStatus('cancelled');

    res.json({
      success: true,
      data: order,
      message: '订单取消成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取消订单失败',
      error: error.message
    });
  }
});

// 获取订单统计
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Order.getUserOrderStats(req.user._id);
    
    // 转换为前端需要的格式
    const formattedStats = {
      pending_payment: 0,
      pending_shipment: 0,
      pending_receipt: 0,
      completed: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取订单统计失败',
      error: error.message
    });
  }
});

module.exports = router;