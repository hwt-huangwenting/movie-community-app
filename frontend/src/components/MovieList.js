import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/urlUtils'; // 导入共享的工具函数
import '../styles/MovieList.css';
import api from '../utils/api'; // Import the new api service
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

function MovieList({ movies }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Get user and auth status from AuthContext

  console.log('MovieList - user:', user, 'isAuthenticated:', isAuthenticated); // 添加这行日志

  const [collectedMovieIds, setCollectedMovieIds] = useState([]);

  // Fetch user's collected movies on component mount or when user changes
  useEffect(() => {
    const fetchCollections = async () => {
      if (!isAuthenticated || !user || !user.id) {
        setCollectedMovieIds([]);
        return;
      }
      try {
        // Use the api service
        const response = await api.get(`/collections/${user.id}`);
        // Assuming the backend returns an array of movie objects, extract their IDs
        const ids = response.data.map(movie => movie.id);
        setCollectedMovieIds(ids);
      } catch (error) {
        console.error('Error fetching user collections:', error);
        // The interceptor in api.js will handle 401/403
      }
    };

    fetchCollections();

  }, [isAuthenticated, user]); // Re-run effect if auth status or user changes

  if (!movies || movies.length === 0) {
    return <div className="no-movies">暂无电影数据</div>;
  }

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleCollectClick = async (movie, event) => {
    event.stopPropagation();

    if (!isAuthenticated || !user || !user.id) {
      alert('请先登录以收藏电影');
      return;
    }

    try {
      // Use the api service
      await api.post('/collections', { movie_id: movie.id });
      alert('收藏成功!');
      setCollectedMovieIds(prevIds => [...prevIds, movie.id]);
    } catch (error) {
      console.error('收藏失败:', error);
      if (error.response && error.response.status === 409) {
        alert('电影已在收藏中');
      } else {
        alert('收藏失败，请稍后再试');
      }
    }
  };

  const handleUncollectClick = async (movie, event) => {
    event.stopPropagation();

    if (!isAuthenticated || !user || !user.id) {
      alert('请先登录以取消收藏');
      return;
    }

    try {
      // Use the api service
      await api.delete(`/collections/${movie.id}`); // No need for data: { user_id: user.id } in delete body
      alert('取消收藏成功!');
      setCollectedMovieIds(prevIds => prevIds.filter(id => id !== movie.id));
    } catch (error) {
      console.error('取消收藏失败:', error);
      if (error.response && error.response.status === 404) {
        alert('电影未在收藏中');
      } else {
        alert('取消收藏失败，请稍后再试');
      }
    }
  };

  return (
    <div className="movie-container">
      <div className="movie-list">
        {movies.map(movie => {
          // Check if collected only if user is authenticated and user object is available
          const isCollected = isAuthenticated && user && collectedMovieIds.includes(movie.id);
          return (
          <div 
            key={movie.id} 
            className="movie-card" 
            onClick={() => handleMovieClick(movie.id)}
          >
            <img 
              src={getImageUrl(movie.image)} 
              alt={movie.hwt_title} 
              className="movie-poster"
              onError={(e) => {
                console.error('Image load error for:', movie.hwt_title);
                e.target.src = '/img/10.jpg';
              }}
            />
            <div className="movie-info">
              <h3 className="movie-title">{movie.hwt_title}</h3>
              <p className="movie-meta">类型: {movie.type}</p>
              <p className="movie-meta">评分: <span className="movie-rating">{movie.rating}</span></p>
              <p className="movie-meta">年份: {movie.year}</p>
                {/* Add Collection Button - only show if authenticated */}
                {isAuthenticated && (
                  <button 
                    onClick={(event) => isCollected ? handleUncollectClick(movie, event) : handleCollectClick(movie, event)}
                    className={`collect-button ${isCollected ? 'collected' : ''}`}
                  >
                    {isCollected ? '已收藏' : '收藏'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MovieList;




