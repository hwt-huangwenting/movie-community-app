-- CREATE TABLE IF NOT EXISTS comments (
--     hwt_id INT PRIMARY KEY AUTO_INCREMENT,
--     user_id INT NOT NULL,
--     movie_id INT NOT NULL,
--     content TEXT NOT NULL,
--     rating INT CHECK (rating >= 1 AND rating <= 5),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(hwt_id),
--     FOREIGN KEY (movie_id) REFERENCES movies(id)
--      INDEX idx_movie_user (movie_id, user_id)  -- 联合索引
-- ); 
CREATE TABLE IF NOT EXISTS comments (
    hwt_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    content TEXT,  -- 允许为NULL
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(hwt_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    INDEX idx_movie_user (movie_id, user_id),
    CHECK (
      (content IS NOT NULL AND TRIM(content) <> '') OR (rating IS NOT NULL)
    )
);