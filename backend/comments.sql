CREATE DATABASE IF NOT EXISTS movies_db;
USE movies_db;

CREATE TABLE IF NOT EXISTS comments (
  hwt_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  content TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(hwt_id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_movie_user (movie_id, user_id),
  -- 一条评论至少要有点评内容或星级评分之一
  CHECK ((content IS NOT NULL AND TRIM(content) <> '') OR (rating IS NOT NULL))
);
