# 电影社区平台

基于 React 18 + Express 的前后端分离电影社区平台，支持用户认证、电影管理、评论收藏等功能。

## 技术栈

**前端**
- React 18
- React Router v6
- MUI (Material-UI)
- Axios
- lodash（搜索防抖）

**后端**
- Node.js / Express
- MySQL
- JWT 认证
- Multer 文件上传
- bcryptjs 密码加密

## 功能

- 用户注册/登录（JWT Token 认证）
- 电影浏览与分类筛选
- 电影详情页与星级评分
- 评论系统
- 收藏管理
- 搜索功能（防抖优化）
- 电影/视频上传

## 项目结构

```
movie-app/
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── auth/            # 登录注册模块
│   │   ├── components/      # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── styles/          # 样式文件
│   │   └── utils/           # 工具函数（Axios 封装等）
│   └── public/              # 静态资源
├── backend/                 # Express 后端
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── middleware/      # 中间件（JWT 鉴权）
│   │   └── routes/          # 路由定义
│   ├── uploads/             # 上传文件
│   └── *.sql                # 数据库脚本
```

## 运行

### 后端
```bash
cd backend
npm install
# 配置环境变量 DB_PASSWORD 和 JWT_SECRET
npm start
# 服务运行在 http://localhost:5000
```

### 前端
```bash
cd frontend
npm install
npm start
# 运行在 http://localhost:3000
```

## 数据库

导入 `backend/` 目录下的 SQL 文件初始化数据库：
- `users.sql` — 用户表
- `movies.sql` — 电影表（含初始数据）
- `comments.sql` — 评论表
- `collections.sql` — 收藏表
