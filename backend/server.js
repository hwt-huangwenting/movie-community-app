const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./src/config');
const app = express();
const port = config.port;

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
const imageDir = path.join(uploadDir, 'images');
const videoDir = path.join(uploadDir, 'videos');

[imageDir, videoDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据文件类型选择不同的目录
    const dest = file.fieldname === 'image' ? imageDir : videoDir;
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    // 允许的图片类型
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件！'));
    }
  } else if (file.fieldname === 'video') {
    // 允许的视频类型
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传视频文件！'));
    }
  } else {
    cb(new Error('未知的文件类型！'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.maxUploadSize, // 默认 500MB，可通过 MAX_UPLOAD_SIZE 调整
  }
});

// 创建数据库连接
const db = mysql.createConnection({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database
});

// 连接数据库
db.connect(err => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('成功连接到MySQL数据库');

// 启用CORS
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // 导入并使用认证路由
  const authRoutes = require('./src/routes/authRoutes');
  app.use('/api/auth', authRoutes);

  // 导入并使用电影、评论、收藏路由
  const movieRoutes = require('./src/routes/movieRoutes');
  // 注意：这里将 movieRoutes 应用在 /api 路径下，需要确保 movieRoutes 中的路由路径是相对于 /api 的。
  // 例如，在 movieRoutes.js 中定义 /movies，最终路径是 /api/movies。
  app.use('/api', movieRoutes);

}); // End of db.connect callback

// Start the server only after database connection is established (optional, but good practice)
app.listen(port, () => {
  console.log(`后端服务运行在 http://localhost:${port}`);
});

module.exports = { app, db };

