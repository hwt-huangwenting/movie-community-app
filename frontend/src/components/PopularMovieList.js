import React from 'react';
import '../styles/MovieList.css'; // 导入样式文件
import { getImageUrl } from '../utils/urlUtils'; // 导入图片URL处理工具
import { useNavigate } from 'react-router-dom'; // 导入路由导航钩子

function PopularMovieList({ movies }) {
  const navigate = useNavigate(); // 初始化路由导航

  // 处理电影点击事件
  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`); // 跳转到电影详情页
  };

  return (
    <div className="movie-list-container">
      <ul className="movie-list">
        {movies.map(movie => (
          <li
            key={movie.id}  // 使用电影ID作为key
            className="movie-item"
            onClick={() => handleMovieClick(movie.id)} // 绑定点击事件
          >
            <img
              src={getImageUrl(movie.image)}  // 获取电影海报URL
              alt={movie.hwt_title}  // 电影标题作为替代文本
              className="movie-poster"
              onError={(e) => {
                console.error('图片加载失败:', movie.hwt_title);  // 图片加载失败日志
                e.target.src = '/img/10.jpg';  // 加载失败时显示备用图片
              }}
            />
            <div className="movie-info">
              <h3>{movie.hwt_title}</h3>  {/* 电影标题 */}
              <p>年份: {movie.year}</p>  {/* 上映年份 */}
              {/* 显示电影热度 */}
              <p>热度: {movie.hotness ? movie.hotness.toFixed(4) : 'N/A'}</p>
              {/* 可在此添加更多电影信息 */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PopularMovieList;