import React, { useState, useEffect, useReducer, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './components/AuthContext';
import './App.css';

import Navigation from './components/Navigation';
import ExhibitCatalog from './components/ExhibitCatalog';
import ExhibitDetail from './components/ExhibitDetail';
import ExhibitForm from './components/ExhibitForm';
import ExhibitScanner from './components/ExhibitScanner';
import TourPlanner from './components/TourPlanner';
import ConservationTracker from './components/ConservationTracker';
import ExhibitAnalytics from './components/ExhibitAnalytics';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TimeDisplay from './components/TimeDisplay';
import Contacts from './components/Contacts';

const museumReducer = (state, action) => {
  switch (action.type) {
    case 'SET_EXHIBITS':
      console.log('DISPATCH: Установка экспонатов', action.payload.length);
      return { ...state, exhibits: action.payload };
    case 'ADD_EXHIBIT':
      return { ...state, exhibits: [...state.exhibits, action.payload] };
    case 'UPDATE_EXHIBIT':
      return {
        ...state,
        exhibits: state.exhibits.map(e => 
          e._id === action.payload._id ? action.payload : e
        )
      };
    case 'DELETE_EXHIBIT':
      return {
        ...state,
        exhibits: state.exhibits.filter(e => e._id !== action.payload)
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.field, sortOrder: action.payload.order };
    default:
      return state;
  }
};

function MainApp() {
  const { user, notifications, addNotification } = useAuth();
  const [museumState, dispatch] = useReducer(museumReducer, {
    exhibits: [],
    filter: 'all',
    searchQuery: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const searchInputRef = useRef(null);
  const isMounted = useRef(false);

  // Функция загрузки экспонатов с защитой от повторных вызовов
  const loadExhibits = useCallback(async (force = false) => {
    // Защита от слишком частых вызовов (не чаще 1 раза в 5 секунд)
    const now = Date.now();
    if (!force && now - lastLoadTime < 5000 && museumState.exhibits.length > 0) {
      console.log('⏰ Слишком частый вызов loadExhibits, пропускаю');
      return;
    }
    
    if (isLoading) {
      console.log('⏳ Загрузка уже выполняется, пропускаю');
      return;
    }
    
    console.log('🔄 Начинаю загрузку экспонатов...');
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken') || 'demo-token';
      
      console.log('📡 Отправка запроса на сервер...');
      const response = await fetch('http://localhost:5000/api/bits', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Ответ получен, статус:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Данные получены:', {
          success: data.success,
          count: data.bits?.length,
          message: data.message
        });
        
        if (data.success && isMounted.current) {
          dispatch({ type: 'SET_EXHIBITS', payload: data.bits || [] });
          setLastLoadTime(Date.now());
          
          // Показываем уведомление только если это не начальная загрузка
          if (museumState.exhibits.length > 0 || force) {
            addNotification(`Загружено ${data.bits?.length || 0} экспонатов`, 'success');
          }
        } else {
          console.error('Ошибка в данных:', data.message);
        }
      } else {
        console.error('❌ Ошибка сервера:', response.status);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки экспонатов:', error);
      if (isMounted.current) {
        addNotification('Ошибка сети при загрузке экспонатов', 'error');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        console.log('🏁 Загрузка экспонатов завершена');
      }
    }
  }, [isLoading, lastLoadTime, museumState.exhibits.length, addNotification]);

  // Загрузка экспонатов при монтировании - ТОЛЬКО ОДИН РАЗ
  useEffect(() => {
    isMounted.current = true;
    
    const initialize = async () => {
      console.log('🚀 Первоначальная загрузка экспонатов');
      await loadExhibits(true);
    };
    
    initialize();
    
    return () => {
      isMounted.current = false;
    };
  }, []); // Пустой массив зависимостей - выполняется ТОЛЬКО при монтировании

  // Обновление при изменении пользователя - ТОЛЬКО если пользователь изменился
  useEffect(() => {
    if (!isMounted.current || !user) return;
    
    console.log('👤 Пользователь изменился, обновляю экспонаты');
    const timer = setTimeout(() => {
      loadExhibits(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user?.token]); // Только при изменении токена пользователя

  // Обработчики событий
  const handleExhibitClick = useCallback((exhibit) => {
    console.log('Экспонат кликнут:', exhibit.name);
    addNotification(`Открыт экспонат: ${exhibit.name}`, 'info');
  }, [addNotification]);

  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH', payload: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Поиск:', museumState.searchQuery);
    addNotification(`Поиск: ${museumState.searchQuery}`, 'info');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && searchInputRef.current) {
      searchInputRef.current.blur();
      dispatch({ type: 'SET_SEARCH', payload: '' });
    }
    
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  // Функция для ручного обновления
  const handleManualRefresh = () => {
    console.log('🔄 Ручное обновление экспонатов');
    loadExhibits(true);
  };

  return (
    <div className="app" onKeyDown={handleKeyDown} tabIndex="0">
      {/* Отладочная информация */}
      <div style={{
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '250px'
      }}>
       
      </div>
      
      <Navigation 
        user={user} 
        onSearchSubmit={handleSearchSubmit}
        searchInputRef={searchInputRef}
        onSearchChange={handleSearchChange}
        searchQuery={museumState.searchQuery}
      />
      
      {/* Отображение времени */}
      <TimeDisplay />
      
      {/* Уведомления */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification notification-${notification.type}`}
            onClick={() => console.log('Уведомление закрыто')}
          >
            {notification.message}
          </div>
        ))}
      </div>
      
      <main className="main-content">
        {isLoading && museumState.exhibits.length === 0 ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка экспонатов...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
               <ExhibitCatalog 
                exhibits={museumState.exhibits}
                onExhibitClick={handleExhibitClick}
                searchQuery={museumState.searchQuery}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                isLoading={isLoading}
                onRefresh={handleManualRefresh}
              />
            } />
            <Route path="/exhibits" element={
              <ExhibitCatalog 
                exhibits={museumState.exhibits}
                onExhibitClick={handleExhibitClick}
                searchQuery={museumState.searchQuery}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                isLoading={isLoading}
                onRefresh={handleManualRefresh}
              />
            } />
            <Route path="/exhibits/:id" element={<ExhibitDetail />} />
            <Route path="/exhibits/new" element={<ProtectedRoute><ExhibitForm /></ProtectedRoute>} />
            <Route path="/exhibits/:id/edit" element={<ProtectedRoute><ExhibitForm mode="edit" /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><ExhibitScanner /></ProtectedRoute>} />
            <Route path="/tours" element={<ProtectedRoute><TourPlanner /></ProtectedRoute>} />
            <Route path="/conservation" element={<ProtectedRoute><ConservationTracker /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><ExhibitAnalytics /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        )}
      </main>
      
      <footer className="footer">
        <button 
          onClick={handleManualRefresh} 
          className="refresh-btn"
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px',
            opacity: isLoading ? 0.5 : 1
          }}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Загрузка...' : '🔄 Обновить экспонаты'}
        </button>
       
      </footer>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "demo-client-id"}>
      <AuthProvider>
        <Router>
          <MainApp />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;