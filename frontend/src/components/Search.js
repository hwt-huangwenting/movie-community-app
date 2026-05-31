import React, { useState, useEffect, useRef } from 'react';
import '../styles/Search.css';
import debounce from 'lodash/debounce'; // 引入防抖函数

function Search({ onSearch, searchHistory }) {
  const [query, setQuery] = useState(''); // 搜索关键词状态
  const [showHistory, setShowHistory] = useState(false); // 是否显示搜索历史

  const DEBOUNCE_DELAY = 500; // 防抖延迟时间(毫秒)

  // 使用ref存储防抖函数
  const debouncedSearchRef = useRef(null);

  useEffect(() => {
    // 初始化防抖搜索函数并存储在ref中
    debouncedSearchRef.current = debounce((searchQuery) => {
      if (searchQuery.trim()) {
        onSearch({ query: searchQuery.trim() }); // 执行搜索
      }
    }, DEBOUNCE_DELAY);

    // 组件卸载时取消防抖函数
    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, [onSearch]); // 依赖onSearch

  // 输入框变化处理
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // 防抖函数已初始化时才触发
    if (debouncedSearchRef.current) {
       if (value.trim()) {
         debouncedSearchRef.current(value); // 执行防抖搜索
       } else {
         debouncedSearchRef.current.cancel(); // 输入为空时取消待执行搜索
       }
    }
  };

  // 手动提交搜索
  const handleSearch = (e) => {
    e.preventDefault();
    // 取消待执行的防抖搜索
    if (debouncedSearchRef.current) {
       debouncedSearchRef.current.cancel();
    }
    if (!query.trim()) return;
    onSearch({ query: query.trim() }); // 执行搜索
    setShowHistory(false); // 搜索后隐藏历史记录
  };

  // 点击历史记录项处理
  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current.cancel();
    }
    onSearch({ query: historyItem });
    setShowHistory(false);
  };

  // 输入框获取焦点处理
  const handleInputFocus = () => {
    // 有历史记录且输入框获取焦点时显示
    if (searchHistory && searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  // 输入框失去焦点处理
  const handleInputBlur = () => {
    // 延迟隐藏以便可以点击历史记录项
    setTimeout(() => {
      setShowHistory(false);
    }, 100);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="搜索电影..."
          className="search-input"
        />
        <button type="submit" className="search-button">搜索</button>
      </form>
      {/* 根据条件渲染搜索历史下拉框 */}
      {showHistory && searchHistory && searchHistory.length > 0 && (
        <ul className="search-history-dropdown">
          {searchHistory.map((item, index) => (
            <li key={index} onMouseDown={() => handleHistoryClick(item)}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Search;