import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const Navigation = ({ 
  user, 
  onSearchSubmit, 
  searchInputRef, 
  onSearchChange, 
  searchQuery 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setIsMenuOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navigation">
      <div className="nav-container">
      
        <div className="nav-brand">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">Цифровой Музей</span>
          </Link>
        </div>

        <button 
          className="menu-toggle" 
          onClick={toggleMenu}
          aria-label="Открыть меню"
        >
          <span className="menu-icon">☰</span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
                   
          <Link 
            to="/exhibits" 
            className={`nav-link ${location.pathname.startsWith('/exhibits') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            🖼️ Экспонаты
          </Link>
          
          {user && (
            <>
              <Link 
                to="/scanner" 
                className={`nav-link ${location.pathname === '/scanner' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                📱 Сканер
              </Link>
              
              <Link 
                to="/tours" 
                className={`nav-link ${location.pathname === '/tours' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                🗺️ Экскурсии
              </Link>
              
              <Link 
                to="/analytics" 
                className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                📊 Аналитика
              </Link>
              
              {user.role === 'admin' && (
                <Link 
                  to="/conservation" 
                  className={`nav-link ${location.pathname === '/conservation' ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  🛡️ Консервация
                </Link>
              )}
            </>
          )}
          
          <Link 
            to="/contacts" 
            className={`nav-link ${location.pathname === '/contacts' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            📞 Контакты
          </Link>
        </div>
       
        <div className="user-section">
          {user ? (
            <div className="user-info">
              <div className="user-avatar">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="username">{user.username}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <div className="user-actions">
                <button onClick={handleLogout} className="logout-button">
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button login-button">
                Войти
              </Link>
              <Link to="/register" className="auth-button register-button">
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;