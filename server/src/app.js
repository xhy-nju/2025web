const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 数据库连接
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 连接数据库
connectDB();

// 中间件配置
app.use(helmet()); // 安全头部
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined')); // 日志记录
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('images'));

// API路由
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// API 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const productRoutes = require('./routes/products');
const blindBoxRoutes = require('./routes/blindBoxes');
const orderRoutes = require('./routes/orders');
const playerShowRoutes = require('./routes/playerShow');

// 使用路由
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/blind-boxes`, blindBoxRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);
app.use(`${apiPrefix}/player-show`, playerShowRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'Web项目后端API服务',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: `${process.env.API_PREFIX || '/api/v1'}/auth`,
      users: `${process.env.API_PREFIX || '/api/v1'}/users`,
      upload: `${process.env.API_PREFIX || '/api/v1'}/upload`,
      products: `${process.env.API_PREFIX || '/api/v1'}/products`,
      blindBoxes: `${process.env.API_PREFIX || '/api/v1'}/blind-boxes`,
      orders: `${process.env.API_PREFIX || '/api/v1'}/orders`,
      playerShow: `${process.env.API_PREFIX || '/api/v1'}/player-show`
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;