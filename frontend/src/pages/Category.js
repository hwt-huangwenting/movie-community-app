import React, { useState, useEffect } from 'react';
import MovieList from '../components/MovieList';
import '../styles/Category.css';
import api from '../utils/api';

const types = [
  '全部', '古装', '爱情', '战争', '动作', '喜剧', '悬疑', '犯罪', '家庭', '都市', '偶像', '警剧', '青春', '自制', '科幻', '农村', '穿越', '动画', '历史', '短剧', '生活', '剧情'
];
const regions = ['全部', '内地', '中国香港', '中国台湾', '美国', '日本', '英国', '其他'];
const years = [
  '全部',
  '2025', '2024', '2023', '2022', '2021', '2020',
  '2010年代', '2000年代', '1990年代', '1980年代', '1970年代', '1960年代', '1950年代', '1950年以前'
];

function Category() {
  const [selectedType, setSelectedType] = useState('全部');
  const [selectedRegion, setSelectedRegion] = useState('全部');
  const [selectedYear, setSelectedYear] = useState('全部');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMovies = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedType !== '全部') params.append('type', selectedType);
    if (selectedRegion !== '全部') params.append('region', selectedRegion);
    if (selectedYear !== '全部') params.append('year', selectedYear);
    params.append('limit', 100);
    try {
      const res = await api.get(`/movies/search?${params.toString()}`);
      const data = res.data;
      setMovies(data.movies || []);
    } catch (e) {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line
  }, [selectedType, selectedRegion, selectedYear]);

  return (
    <div className="category-page">
      <h1>分类筛选</h1>
      <div className="category-bar">
        <div className="category-group">
          <span className="category-label">类型：</span>
          {types.map(type => (
            <button
              key={type}
              className={type === selectedType ? 'active' : ''}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="category-group">
          <span className="category-label">地区：</span>
          {regions.map(region => (
            <button
              key={region}
              className={region === selectedRegion ? 'active' : ''}
              onClick={() => setSelectedRegion(region)}
              // 仅UI高亮，不参与筛选
            >
              {region}
            </button>
          ))}
        </div>
        <div className="category-group">
          <span className="category-label">年代：</span>
          {years.map(year => (
            <button
              key={year}
              className={year === selectedYear ? 'active' : ''}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
      {loading ? <div className="loading">加载中...</div> : <MovieList movies={movies} />}
    </div>
  );
}

export default Category; 