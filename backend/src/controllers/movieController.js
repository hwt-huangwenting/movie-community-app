const { db } = require('../../server'); // 导入数据库连接
const path = require('path');
const fs = require('fs');

// 搜索电影（支持多条件筛选）
const searchMovies = (req, res) => {
  // 从请求参数中获取查询条件
  const { query, type, year, region, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit; // 计算偏移量

  // 构建SQL查询条件
  let where = [];
  let params = [];

  // 标题模糊查询
  if (query) {
    where.push('hwt_title LIKE ?');
    params.push(`%${query}%`);
  }
  
  // 类型筛选（类型存放在 description 字段，沿用既有表结构）
  if (type) {
    where.push('description = ?');
    params.push(type);
  }
  
  // 地区筛选（排除"全部"选项）
  if (region && region !== '全部') {
    where.push('region = ?');
    params.push(region);
  }
  
  // 年份筛选
  if (year) {
    if (year.endsWith('年代')) {
      // 处理年代查询（如"90年代"）
      const decadeStr = year.replace('年代', '');
      let decade = parseInt(decadeStr, 10);
      
      // 年代转换逻辑
      if (decade < 100) {
        if (decade === 0) {
          decade = 2000;
        } else if (decade < 30) {
          decade = 2000 + decade;
        } else {
          decade = 1900 + decade;
        }
      }
      where.push('year >= ? AND year < ?');
      params.push(decade, decade + 10);
    } else {
      where.push('year = ?');
      params.push(parseInt(year));
    }
  }

  // 构建完整SQL语句
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const sql = `SELECT * FROM movies ${whereSql} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) AS total FROM movies ${whereSql}`;

  // 先查询总数
  db.query(countSql, params, (err, countResult) => {
    if (err) return res.status(500).json({ error: '数据库查询失败' });
    
    const total = countResult[0].total;
    
    // 再查询分页数据
    db.query(sql, [...params, parseInt(limit), parseInt(offset)], (err, results) => {
      if (err) return res.status(500).json({ error: '数据库查询失败' });
      
      // 返回结果包含分页信息
      res.json({
        movies: results,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMovies: total
      });
    });
  });
};

// 获取所有电影（带分页）
const getAllMovies = (req, res) => {
  // 分页参数处理
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;

  // 先获取总数
  db.query('SELECT COUNT(*) as total FROM movies', (err, countResult) => {
    if (err) {
      console.error('获取总数错误:', err);
      return res.status(500).json({ error: '数据库查询失败' });
    }

    const total = countResult[0].total;

    // 获取分页数据
    const sql = 'SELECT * FROM movies LIMIT ? OFFSET ?';
    db.query(sql, [limit, offset], (err, results) => {
      if (err) {
        console.error('数据库查询错误:', err);
        return res.status(500).json({ error: '数据库查询失败' });
      }
      
      // 返回结果包含分页信息
      res.json({
        movies: results,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
};

// 获取热门电影列表（按热度排序）
const getPopularMovies = async (req, res) => {
  // 分页参数处理
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // 查询电影数据及相关指标
    const moviesDataQuery = `
      SELECT
          m.id,
          m.hwt_title,
          m.year,
          m.rating as original_rating,
          m.image,
          m.video_url,
          m.description,
          m.region,
          COALESCE(AVG(CASE WHEN c.rating IS NOT NULL THEN c.rating END), 0) as average_rating,
          SUM(CASE WHEN c.rating IS NOT NULL THEN 1 ELSE 0 END) as rated_comment_count,
          SUM(CASE WHEN c.rating IS NULL THEN 1 ELSE 0 END) as unrated_comment_count,
          COUNT(DISTINCT col.hwt_id) as collection_count
      FROM movies m
      LEFT JOIN comments c ON m.id = c.movie_id
      LEFT JOIN collections col ON m.id = col.movie_id
      GROUP BY m.id
    `;

    db.query(moviesDataQuery, async (err, movies) => {
      if (err) {
        console.error('数据库查询错误:', err);
        return res.status(500).json({ error: '数据库查询失败' });
      }

      if (movies.length === 0) {
        return res.json({ movies: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      }

      // 计算归一化所需的最小最大值（评论数用加权）
      const weightedCommentCounts = movies.map(m => m.rated_comment_count * 2 + m.unrated_comment_count * 1);
      const minRating = Math.min(...movies.map(m => m.average_rating));
      const maxRating = Math.max(...movies.map(m => m.average_rating));
      const minComment = Math.min(...weightedCommentCounts);
      const maxComment = Math.max(...weightedCommentCounts);
      const minCollection = Math.min(...movies.map(m => m.collection_count));
      const maxCollection = Math.max(...movies.map(m => m.collection_count));

      // 计算热度值
      const moviesWithHotness = movies.map((movie, idx) => {
        // 归一化处理
        const normalizedRating = maxRating === minRating ? 0 : (movie.average_rating - minRating) / (maxRating - minRating);
        const weightedCommentCount = movie.rated_comment_count * 2 + movie.unrated_comment_count * 1;
        const normalizedComment = maxComment === minComment ? 0 : (weightedCommentCount - minComment) / (maxComment - minComment);
        const normalizedCollection = maxCollection === minCollection ? 0 : (movie.collection_count - minCollection) / (maxCollection - minCollection);

        // 加权计算热度（评分权重50%，评论30%，收藏20%）
        const hotness = (0.5 * normalizedRating) + (0.3 * normalizedComment) + (0.2 * normalizedCollection);

        return { ...movie, hotness };
      });

      // 按热度降序排序
      moviesWithHotness.sort((a, b) => b.hotness - a.hotness);

      // 只取前4名热门电影
      const top3Movies = moviesWithHotness.slice(0, 4);

      // 分页处理
      const paginatedMovies = top3Movies.slice(offset, offset + limit);
      const totalMovies = top3Movies.length;
      const totalPages = Math.ceil(totalMovies / limit);

      res.json({
        movies: paginatedMovies,
        pagination: {
          total: totalMovies,
          page,
          limit,
          totalPages
        }
      });
    });

  } catch (error) {
    console.error('获取热门电影错误:', error);
    res.status(500).json({ error: '获取热门电影失败' });
  }
};

// 获取单个电影详情
const getMovieById = (req, res) => {
  const movieId = req.params.id;
  // 类型在库中存于 description 字段，这里别名为 type，让前端按业务语义取值
  const sql = 'SELECT *, description AS type FROM movies WHERE id = ?';

  db.query(sql, [movieId], (err, results) => {
    if (err) {
      console.error('数据库查询错误:', err);
      return res.status(500).json({ error: '数据库查询失败' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: '电影未找到' });
    }
    res.json(results[0]);
  });
};

// 获取电影评论列表
const getMovieComments = (req, res) => {
  const movieId = req.params.movieId;
  const sql = `
    SELECT c.*, u.username
    FROM comments c
    JOIN users u ON c.user_id = u.hwt_id
    WHERE c.movie_id = ?
    ORDER BY c.created_at DESC
  `;

  db.query(sql, [movieId], (err, results) => {
    if (err) {
      console.error('获取评论失败:', err);
      return res.status(500).json({ error: '获取评论失败' });
    }
    res.json(results);
  });
};

// 添加评论
const addComment = (req, res) => {
  const { movie_id, content, rating } = req.body;
  const user_id = req.user.id; // 从认证信息中获取用户ID

  // 新增校验：两者不能同时为空
  if ((!content || content.trim() === '') && (rating === undefined || rating === null)) {
    return res.status(400).json({ error: '评论内容和评分不能同时为空' });
  }

  const sql = 'INSERT INTO comments (user_id, movie_id, content, rating) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, movie_id, content || null, rating !== undefined ? rating : null], (err, result) => {
    if (err) {
      console.error('添加评论失败:', err);
      return res.status(500).json({ error: '添加评论失败' });
    }
    // 返回新添加的评论信息
    res.json({
      id: result.insertId,
      user_id,
      movie_id,
      content,
      rating,
      created_at: new Date(),
      username: req.user.username
    });
  });
};

// 删除评论
const deleteComment = (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  // 先检查评论是否存在且属于当前用户
  const checkSql = 'SELECT * FROM comments WHERE hwt_id = ? AND user_id = ?';
  db.query(checkSql, [commentId, userId], (err, results) => {
    if (err) {
      console.error('删除评论检查数据库错误:', err);
      return res.status(500).json({ error: '数据库查询失败' });
    }
    if (results.length === 0) {
      return res.status(403).json({ error: '无权删除此评论' });
    }

    // 执行删除操作
    const deleteSql = 'DELETE FROM comments WHERE hwt_id = ?';
    db.query(deleteSql, [commentId], (err, result) => {
      if (err) {
        console.error('删除评论执行数据库错误:', err);
        return res.status(500).json({ error: '删除评论失败' });
      }
      res.json({ message: '评论已删除' });
    });
  });
};

// 添加收藏
const addCollection = (req, res) => {
  const { movie_id } = req.body;
  const user_id = req.user.id; // 从认证信息中获取用户ID

  if (!movie_id) {
    return res.status(400).json({ error: '缺少movie_id参数' });
  }

  const sql = 'INSERT INTO collections (user_id, movie_id) VALUES (?, ?)';
  db.query(sql, [user_id, movie_id], (err, result) => {
    if (err) {
      console.error('添加收藏错误:', err);
      // 处理重复收藏的情况
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: '电影已在收藏列表中' });
      }
      return res.status(500).json({ error: '添加收藏失败' });
    }
    res.status(201).json({ message: '收藏成功' });
  });
};

// 移除收藏
const removeCollection = (req, res) => {
  const movie_id = req.params.movieId;
  const user_id = req.user.id; // 从认证信息中获取用户ID

  const sql = 'DELETE FROM collections WHERE user_id = ? AND movie_id = ?';
  db.query(sql, [user_id, movie_id], (err, result) => {
    if (err) {
      console.error('移除收藏错误:', err);
      return res.status(500).json({ error: '移除收藏失败' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '收藏列表中未找到该电影' });
    }
    res.json({ message: '移除收藏成功' });
  });
};

// 检查收藏状态
const checkCollectionStatus = (req, res) => {
  const movie_id = req.params.movieId;
  const user_id = req.user.id; // 从认证信息中获取用户ID

  const sql = 'SELECT COUNT(*) AS count FROM collections WHERE user_id = ? AND movie_id = ?';
  db.query(sql, [user_id, movie_id], (err, result) => {
    if (err) {
      console.error('检查收藏状态错误:', err);
      return res.status(500).json({ error: '检查收藏状态失败' });
    }
    const isCollected = result[0].count > 0;
    res.json({ isCollected });
  });
};

// 获取用户收藏列表
const getUserCollections = (req, res) => {
  const user_id_from_params = req.params.userId; // 从URL参数获取用户ID
  const user_id_from_token = req.user.id; // 从token获取用户ID

  // 防止查询其他用户的收藏
  if (user_id_from_params !== user_id_from_token.toString()) {
       return res.status(403).json({ error: '无权访问' });
  }

  // 联表查询获取电影详情
  const sql = 'SELECT m.* FROM collections c JOIN movies m ON c.movie_id = m.id WHERE c.user_id = ?';
  db.query(sql, [user_id_from_token], (err, results) => {
    if (err) {
      console.error('获取用户收藏错误:', err);
      return res.status(500).json({ error: '获取收藏列表失败' });
    }
    res.json(results);
  });
};

// 导出所有控制器方法
module.exports = {
    searchMovies,
    getAllMovies,
    getPopularMovies,
    getMovieById,
    getMovieComments,
    addComment,
    deleteComment,
    addCollection,
    removeCollection,
    checkCollectionStatus,
    getUserCollections,
};