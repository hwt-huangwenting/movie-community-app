const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

// 用户注册路由
router.post('/register', register);

// 用户登录路由
router.post('/login', login);

// 获取当前用户信息路由 (需要认证)
router.get('/me', authenticateToken, getMe);

module.exports = router; 