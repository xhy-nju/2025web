const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 基础认证中间件
const auth = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，没有提供token'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: '无效的token或用户已被禁用'
      });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 将用户信息添加到请求对象
    req.userId = decoded.userId;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({
      success: false,
      message: '无效的token'
    });
  }
};

// 管理员权限中间件
const adminAuth = async (req, res, next) => {
  try {
    // 先进行基础认证
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '访问被拒绝，需要管理员权限'
      });
    }

    next();
  } catch (error) {
    console.error('管理员认证错误:', error);
    res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};

// 可选认证中间件（用于某些接口可以匿名访问，但如果有token则验证）
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.userId = decoded.userId;
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // 可选认证失败时不阻止请求继续
    console.warn('可选认证失败:', error.message);
    next();
  }
};

module.exports = {
  auth,
  adminAuth,
  optionalAuth
};