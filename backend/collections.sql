CREATE DATABASE IF NOT EXISTS movies_db;
USE movies_db;

CREATE TABLE IF NOT EXISTS collections (
  hwt_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(hwt_id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE (user_id, movie_id) -- 一个用户对同一部电影只能收藏一次
);
