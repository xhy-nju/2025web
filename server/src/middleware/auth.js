const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '无效的token'
      });
    }

    // 将用户ID添加到请求对象
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

module.exports = auth;