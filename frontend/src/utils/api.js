import axios from 'axios';

// 创建一个 axios 实例，配置了基础 URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
});

// 用于存储无效 token 处理函数
let invalidTokenHandler = null;

// 设置无效 token 处理函数的方法
export const setInvalidTokenHandler = (handler) => {
  invalidTokenHandler = handler;
};

// 请求拦截器，用于在请求头中添加 token
api.interceptors.request.use(
  (config) => {
    // 定义白名单路径
    const publicPaths = ['/auth/login', '/auth/register'];
    // 检查当前请求的 URL 是否在白名单中
    const isPublicPath = publicPaths.some(path => config.url.endsWith(path));

    // 如果是白名单路径，则不附加 token，直接返回 config
    if (isPublicPath) {
      return config;
    }

    // 如果不是白名单路径，则尝试获取并附加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，用于处理 token 过期或无效的情况
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Token expired or invalid.');
      if (invalidTokenHandler) {
        invalidTokenHandler(); 
      } else {
       
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

// 导出配置好的 axios 实例
export default api;