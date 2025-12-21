import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import '../App.css';

const ConservationTracker = () => {
  const { user, addNotification } = useAuth();
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExhibit, setSelectedExhibit] = useState(null);
  const [conservationNotes, setConservationNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Загружаем экспонаты
  useEffect(() => {
    loadExhibits();
  }, []);

  const loadExhibits = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bits');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setExhibits(data.bits || []);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки экспонатов:', error);
      addNotification('Ошибка загрузки экспонатов', 'error');
    } finally {
      setLoading(false);
    }
  };
const handleUpdateConservation = async (exhibitId, newState) => {
  if (!user || user.role !== 'admin') {
    addNotification('Только администраторы могут обновлять состояние сохранности', 'error');
    return;
  }

  setUpdating(true);
  try {
    console.log('🔄 Обновление сохранности для экспоната:', exhibitId, 'новый статус:', newState);
    
    const response = await fetch(`http://localhost:5000/api/bits/${exhibitId}/conservation`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({
        conservationState: newState,
        notes: conservationNotes || `Статус изменен на "${newState}"`
      })
    });

    console.log('📡 Ответ сервера:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Данные ответа:', data);
    
    if (data.success) {
      addNotification(`Статус сохранности обновлен на "${newState}"`, 'success');
      setConservationNotes('');
      
      // Обновляем локальное состояние без полной перезагрузки
      setExhibits(prevExhibits => 
        prevExhibits.map(exhibit => 
          exhibit._id === exhibitId 
            ? { ...exhibit, conservationState: newState }
            : exhibit
        )
      );
    } else {
      addNotification(data.message || 'Ошибка обновления', 'error');
    }
  } catch (error) {
    console.error('❌ Ошибка обновления:', error);
    addNotification(`Ошибка при обновлении статуса сохранности: ${error.message}`, 'error');
  } finally {
    setUpdating(false);
  }
};

  const conservationStates = {
    'Отличное': { color: '#4CAF50', emoji: '✅' },
    'Хорошее': { color: '#8BC34A', emoji: '👍' },
    'Удовлетворительное': { color: '#FFC107', emoji: '⚠️' },
    'Плохое': { color: '#F44336', emoji: '🔴' }
  };

  const getPriority = (state) => {
    switch(state) {
      case 'Плохое': return 1;
      case 'Удовлетворительное': return 2;
      case 'Хорошее': return 3;
      case 'Отличное': return 4;
      default: return 0;
    }
  };

  // Сортируем по приоритету (сначала те, что требуют внимания)
  const sortedExhibits = [...exhibits].sort((a, b) => 
    getPriority(a.conservationState) - getPriority(b.conservationState)
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка данных сохранности...</p>
      </div>
    );
  }

  return (
    <div className="conservation-tracker">
      <div className="conservation-header">
        <h1>🛡️ Отслеживание сохранности экспонатов</h1>
        <p>Мониторинг состояния и реставрационных работ</p>
        
        {user && user.role === 'admin' ? (
          <div className="admin-status">
            👑 Вы вошли как администратор. Вы можете обновлять статусы сохранности.
          </div>
        ) : (
          <div className="user-status">
            👤 Вы вошли как посетитель. Только просмотр.
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="conservation-stats">
        <div className="stat-card">
          <div className="stat-value">{exhibits.length}</div>
          <div className="stat-label">Всего экспонатов</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">
            {exhibits.filter(e => e.conservationState === 'Отличное').length}
          </div>
          <div className="stat-label">Отличное состояние</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">
            {exhibits.filter(e => e.conservationState === 'Хорошее').length}
          </div>
          <div className="stat-label">Хорошее состояние</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">
            {exhibits.filter(e => e.conservationState === 'Удовлетворительное').length}
          </div>
          <div className="stat-label">Требует внимания</div>
        </div>
        
        <div className="stat-card alert">
          <div className="stat-value">
            {exhibits.filter(e => e.conservationState === 'Плохое').length}
          </div>
          <div className="stat-label">Срочная реставрация</div>
        </div>
      </div>

      {/* Форма для заметок (только админ) */}
      {user && user.role === 'admin' && (
        <div className="conservation-notes">
          <h3>📝 Заметки по сохранности</h3>
          <textarea
            value={conservationNotes}
            onChange={(e) => setConservationNotes(e.target.value)}
            placeholder="Введите заметки о состоянии экспоната..."
            rows="3"
          />
        </div>
      )}

      {/* Таблица экспонатов */}
      <div className="conservation-table">
        <h2>📊 Состояние экспонатов</h2>
        
        <table>
          <thead>
            <tr>
              <th>Экспонат</th>
              <th>Категория</th>
              <th>Текущее состояние</th>
              <th>Статус</th>
              <th>Последнее обновление</th>
              {user && user.role === 'admin' && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {sortedExhibits.map((exhibit) => {
              const state = conservationStates[exhibit.conservationState] || { color: '#757575', emoji: '❓' };
              
              return (
                <tr key={exhibit._id}>
                  <td>
                    <div className="exhibit-info">
                      <strong>{exhibit.name}</strong>
                      <small>{exhibit.year} г.</small>
                    </div>
                  </td>
                  <td>{exhibit.category}</td>
                  <td>
                    <span 
                      className="state-badge"
                      style={{ backgroundColor: state.color }}
                    >
                      {state.emoji} {exhibit.conservationState}
                    </span>
                  </td>
                  <td>{exhibit.status}</td>
                  <td>
                    {exhibit.createdAtLocal ? 
                      new Date(exhibit.createdAtLocal).toLocaleDateString('ru-RU') : 
                      'Не указано'
                    }
                  </td>
                  
                  {user && user.role === 'admin' && (
                    <td>
                      <div className="action-buttons">
                        <select
                          value={exhibit.conservationState}
                          onChange={(e) => handleUpdateConservation(exhibit._id, e.target.value)}
                          disabled={updating}
                          className="state-select"
                        >
                          <option value="Отличное">Отличное</option>
                          <option value="Хорошее">Хорошее</option>
                          <option value="Удовлетворительное">Удовлетворительное</option>
                          <option value="Плохое">Плохое</option>
                        </select>
                        
                        <button
                          onClick={() => setSelectedExhibit(exhibit)}
                          className="btn-details"
                        >
                          ℹ️ Подробности
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Легенда */}
      <div className="conservation-legend">
        <h3>🎨 Легенда состояний</h3>
        <div className="legend-items">
          {Object.entries(conservationStates).map(([state, { color, emoji }]) => (
            <div key={state} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }}></span>
              <span className="legend-emoji">{emoji}</span>
              <span className="legend-text">{state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Детали выбранного экспоната */}
      {selectedExhibit && (
        <div className="exhibit-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedExhibit.name}</h3>
              <button 
                onClick={() => setSelectedExhibit(null)}
                className="close-btn"
              >
                ✖️
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <strong>Описание:</strong>
                <p>{selectedExhibit.description || 'Нет описания'}</p>
              </div>
              
              <div className="detail-row">
                <strong>Материалы:</strong>
                <p>{selectedExhibit.materials?.join(', ') || 'Не указаны'}</p>
              </div>
              
              <div className="detail-row">
                <strong>Размеры:</strong>
                <p>
                  {selectedExhibit.dimensions?.height ? 
                    `${selectedExhibit.dimensions.height} × ${selectedExhibit.dimensions.width} × ${selectedExhibit.dimensions.depth} см` : 
                    'Не указаны'}
                </p>
              </div>
              
              <div className="detail-row">
                <strong>Местоположение:</strong>
                <p>
                  {selectedExhibit.location?.hall ? 
                    `Зал: ${selectedExhibit.location.hall}, Комната: ${selectedExhibit.location.room}, Этаж: ${selectedExhibit.location.floor}` : 
                    'Не указано'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConservationTracker;