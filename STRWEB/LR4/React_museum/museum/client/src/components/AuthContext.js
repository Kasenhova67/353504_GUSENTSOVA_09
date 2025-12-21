import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('museumUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка входа');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const userData = {
          ...data.user,
          token: data.user.token
        };
        
        setUser(userData);
        localStorage.setItem('museumUser', JSON.stringify(userData));
        localStorage.setItem('authToken', data.user.token);
        
        addNotification(`Вход выполнен как ${username}`, 'success');
        return { success: true, data: userData };
      } else {
        throw new Error(data.message || 'Ошибка входа');
      }
    } catch (error) {
      addNotification('Ошибка входа: ' + error.message, 'error');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

const loginWithGoogle = async (googleUserData) => {
  try {
    console.log('👤 Авторизация Google пользователя:', googleUserData.email);
    
    setUser(googleUserData);
    
    localStorage.setItem('museumUser', JSON.stringify(googleUserData));
    localStorage.setItem('authToken', googleUserData.token);
    localStorage.setItem('tokenCreated', new Date().getTime().toString());
    
    addNotification(`Добро пожаловать, ${googleUserData.name || googleUserData.username}!`, 'success');
    
    return { success: true, data: googleUserData };
    
  } catch (error) {
    console.error('❌ Ошибка авторизации Google:', error);
    addNotification('Ошибка авторизации через Google', 'error');
    return { success: false, error: error.message };
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('museumUser');
    localStorage.removeItem('authToken');
    addNotification('Вы вышли из системы', 'info');
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка регистрации');
      }
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('museumUser', JSON.stringify(userData));
      addNotification('Регистрация успешна', 'success');
      return { success: true, data: userData };
    } catch (error) {
      addNotification('Ошибка регистрации: ' + error.message, 'error');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('museumUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
         const tokenCreated = localStorage.getItem('tokenCreated');
        const now = new Date().getTime();
        if (tokenCreated && (now - parseInt(tokenCreated)) > 7 * 24 * 60 * 60 * 1000) {         
          console.log('Токен истек, выполняется выход');
          logout();
        } else {          
          setUser(userData);
          console.log('Пользователь восстановлен из localStorage');
        }
      } catch (error) {
        console.error('Ошибка восстановления пользователя:', error);
        localStorage.removeItem('museumUser');
        localStorage.removeItem('authToken');
      }
    }
    
    setLoading(false);
    
    if (!localStorage.getItem('tokenCreated') && user) {
      localStorage.setItem('tokenCreated', new Date().getTime().toString());
    }
  }, []);

  const value = {
    user,
    loading,
    notifications,
    addNotification,
    login,
    loginWithGoogle,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;