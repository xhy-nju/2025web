const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必需的'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少3个字符'],
    maxlength: [20, '用户名最多20个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱是必需的'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '密码是必需的'],
    minlength: [6, '密码至少6个字符'],
    select: false // 默认查询时不返回密码
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // 个人信息
  nickname: {
    type: String,
    default: function() {
      return this.username;
    },
    trim: true,
    maxlength: [30, '昵称最多30个字符']
  },
  phone: {
    type: String,
    match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  birthday: {
    type: Date
  },
  bio: {
    type: String,
    maxlength: [200, '个人简介最多200个字符']
  },
  
  // 盲盒系统相关字段
  coins: {
    type: Number,
    default: 1280, // 新用户默认1280金币
    min: [0, '金币不能为负数']
  },
  points: {
    type: Number,
    default: 0, // 积分
    min: [0, '积分不能为负数']
  },
  coupons: {
    type: Number,
    default: 0, // 优惠券数量
    min: [0, '优惠券数量不能为负数']
  },
  level: {
    type: Number,
    default: 1,
    min: [1, '等级不能小于1']
  },
  experience: {
    type: Number,
    default: 0,
    min: [0, '经验值不能为负数']
  },
  totalDraws: {
    type: Number,
    default: 0,
    min: [0, '抽奖次数不能为负数']
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: [0, '总消费金额不能为负数']
  },
  
  // 收货地址
  addresses: [{
    isDefault: {
      type: Boolean,
      default: false
    },
    receiverName: {
      type: String,
      required: true,
      trim: true
    },
    receiverPhone: {
      type: String,
      required: true,
      match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
    },
    province: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      match: [/^\d{6}$/, '请输入有效的邮政编码']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 收藏的盲盒
  favorites: [{
    blindBoxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlindBox'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 物品库存
  inventory: [{
    blindBoxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlindBox'
    },
    itemName: String,
    itemRarity: String,
    itemImageUrl: String,
    quantity: {
      type: Number,
      default: 1,
      min: [1, '物品数量不能小于1']
    },
    obtainedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 统计信息
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalPosts: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 转换为JSON时移除敏感信息
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);