const express = require('express');
const router = express.Router();
const PlayerShow = require('../models/PlayerShow');
const { auth } = require('../middleware/auth');

// 获取玩家秀帖子列表
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'latest'; // latest, hot
    const skip = (page - 1) * limit;

    let posts;
    if (sort === 'hot') {
      posts = await PlayerShow.getHotPosts(limit);
      if (page > 1) {
        posts = await PlayerShow.find({ isHidden: false })
          .sort({ isPinned: -1, likesCount: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'username avatar')
          .populate('relatedBlindBox.blindBoxId', 'name imageUrl price');
      }
    } else {
      posts = await PlayerShow.getLatestPosts(limit, skip);
    }

    // 如果用户已登录，添加点赞状态
    const token = req.headers.authorization?.replace('Bearer ', '');
    let currentUserId = null;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        currentUserId = decoded.userId;
      } catch (error) {
        // Token无效，忽略错误，继续返回数据
      }
    }

    // 为每个帖子添加当前用户的点赞状态
    if (currentUserId) {
      posts = posts.map(post => {
        const postObj = post.toObject();
        postObj.isLiked = post.likes.some(like => like.userId.toString() === currentUserId.toString());
        return postObj;
      });
    }

    const total = await PlayerShow.countDocuments({ isHidden: false });

    res.json({
      success: true,
      data: {
        posts,
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
      message: '获取帖子列表失败',
      error: error.message
    });
  }
});

// 获取帖子详情
router.get('/:id', async (req, res) => {
  try {
    const post = await PlayerShow.findById(req.params.id)
      .populate('userId', 'username avatar')
      .populate('relatedBlindBox.blindBoxId', 'name imageUrl price')
      .populate('comments.userId', 'username avatar');

    if (!post || post.isHidden) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 增加浏览量
    await post.incrementViews();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取帖子详情失败',
      error: error.message
    });
  }
});

// 创建帖子
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, images, relatedBlindBox, tags } = req.body;

    const post = new PlayerShow({
      userId: req.user._id,
      username: req.user.username,
      userAvatar: req.user.avatar,
      title,
      content,
      images: images || [],
      relatedBlindBox,
      tags: tags || []
    });

    await post.save();

    // 更新用户统计
    req.user.stats.totalPosts += 1;
    await req.user.save();

    res.status(201).json({
      success: true,
      data: post,
      message: '帖子发布成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '发布帖子失败',
      error: error.message
    });
  }
});

// 点赞/取消点赞
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await PlayerShow.findById(req.params.id);

    if (!post || post.isHidden) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    const result = post.toggleLike(req.user._id);
    await post.save();

    res.json({
      success: true,
      data: {
        action: result.action,
        likesCount: result.likesCount,
        isLiked: result.action === 'liked'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message
    });
  }
});

// 添加评论
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '评论内容不能为空'
      });
    }

    const post = await PlayerShow.findById(req.params.id);

    if (!post || post.isHidden) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    const comment = {
      userId: req.user._id,
      username: req.user.username,
      userAvatar: req.user.avatar,
      content: content.trim()
    };

    await post.addComment(comment);

    // 更新用户统计
    req.user.stats.totalComments += 1;
    await req.user.save();

    res.status(201).json({
      success: true,
      data: comment,
      message: '评论添加成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '添加评论失败',
      error: error.message
    });
  }
});

// 删除评论
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await PlayerShow.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 检查权限：只有评论作者或帖子作者可以删除评论
    if (comment.userId.toString() !== req.user._id.toString() && 
        post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此评论'
      });
    }

    const success = post.removeComment(req.params.commentId);
    if (success) {
      await post.save();
      
      // 更新用户统计
      if (comment.userId.toString() === req.user._id.toString()) {
        req.user.stats.totalComments = Math.max(0, req.user.stats.totalComments - 1);
        await req.user.save();
      }
    }

    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除评论失败',
      error: error.message
    });
  }
});

// 搜索帖子
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await PlayerShow.searchPosts(keyword, limit, skip);

    const total = await PlayerShow.find({
      isHidden: false,
      $or: [
        { content: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ]
    }).countDocuments();

    res.json({
      success: true,
      data: {
        posts,
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

// 获取用户的帖子
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await PlayerShow.getPostsByUser(userId, limit, skip);

    const total = await PlayerShow.countDocuments({ 
      userId, 
      isHidden: false 
    });

    res.json({
      success: true,
      data: {
        posts,
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
      message: '获取用户帖子失败',
      error: error.message
    });
  }
});

// 删除帖子
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await PlayerShow.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 检查权限：只有帖子作者可以删除
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此帖子'
      });
    }

    // 软删除：设置为隐藏
    post.isHidden = true;
    await post.save();

    // 更新用户统计
    req.user.stats.totalPosts = Math.max(0, req.user.stats.totalPosts - 1);
    await req.user.save();

    res.json({
      success: true,
      message: '帖子删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除帖子失败',
      error: error.message
    });
  }
});

module.exports = router;