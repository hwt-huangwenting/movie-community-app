const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../../server'); // Import db from server.js
const JWT_SECRET = 'your-secret-key'; // Make sure this matches the secret in server.js and authMiddleware.js

// 用户注册
const register = async (req, res) => {
  const { username, password, email } = req.body;

  // 检查用户是否已存在
  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询失败' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入新用户
    const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    db.query(sql, [username, hashedPassword, email], (err, result) => {
      if (err) {
        return res.status(500).json({ error: '注册失败' });
      }

      // 生成JWT
      const token = jwt.sign({ id: result.insertId, username }, JWT_SECRET);
      res.json({ token, username });
    });
  });
};

// 用户登录
const login = (req, res) => {
  const { email, password } = req.body;

  // 查找用户
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询失败' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const user = results[0];

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成JWT token
    const token = jwt.sign({ id: user.hwt_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    // 登录成功，返回token 和 用户对象
    res.json({ token, user: { id: user.hwt_id, username: user.username, email: user.email } }); // 返回用户ID，用户名，邮箱
  });
};

// 添加 /api/auth/me 路由 (需要认证)
const getMe = (req, res) => {
  // 只返回用户id和username
  res.json({ id: req.user.id, username: req.user.username });
};

module.exports = { register, login, getMe }; 