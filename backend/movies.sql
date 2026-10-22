CREATE DATABASE IF NOT EXISTS movies_db;
USE movies_db;

CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hwt_title VARCHAR(255) NOT NULL,
  description TEXT COMMENT '类型/标签，如 剧情、科幻',
  summary TEXT COMMENT '剧情简介',
  year INT,
  rating DECIMAL(3,1),
  image VARCHAR(255),
  video_url VARCHAR(255),
  region VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_title (hwt_title),
  INDEX idx_year (year)
);


INSERT INTO movies (id,hwt_title, description, year, rating, image) VALUES
(1,'肖申克的救赎', '剧情', 1994, 9.7, '/img/1.jpg'),
(2,'阿甘正传',  '剧情', 1994, 9.5, '/img/2.jpg'),
(3,'泰坦尼克号',  '爱情', 1997, 9.4, '/img/4.jpg'),
(4,'这个杀手不太冷', '动作', 1994, 9.4, '/img/6.jpg'),
(5,'盗梦空间', '科幻', 2010, 9.3, '/img/3.jpg'),
(6,'星际穿越',  '科幻', 2014, 9.3, '/img/5.jpg'),
(7,'千与千寻', '动画', 2001, 9.2, '/img/7.jpg'),
(8,'教父', '犯罪', 1972, 9.4, '/img/8.jpg');

UPDATE movies SET summary = '一部关于希望与救赎的经典电影，讲述了安迪在肖申克监狱中的传奇人生。' WHERE id = 1;
UPDATE movies SET summary = '阿甘用奔跑改变了自己的人生，见证了美国近代历史的变迁。' WHERE id = 2;
UPDATE movies SET summary = '一段发生在泰坦尼克号上的爱情故事，感人至深。' WHERE id = 3;
UPDATE movies SET summary = '讲述了杀手里昂与小女孩玛蒂尔达之间的温情故事。' WHERE id = 4;
UPDATE movies SET summary = '一部关于梦境与现实交错的科幻大片。' WHERE id = 5;
UPDATE movies SET summary = '人类为寻找新家园而穿越虫洞的壮阔旅程。' WHERE id = 6;
UPDATE movies SET summary = '宫崎骏经典动画，少女千寻在神秘世界的成长冒险。' WHERE id = 7;
UPDATE movies SET summary = '黑帮家族的权力更迭与家族情感纠葛。' WHERE id = 8;

UPDATE movies SET region = '美国' WHERE id IN (1, 2, 3, 5, 6, 8);
UPDATE movies SET region = '法国' WHERE id = 4;
UPDATE movies SET region = '日本' WHERE id = 7;
