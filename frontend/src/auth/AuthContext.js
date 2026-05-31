import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setInvalidTokenHandler } from '../utils/api'; // 导入api和设置无效token处理器
import { useNavigate } from 'react-router-dom'; // 导入路由导航

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 用户信息状态
  const [loading, setLoading] = useState(true); // 加载状态
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 认证状态
  const navigate = useNavigate(); // 获取路由导航函数

  useEffect(() => {
    const token = localStorage.getItem('token'); // 从本地存储获取token

    // 注册无效token处理器
    setInvalidTokenHandler(() => {
      console.log('AuthContext: 检测到无效token，执行登出操作');
      logout(); // 调用AuthContext的登出函数
      navigate('/login'); // 重定向到登录页
    });

    if (token) {
      // 验证token并获取用户信息
      api.get('/auth/me') // 使用api服务
      .then(response => {
        setUser(response.data);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // 如果/auth/me请求失败，说明token无效或已过期
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        // 不需要在这里导航，拦截器处理器会处理
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, [navigate]); // 添加navigate到依赖数组

  // 登录函数
  const login = async (email, password) => {
    try {
      // 使用api服务
      const response = await api.post('/auth/login', {
        email: email,
        password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      console.log('AuthContext 登录成功，设置用户:', user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || '登录失败'
      };
    }
  };

  // 注册函数
  const register = async (username, password) => {
    try {
      // 使用api服务
      const response = await api.post('/auth/register', {
        username,
        password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || '注册失败'
      };
    }
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // 获取token函数
  const getToken = () => {
    return localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, getToken, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义hook使用Auth上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
};