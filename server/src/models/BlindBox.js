const mongoose = require('mongoose');

// 盲盒内容物模式
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '物品名称是必需的'],
    trim: true
  },
  rarity: {
    type: String,
    required: [true, '稀有度是必需的'],
    enum: ['普通', '稀有', '史诗', '传说'],
    default: '普通'
  },
  probability: {
    type: Number,
    required: [true, '概率是必需的'],
    min: [0, '概率不能小于0'],
    max: [100, '概率不能大于100']
  },
  imageUrl: {
    type: String,
    default: ''
  }
});

// 盲盒产品模式
const blindBoxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '盲盒名称是必需的'],
    trim: true,
    maxlength: [100, '盲盒名称不能超过100个字符']
  },
  category: {
    type: String,
    required: [true, '分类是必需的'],
    enum: ['动漫', '游戏', '潮玩', '电影', '音乐'],
    default: '动漫'
  },
  price: {
    type: Number,
    required: [true, '价格是必需的'],
    min: [0, '价格不能小于0']
  },
  soldCount: {
    type: Number,
    default: 0,
    min: [0, '销售数量不能小于0']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isNew: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: [true, '描述是必需的'],
    trim: true,
    maxlength: [500, '描述不能超过500个字符']
  },
  items: [itemSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 添加索引
blindBoxSchema.index({ category: 1 });
blindBoxSchema.index({ isNew: 1 });
blindBoxSchema.index({ isActive: 1 });
blindBoxSchema.index({ name: 'text', description: 'text' });

// 实例方法：验证概率总和
blindBoxSchema.methods.validateProbabilities = function() {
  const totalProbability = this.items.reduce((sum, item) => sum + item.probability, 0);
  return Math.abs(totalProbability - 100) < 0.01; // 允许小数点误差
};

// 实例方法：随机抽取物品
blindBoxSchema.methods.drawItem = function() {
  if (!this.validateProbabilities()) {
    throw new Error('概率设置错误，总和必须为100%');
  }
  
  const random = Math.random() * 100;
  let currentProbability = 0;
  
  for (const item of this.items) {
    currentProbability += item.probability;
    if (random <= currentProbability) {
      return item;
    }
  }
  
  // 如果没有抽中任何物品，返回最后一个
  return this.items[this.items.length - 1];
};

// 静态方法：根据分类获取盲盒
blindBoxSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// 静态方法：搜索盲盒
blindBoxSchema.statics.searchBlindBoxes = function(keyword) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      }
    ]
  });
};

module.exports = mongoose.model('BlindBox', blindBoxSchema);