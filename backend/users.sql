CREATE DATABASE IF NOT EXISTS movies_db;
USE movies_db;

CREATE TABLE IF NOT EXISTS users (
  hwt_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt 哈希，不存明文',
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
);
