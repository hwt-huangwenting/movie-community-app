import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Comments from '../components/Comments';
import { getImageUrl, getVideoUrl } from '../utils/urlUtils'; // 导入共享的工具函数
import '../styles/MovieDetail.css';

// 内联 MoviePoster 组件
const MoviePoster = ({ image, title }) => (
  <div className="movie-poster">
    <img src={image} alt={title} onError={e => {e.target.src='/img/10.jpg'}} />
  </div>
);

// 内联 MovieTitle 组件
const MovieTitle = ({ title }) => (
  <h1 className="movie-title">{title}</h1>
);

// 内联 MovieInfo 组件
const MovieInfo = ({ type, year, rating, region }) => (
  <div className="movie-info">
    <p><strong>类型：</strong>{type}</p>
    <p><strong>年份：</strong>{year}</p>
    <p><strong>评分：</strong>{rating}</p>
    <p><strong>地区：</strong>{region}</p>
  </div>
);

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/movies/${id}`);
        setMovie(response.data);
        setLoading(false);
      } catch (err) {
        setError('获取电影详情失败');
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>{error}</div>;
  if (!movie) return <div>未找到电影</div>;

  return (
    <div className="movie-detail">
      <div className="movie-header" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div className="movie-left">
          <MoviePoster image={getImageUrl(movie.image)} title={movie.hwt_title} />
          <Comments movieId={id} />
        </div>
        <div style={{ flex: 1 }}>
          <MovieTitle title={movie.hwt_title} />
          <MovieInfo type={movie.type} year={movie.year} rating={movie.rating} region={movie.region} />
          {movie.description && (
            <div className="movie-description">
              <h3>简介</h3>
              <p>{movie.description}</p>
            </div>
          )}
        </div>
      </div>
      {movie.video_url && (
        <div className="movie-video">
          <h3>精彩片段</h3>
          <video controls width="100%">
            <source src={getVideoUrl(movie.video_url)} type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
        </div>
      )}
    </div>
  );
};

export default MovieDetail; 