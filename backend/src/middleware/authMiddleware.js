const jwt = require('jsonwebtoken');

const config = require('../config');

const authenticateToken = (req, res, next) => {
  // 定义不需要token验证的公开路径
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/movies/search', '/api/movies', '/api/movies/popular', /\/api\/movies\/\d+\/?$/, /\/api\/movies\/\d+\/comments\/?$/];

  // 检查当前请求路径是否在白名单中
  const isPublicPath = publicPaths.some(path => {
    if (typeof path === 'string') {
      return req.path === path;
    } else if (path instanceof RegExp) {
      return path.test(req.path);
    }
    return false;
  });

  // 如果是公开路径，跳过验证
  if (isPublicPath) {
    return next();
  }

  // 从请求头中获取Token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 如果没有提供Token
  if (!token) {
    return res.status(401).json({ error: '未提供认证token' });
  }

  // 验证Token
  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      // Token无效或已过期
      return res.status(403).json({ error: 'token无效' });
    }
    // Token有效，将用户信息附加到请求对象上
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;