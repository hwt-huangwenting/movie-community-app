import React, { useState, useEffect, useCallback } from 'react';
import MovieList from '../components/MovieList';
import Search from '../components/Search';
import '../styles/Pagination.css';
import { useAuth } from '../auth/AuthContext';
import api from '../utils/api';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 4,
    totalPages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [noResults, setNoResults] = useState(false);
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [searchHistory, setSearchHistory] = useState([]);

  const HISTORY_STORAGE_KEY = 'search_history';
  const HISTORY_LIMIT = 5;

  console.log('Home - user:', user, 'isAuthenticated:', isAuthenticated, 'authLoading:', authLoading);

  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  function saveHistory(newQuery) {
    if (!newQuery.trim()) return;
    const updatedHistory = [newQuery.trim(), ...searchHistory.filter(item => item !== newQuery.trim())];
    const limitedHistory = updatedHistory.slice(0, HISTORY_LIMIT);
    setSearchHistory(limitedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSearchResults = useCallback(async (page) => {
    setLoading(true);
    setNoResults(false);
    let response;
    try {
      response = await api.get(`/movies/search?query=${encodeURIComponent(searchQuery)}&page=${page}&limit=4`);
      const data = response.data;
      setMovies(data.movies || []);
      if (!data.movies || data.movies.length === 0) {
        setNoResults(true);
      }
      setPagination({
        total: data.totalMovies,
        page: data.currentPage,
        limit: 4,
        totalPages: data.totalPages
      });
    } catch (error) {
      setNoResults(true);
      setMovies([]);
    } finally {
      setLoading(false);
    }
    return response;
  }, [searchQuery]);

  const fetchMovies = useCallback(async (page) => {
    setLoading(true);
    setNoResults(false);
    let response;
    try {
      response = await api.get(`/movies?page=${page}&limit=4`);
      const data = response.data;
      setMovies(data.movies || []);
      if (!data.movies || data.movies.length === 0) {
        setNoResults(true);
      }
      setPagination(data.pagination);
    } catch (error) {
      setNoResults(true);
      setMovies([]);
    } finally {
      setLoading(false);
    }
    return response;
  }, [searchQuery]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!authLoading) {
        try {
          if (searchQuery) {
            await fetchSearchResults(currentPage);
            if (isMounted) {
              saveHistory(searchQuery);
            }
          } else {
            await fetchMovies(currentPage);
          }
        } catch (error) {
          // 错误已在 fetch 函数中处理
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [currentPage, searchQuery, authLoading, fetchSearchResults, fetchMovies]);

  const handleSearch = (data) => {
    if (data.query === searchQuery) {
      setSearchQuery('');
      setTimeout(() => setSearchQuery(data.query), 0);
    } else {
      setSearchQuery(data.query);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (authLoading) return <div className="loading">认证状态加载中...</div>;

  return (
    <div>
      <h1>电影列表</h1>
      <Search onSearch={handleSearch} searchHistory={searchHistory} />

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        noResults ? (
          <div className="no-results-wrapper">
            <div className="no-results">
              {searchQuery
                ? (<><span style={{color:'#e74c3c', fontWeight:'bold'}}>没有找到与</span> <span style={{color:'#e67e22', fontWeight:'bold'}}>&quot;{searchQuery}&quot;</span> <span style={{color:'#e74c3c', fontWeight:'bold'}}>相关的电影</span></>)
                : <span style={{color:'#e74c3c', fontWeight:'bold'}}>暂无电影数据</span>}
            </div>
          </div>
        ) : (
          <>
            <MovieList movies={movies} />
            {movies.length > 0 && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  上一页
                </button>
                <span>第 {currentPage} 页，共 {pagination.totalPages} 页</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

export default Home;
