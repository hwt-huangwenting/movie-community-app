import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import '../styles/Header.css';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 根据 AuthContext 的 user 状态更新 Header 的显示
    if (user) {
      setIsLoggedIn(true);
      setUsername(user.username); // 假设 user 对象中有 username 属性
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  }, [user]); // 当 AuthContext 的 user 状态变化时更新

  const handleLogout = () => {
    logout(); 
    navigate('/');
  };

  return (
    <header className="header">
      <h1>电影展示网</h1>
      <nav>
        <ul>
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>首页</Link></li>
          <li><Link to="/category" className={location.pathname === '/category' ? 'active' : ''}>分类</Link></li>
          <li><Link to="/popular" className={location.pathname === '/popular' ? 'active' : ''}>热门电影</Link></li>
          <li><Link to="/upload" className={location.pathname === '/upload' ? 'active' : ''}>上传电影</Link></li>
          {isLoggedIn ? (
            <>
              <li><Link to="/my-collections" className={location.pathname === '/my-collections' ? 'active' : ''}>我的收藏</Link></li>
              <li><span className="username">欢迎, {username}</span></li>
              <li><button onClick={handleLogout} className="logout-button">退出</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>登录</Link></li>
              <li><Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>注册</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;