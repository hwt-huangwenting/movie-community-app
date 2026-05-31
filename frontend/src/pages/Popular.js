import React, { useState, useEffect } from 'react';
import PopularMovieList from '../components/PopularMovieList';

function Popular() {
  // 定义状态变量
  const [popularMovies, setPopularMovies] = useState([]); // 存储热门电影列表
  const [loading, setLoading] = useState(true); // 加载状态
  const [pagination, setPagination] = useState({}); // 分页信息
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const moviesPerPage = 10; // 每页显示电影数量，应与后端配置一致

  // 当页码变化时重新获取数据
  useEffect(() => {
    fetchPopularMovies(currentPage);
  }, [currentPage]);

  // 获取热门电影数据
  const fetchPopularMovies = async (page) => {
    setLoading(true); // 开始加载
    try {
      // 调用后端API获取热门电影
      const response = await fetch(`http://localhost:5000/api/movies/popular?page=${page}&limit=${moviesPerPage}`);
      const data = await response.json();
      
      // 更新状态
      setPopularMovies(data.movies || []); // 设置电影列表
      setPagination(data.pagination || {}); // 设置分页信息
      setLoading(false); // 结束加载
    } catch (error) {
      console.error('获取热门电影失败:', error);
      setLoading(false);
    }
  };

  // 处理页码变化
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // 更新当前页码
  };

  // 加载状态显示
  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1>热门电影</h1>
      
      {/* 渲染热门电影列表 */}
      <PopularMovieList movies={popularMovies} />
      
      {/* 分页控件 */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          {/* 生成页码按钮 */}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNumber => (
            <button
              key={pageNumber} // 使用页码作为key
              onClick={() => handlePageChange(pageNumber)} // 点击事件
              disabled={pageNumber === currentPage} // 禁用当前页按钮
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Popular;