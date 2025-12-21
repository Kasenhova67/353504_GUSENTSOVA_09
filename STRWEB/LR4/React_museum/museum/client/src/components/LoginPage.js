// components/LoginPage.js - ИСПОЛЬЗУЕМ новый компонент
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import GoogleSignIn from './GoogleSignIn'; // ИМПОРТИРУЕМ новый компонент

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Ошибка входа');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>🔐 Вход в систему</h2>
          <p>Введите ваши учетные данные</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">👤 Имя пользователя</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔑 Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="auth-divider">
          <span>или</span>
        </div>

        <GoogleSignIn />

        <div className="auth-footer">
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
          </p>
          <div className="demo-credentials">
            <h4>👨‍💻 Демо доступ:</h4>
            <p><strong>Логин:</strong> admin</p>
            <p><strong>Пароль:</strong> admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;