const mongoose = require('mongoose');

// 订单状态枚举
const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PENDING_SHIPMENT: 'pending_shipment',
  PENDING_RECEIPT: 'pending_receipt',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// 订单项模式
const orderItemSchema = new mongoose.Schema({
  blindBoxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlindBox',
    required: [true, '盲盒ID是必需的']
  },
  blindBoxName: {
    type: String,
    required: [true, '盲盒名称是必需的']
  },
  price: {
    type: Number,
    required: [true, '价格是必需的'],
    min: [0, '价格不能小于0']
  },
  quantity: {
    type: Number,
    required: [true, '数量是必需的'],
    min: [1, '数量不能小于1'],
    default: 1
  },
  // 抽中的物品
  drawnItems: [{
    name: String,
    rarity: String,
    imageUrl: String,
    drawnAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// 订单模式
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, '订单号是必需的'],
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必需的'],
    index: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: [true, '总金额是必需的'],
    min: [0, '总金额不能小于0']
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING_PAYMENT,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['alipay', 'wechat', 'credit_card', 'balance'],
    default: 'alipay'
  },
  shippingAddress: {
    province: String,
    city: String,
    district: String,
    street: String,
    zipCode: String,
    receiverName: String,
    receiverPhone: String
  },
  // 时间记录
  paymentTime: Date,
  shipmentTime: Date,
  receiptTime: Date,
  cancelTime: Date,
  
  // 备注
  remark: {
    type: String,
    maxlength: [500, '备注不能超过500个字符']
  }
}, {
  timestamps: true
});

// 添加索引
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// 生成订单号的静态方法
orderSchema.statics.generateOrderNumber = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `ORD${year}${month}${day}${timestamp}${random}`;
};

// 实例方法：更新订单状态
orderSchema.methods.updateStatus = function(newStatus) {
  const now = new Date();
  
  switch (newStatus) {
    case ORDER_STATUS.PENDING_SHIPMENT:
      this.paymentTime = now;
      break;
    case ORDER_STATUS.PENDING_RECEIPT:
      this.shipmentTime = now;
      break;
    case ORDER_STATUS.COMPLETED:
      this.receiptTime = now;
      break;
    case ORDER_STATUS.CANCELLED:
      this.cancelTime = now;
      break;
  }
  
  this.status = newStatus;
  return this.save();
};

// 实例方法：计算总金额
orderSchema.methods.calculateTotal = function() {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  return this.totalAmount;
};

// 静态方法：根据用户和状态查询订单
orderSchema.statics.findByUserAndStatus = function(userId, status) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 }).populate('items.blindBoxId');
};

// 静态方法：获取用户订单统计
orderSchema.statics.getUserOrderStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUS = ORDER_STATUS;