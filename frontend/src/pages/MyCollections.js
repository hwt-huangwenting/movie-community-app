import React, { useEffect, useState } from 'react';
import api from '../utils/api'; // 导入API服务
import { useAuth } from '../auth/AuthContext';
import MovieList from '../components/MovieList'; // 复用电影列表组件

const MyCollections = () => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('我的收藏 - 用户:', user, '是否认证:', isAuthenticated, '加载状态:', loading); // 调试日志

  const [collections, setCollections] = useState([]); // 收藏列表状态
  const [isLoading, setIsLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误信息

  useEffect(() => {
    const fetchCollections = async () => {
      // 未认证或用户信息不完整时直接返回
      if (!isAuthenticated || !user || !user.id) {
        setIsLoading(false);
        return;
      }

      try {
        // 调用API获取用户收藏
        const response = await api.get(`/collections/${user.id}`);
        setCollections(response.data); // 设置收藏数据
        setIsLoading(false); // 加载完成
      } catch (err) {
        console.error('获取用户收藏失败:', err);
        setError('加载收藏列表失败。'); // 设置错误信息
        setIsLoading(false);
      }
    };

    // 认证状态已解析且用户已认证时获取数据
    if (!loading && isAuthenticated) {
       fetchCollections();
    } else if (!loading && !isAuthenticated) {
       setIsLoading(false);
       // 用户未认证，显示提示信息
    }

  }, [isAuthenticated, user, loading]); // 依赖认证状态、用户信息和加载状态

  // 加载中显示
  if (isLoading) {
    return <div className="container">加载中...</div>;
  }

  // 错误显示
  if (error) {
    return <div className="container">错误: {error}</div>;
  }

  // 未认证提示
  if (!isAuthenticated) {
     return <div className="container">请登录以查看您的收藏。</div>;
  }

  // 空收藏提示
  if (collections.length === 0) {
    return (
      <div className="no-collections">
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
        <div style={{ fontSize: '1.3rem', color: '#888', marginBottom: 16 }}>您还没有收藏任何电影</div>
        <button
          style={{
            padding: '8px 24px',
            background: '#ff9800',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: 8
          }}
          onClick={() => window.location.href = '/'}
        >
          去首页发现好电影
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center', marginTop: '20px', fontSize: '2.2rem', fontWeight: 700 }}>我的收藏</h2>
      {/* 复用MovieList组件展示收藏的电影 */}
      <MovieList movies={collections} />
    </div>
  );
};

export default MyCollections;
