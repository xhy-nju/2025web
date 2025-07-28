# Web项目后端服务

这是一个基于 Node.js 和 Express.js 的后端服务，为Web开发大作业提供API支持。

## 功能特性

- 🚀 Express.js 框架
- 🔐 JWT 身份认证
- 📦 MongoDB 数据库
- 🛡️ 安全中间件 (Helmet, CORS)
- 📝 请求日志记录
- 📁 文件上传功能
- ✅ 输入验证
- 🔧 环境配置管理

## 项目结构

```
server/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.js  # 数据库配置
│   ├── middleware/      # 中间件
│   │   └── auth.js      # JWT认证中间件
│   ├── models/          # 数据模型
│   │   └── User.js      # 用户模型
│   ├── routes/          # 路由文件
│   │   ├── auth.js      # 认证路由
│   │   ├── users.js     # 用户路由
│   │   └── upload.js    # 文件上传路由
│   └── app.js           # 主应用文件
├── uploads/             # 上传文件目录
├── .env                 # 环境变量
├── .gitignore          # Git忽略文件
├── package.json        # 项目依赖
└── README.md           # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 环境配置

复制 `.env` 文件并根据需要修改配置：

```bash
# 环境配置
NODE_ENV=development
PORT=3000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/web_project_db

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=http://localhost:5173
```

### 3. 启动服务

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## API 端点

### 认证相关
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录

### 用户管理
- `GET /api/v1/users/profile` - 获取当前用户信息
- `PUT /api/v1/users/profile` - 更新用户信息
- `GET /api/v1/users` - 获取用户列表（需要认证）

### 文件上传
- `POST /api/v1/upload/single` - 单文件上传
- `POST /api/v1/upload/multiple` - 多文件上传

### 系统
- `GET /health` - 健康检查
- `GET /` - 服务信息

## 开发说明

### 数据库
项目使用 MongoDB 作为数据库，请确保本地已安装并启动 MongoDB 服务。

### 认证机制
使用 JWT (JSON Web Token) 进行用户认证，token 需要在请求头中携带：
```
Authorization: Bearer <your_token>
```

### 文件上传
支持的文件类型：jpeg, jpg, png, gif, pdf, doc, docx, txt
最大文件大小：5MB

## 部署

1. 设置生产环境变量
2. 安装依赖：`npm install --production`
3. 启动服务：`npm start`

## 技术栈

- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT
- **安全**: Helmet, CORS
- **文件上传**: Multer
- **验证**: Express-validator
- **日志**: Morgan

## 许可证

MIT License