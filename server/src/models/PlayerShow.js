const mongoose = require('mongoose');

// 评论模式
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必需的']
  },
  username: {
    type: String,
    required: [true, '用户名是必需的']
  },
  userAvatar: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: [true, '评论内容是必需的'],
    trim: true,
    maxlength: [500, '评论内容不能超过500个字符']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 玩家秀帖子模式
const playerShowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必需的'],
    index: true
  },
  username: {
    type: String,
    required: [true, '用户名是必需的']
  },
  userAvatar: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: [true, '帖子标题是必需的'],
    trim: true,
    maxlength: [100, '帖子标题不能超过100个字符']
  },
  content: {
    type: String,
    required: [true, '帖子内容是必需的'],
    trim: true,
    maxlength: [1000, '帖子内容不能超过1000个字符']
  },
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 9; // 最多9张图片
      },
      message: '最多只能上传9张图片'
    }
  },
  // 关联的盲盒信息
  relatedBlindBox: {
    blindBoxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlindBox'
    },
    blindBoxName: String,
    drawnItem: {
      name: String,
      rarity: String,
      imageUrl: String
    }
  },
  // 点赞用户列表
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  // 评论列表
  comments: [commentSchema],
  commentsCount: {
    type: Number,
    default: 0
  },
  // 浏览量
  viewsCount: {
    type: Number,
    default: 0
  },
  // 是否置顶
  isPinned: {
    type: Boolean,
    default: false
  },
  // 是否隐藏
  isHidden: {
    type: Boolean,
    default: false
  },
  // 标签
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '标签不能超过20个字符']
  }]
}, {
  timestamps: true
});

// 添加索引
playerShowSchema.index({ userId: 1 });
playerShowSchema.index({ createdAt: -1 });
playerShowSchema.index({ likesCount: -1 });
playerShowSchema.index({ isPinned: -1, createdAt: -1 });
playerShowSchema.index({ isHidden: 1 });
playerShowSchema.index({ tags: 1 });

// 实例方法：点赞/取消点赞
playerShowSchema.methods.toggleLike = function(userId) {
  const existingLikeIndex = this.likes.findIndex(
    like => like.userId.toString() === userId.toString()
  );
  
  if (existingLikeIndex > -1) {
    // 取消点赞
    this.likes.splice(existingLikeIndex, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
    return { action: 'unliked', likesCount: this.likesCount };
  } else {
    // 点赞
    this.likes.push({ userId });
    this.likesCount += 1;
    return { action: 'liked', likesCount: this.likesCount };
  }
};

// 实例方法：添加评论
playerShowSchema.methods.addComment = function(commentData) {
  this.comments.push(commentData);
  this.commentsCount += 1;
  return this.save();
};

// 实例方法：删除评论
playerShowSchema.methods.removeComment = function(commentId) {
  const commentIndex = this.comments.findIndex(
    comment => comment._id.toString() === commentId.toString()
  );
  
  if (commentIndex > -1) {
    this.comments.splice(commentIndex, 1);
    this.commentsCount = Math.max(0, this.commentsCount - 1);
    return true;
  }
  return false;
};

// 实例方法：增加浏览量
playerShowSchema.methods.incrementViews = function() {
  this.viewsCount += 1;
  return this.save();
};

// 静态方法：获取热门帖子
playerShowSchema.statics.getHotPosts = function(limit = 10) {
  return this.find({ isHidden: false })
    .sort({ isPinned: -1, likesCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username avatar')
    .populate('relatedBlindBox.blindBoxId', 'name imageUrl price');
};

// 静态方法：获取最新帖子
playerShowSchema.statics.getLatestPosts = function(limit = 10, skip = 0) {
  return this.find({ isHidden: false })
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username avatar')
    .populate('relatedBlindBox.blindBoxId', 'name imageUrl price');
};

// 静态方法：根据用户获取帖子
playerShowSchema.statics.getPostsByUser = function(userId, limit = 10, skip = 0) {
  return this.find({ userId, isHidden: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('relatedBlindBox.blindBoxId', 'name imageUrl price');
};

// 静态方法：搜索帖子
playerShowSchema.statics.searchPosts = function(keyword, limit = 10, skip = 0) {
  return this.find({
    isHidden: false,
    $or: [
      { content: { $regex: keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(keyword, 'i')] } }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username avatar')
    .populate('relatedBlindBox.blindBoxId', 'name imageUrl price');
};

module.exports = mongoose.model('PlayerShow', playerShowSchema);