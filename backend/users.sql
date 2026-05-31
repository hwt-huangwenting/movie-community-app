CREATE TABLE IF NOT EXISTS users (
  hwt_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  INDEX idx_username (username),     -- 用户名索引
  INDEX idx_email (email)           -- 邮箱索引
); 