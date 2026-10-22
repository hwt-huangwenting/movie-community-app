const path = require('path');

// 统一的配置入口：所有环境变量只在这里读取一次，
// 避免密钥在多个文件里各写一份导致签名/校验不一致。
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('生产环境必须通过环境变量 JWT_SECRET 提供签名密钥');
}

const config = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'movies_db',
  },
  maxUploadSize: Number(process.env.MAX_UPLOAD_SIZE || 500 * 1024 * 1024),
};

module.exports = config;
