import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import '../App.css';

const ExhibitCatalog = ({ 
  exhibits, 
  onExhibitClick,
  searchQuery,
  onSearchChange,
  onSearchSubmit 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filteredExhibits, setFilteredExhibits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    console.log('🔄 Фильтрация экспонатов:', {
      всего: exhibits.length,
      поиск: searchQuery,
      категория: selectedCategory
    });

    let result = exhibits;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(exhibit =>
        exhibit.name?.toLowerCase().includes(query) ||
        exhibit.description?.toLowerCase().includes(query) ||
        exhibit.category?.toLowerCase().includes(query)
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter(exhibit => exhibit.category === selectedCategory);
    }
    console.log('✅ После фильтрации осталось:', result.length);
    setFilteredExhibits(result);
  }, [exhibits, searchQuery, selectedCategory]);

  const categories = ['all', ...new Set(exhibits.map(e => e.category).filter(Boolean))];

  const handleAddExhibit = () => {
    if (!user) {
      alert('Для добавления экспоната необходимо войти в систему');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      alert('Только администраторы могут добавлять новые экспонаты');
      return;
    }
    
    navigate('/exhibits/new');
  };
  if (exhibits.length === 0) {
    return (
      <div className="exhibit-catalog">
        <div className="catalog-header">
          <h1>🎨 Каталог экспонатов</h1>
          <p>Здесь будут отображаться все экспонаты музея</p>
        </div>
        <div className="no-exhibits">
          <div className="empty-state">
            <h2>📭 Нет экспонатов</h2>
            <p>Экспонаты еще не загружены или их нет в базе данных</p>
            <div className="empty-state-actions">
              <button 
                onClick={handleAddExhibit}
                className="btn btn-primary"
                disabled={user && user.role !== 'admin'}
                title={user && user.role !== 'admin' ? 'Только для администраторов' : ''}
              >
                + Добавить первый экспонат
                {user && user.role !== 'admin' && ' (только админ)'}
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-secondary"
              >
                🔄 Обновить
              </button>
            </div>
            <div className="debug-info">
              <h4>Информация для отладки:</h4>
              <ul>
                <li>Проверьте консоль браузера (F12 → Console)</li>
                <li>Убедитесь, что сервер запущен на порту 5000</li>
                <li>Проверьте соединение с MongoDB</li>
                <li>Попробуйте заполнить БД: POST /api/seed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exhibit-catalog">
      <div className="catalog-header">
        <h1>🎨 Каталог экспонатов</h1>
        <p className="catalog-subtitle">
          Всего экспонатов: <strong>{exhibits.length}</strong> | 
          Показано: <strong>{filteredExhibits.length}</strong>
          {user && user.role === 'admin' && (
            <span className="admin-badge"> 👑 Админ-режим</span>
          )}
        </p>
        
        {/* Поиск и фильтры */}
        <div className="catalog-controls">
          <form onSubmit={onSearchSubmit} className="nav-search">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Поиск экспонатов..."
              value={searchQuery}
              onChange={onSearchChange}
              className="search-input"
              aria-label="Поиск экспонатов"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </div>
        </form>
          
          <div className="category-filters">
            <label>Фильтр по категории:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Все категории' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Сетка экспонатов */}
      <div className="exhibits-grid">
        {filteredExhibits.length === 0 ? (
          <div className="no-results">
            <h3>😞 Ничего не найдено</h3>
            <p>Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
            <button 
              onClick={() => {
                onSearchChange({ target: { value: '' } });
                setSelectedCategory('all');
              }}
              className="btn btn-secondary"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          filteredExhibits.map((exhibit) => (
            <div 
              key={exhibit._id} 
              className="exhibit-card"
              onClick={() => onExhibitClick(exhibit)}
            >
              <div className="exhibit-image">
                <img 
                  src={exhibit.imageUrl || 'https://via.placeholder.com/300x200?text=Музейный+экспонат'} 
                  alt={exhibit.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Изображение+не+загружено';
                  }}
                />
                <div className="exhibit-category">
                  {exhibit.category || 'Без категории'}
                </div>
                {/* Индикатор для админа */}
                {user && user.role === 'admin' && (
                  <div className="admin-actions-overlay">
                    <Link 
                      to={`/exhibits/${exhibit._id}/edit`}
                      className="admin-edit-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ✏️
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="exhibit-info">
                <h3 className="exhibit-title">{exhibit.name || 'Без названия'}</h3>
                <p className="exhibit-description">
                  {exhibit.description ? 
                    (exhibit.description.length > 100 
                      ? `${exhibit.description.substring(0, 100)}...` 
                      : exhibit.description)
                    : 'Описание отсутствует'
                  }
                </p>
                
                <div className="exhibit-meta">
                  <div className="meta-item">
                    <span className="meta-label">Год:</span>
                    <span className="meta-value">{exhibit.year || 'не указан'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Состояние:</span>
                    <span className={`meta-value status-${exhibit.conservationState?.toLowerCase() || 'unknown'}`}>
                      {exhibit.conservationState || 'не указано'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Статус:</span>
                    <span className="meta-value">{exhibit.status || 'не указан'}</span>
                  </div>
                </div>
                
                <div className="exhibit-actions">
                  <Link 
                    to={`/exhibits/${exhibit._id}`} 
                    className="btn btn-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Подробнее
                  </Link>
                  <span className="exhibit-id">
                    ID: {exhibit._id?.substring(0, 8) || 'unknown'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Статистика и кнопка добавления */}
      <div className="catalog-footer">
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Всего экспонатов:</span>
            <span className="stat-value">{exhibits.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Показано:</span>
            <span className="stat-value">{filteredExhibits.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Категорий:</span>
            <span className="stat-value">{categories.length - 1}</span>
          </div>
        </div>
        
        {/* Кнопка добавления экспоната - только для админа */}
        {user && user.role === 'admin' && (
          <div className="admin-add-section">
            <button 
              onClick={handleAddExhibit}
              className="btn btn-success add-exhibit-btn"
            >
              🏺 Добавить новый экспонат
            </button>
            <p className="admin-note">
              👑 Вы вошли как администратор. У вас есть права на редактирование и удаление экспонатов.
            </p>
          </div>
        )}
        
        {/* Для обычных пользователей */}
        {user && user.role !== 'admin' && (
          <div className="user-info-section">
            <p className="user-note">
              👤 Вы вошли как посетитель. Для добавления экспонатов обратитесь к администратору.
            </p>
          </div>
        )}
        
        {/* Для неавторизованных пользователей */}
        {!user && (
          <div className="guest-info-section">
            <p className="guest-note">
              🔐 Для доступа к дополнительным функциям 
              <Link to="/login" className="login-link"> войдите в систему</Link>
            </p>
          </div>
        )}
        
        <div className="last-updated">
          Последнее обновление: {new Date().toLocaleTimeString('ru-RU')}
        </div>
      </div>
    </div>
  );
};

export default ExhibitCatalog;