import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { analyzeWithOllama } from '../components/ollamaService';

const ExhibitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exhibit, setExhibit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lighting, setLighting] = useState(100);
  const [notification, setNotification] = useState(null); 

  const loadExhibit = async () => {
    setLoading(true);
    setError(null);
    setNotification(null); 
    
    try {
      console.log(`Загрузка экспоната с ID: ${id}`);
      
      const response = await fetch(`http://localhost:5000/api/bits/${id}/with-employee`, {
        headers: {
          'Authorization': user?.token ? `Bearer ${user.token}` : ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Данные получены:', data);
        
        if (data.success && data.exhibit) {

          console.log('Данные сотрудника:', data.exhibit.assignedEmployee);
          
          const formattedExhibit = {
            ...data.exhibit,
            location: data.exhibit.location || { hall: '', room: '', floor: '' },
            dimensions: data.exhibit.dimensions || { height: '', width: '', depth: '' },
            materials: data.exhibit.materials || [],
            createdAtLocal: data.exhibit.createdAtLocal || new Date().toLocaleString('ru-RU'),
            createdAtUTC: data.exhibit.createdAtUTC || new Date().toUTCString(),
            updatedAtLocal: data.exhibit.updatedAtLocal || null
          };
          
          setExhibit(formattedExhibit);
        } else {
          throw new Error(data.message || 'Не удалось загрузить экспонат');
        }
      } else {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка загрузки экспоната:', error);
      setError(error.message);
      setNotification({ type: 'error', message: 'Не удалось загрузить данные экспоната' });
      
      if (process.env.NODE_ENV === 'development') {
        setExhibit({
          _id: id,
          name: "Демонстрационный экспонат",
          description: "Это демонстрационный экспонат для тестирования интерфейса.",
          category: "art",
          location: { 
            hall: "Главный зал", 
            room: "101", 
            floor: "1" 
          },
          status: "exhibited",
          conservationState: "good",
          imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&fit=crop",
          year: 2024,
          materials: ["дерево", "золото", "краски"],
          dimensions: { 
            height: 150, 
            width: 80, 
            depth: 30 
          },
          value: "Высокая художественная ценность",
          assignedEmployee: {
            _id: "1",
            name: "Иванова А.С.",
            position: "куратор",
            department: "Отдел живописи",
            email: "ivanova@museum.ru"
          },
          createdAtLocal: new Date().toLocaleString('ru-RU'),
          createdAtUTC: new Date().toUTCString(),
          updatedAtLocal: null
        });
      } else {
        setExhibit(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExhibit();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот экспонат?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/bits/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Экспонат удален' });
        setTimeout(() => navigate('/exhibits'), 1500);
      } else {
        const data = await response.json();
        setNotification({ type: 'error', message: data.message || 'Ошибка при удалении' });
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setNotification({ type: 'error', message: 'Ошибка при удалении экспоната' });
    }
  };

  const handleAiAnalysis = async (type = 'description') => {
    if (!exhibit) return;
    
    setAnalyzing(true);
    try {
      const result = await analyzeWithOllama(exhibit, type);
      setAiAnalysis(result);
    } catch (error) {
      console.error('Ошибка AI анализа:', error);
      setNotification({ type: 'error', message: 'Ошибка при анализе через Ollama' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLightingChange = (e) => {
    setLighting(e.target.value);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка экспоната...</p>
      </div>
    );
  }

  if (error && !exhibit) {
    return (
      <div className="error-container">
        <h2>❌ Ошибка</h2>
        <p>{error}</p>
        <Link to="/exhibits" className="back-link">
          ← Вернуться к каталогу
        </Link>
      </div>
    );
  }

  if (!exhibit) {
    return (
      <div className="not-found">
        <h2>Экспонат не найден</h2>
        <Link to="/exhibits">← Вернуться к каталогу</Link>
      </div>
    );
  }

  return (
    <div className="exhibit-detail">
     
      <div className="detail-header">
        <div>
          <h1>{exhibit.name}</h1>
          <div className="exhibit-meta">
            <span className="category-badge">{exhibit.category}</span>
            <span className="year-badge">{exhibit.year} г.</span>
          </div>
        </div>
        
        <div className="detail-actions">
          <Link to="/exhibits" className="back-btn">
            ← Назад
          </Link>
          
          {user && user.role === 'admin' && (
            <>
              <Link to={`/exhibits/${id}/edit`} className="edit-btn">
                ✏️ Редактировать
              </Link>
              <button onClick={handleDelete} className="delete-btn">
                🗑️ Удалить
              </button>
            </>
          )}
        
          {user && user.role !== 'admin' && (
            <span className="user-note">
              👤 Режим просмотра
            </span>
          )}
        </div>
      </div>

      <div className="detail-content">
        <div className="exhibit-media">
          <div className="image-container">
            <img 
              src={exhibit.imageUrl || 'https://via.placeholder.com/600x400/4cc9f0/ffffff?text=Экспонат'} 
              alt={exhibit.name}
              style={{ filter: `brightness(${lighting}%)` }}
            />
          </div>
          
          <div className="media-controls">
            <div className="control-group">
              <label htmlFor="lighting">💡 Освещение: {lighting}%</label>
              <input
                id="lighting"
                type="range"
                min="10"
                max="150"
                value={lighting}
                onChange={handleLightingChange}
              />
            </div>
          </div>
        </div>

        <div className="exhibit-info">
          <div className="info-section">
            <h3>📋 Описание</h3>
            <p>{exhibit.description || 'Описание отсутствует'}</p>
          </div>

          <div className="info-section">
            <h3>📍 Местоположение</h3>
            <div className="location-details">
              <p><strong>Зал:</strong> {exhibit.location?.hall || 'Не указан'}</p>
              <p><strong>Комната:</strong> {exhibit.location?.room || 'Не указана'}</p>
              <p><strong>Этаж:</strong> {exhibit.location?.floor || 'Не указан'}</p>
            </div>
          </div>

          {exhibit.assignedEmployee && (
            <div className="info-section">
              <h3>👨‍💼 Ответственный сотрудник</h3>
              <div className="employee-card">
               
                <div className="employee-details">
                  <h4>{exhibit.assignedEmployee.name || 'Не указан'}</h4>
                  <p><strong>Должность:</strong> {exhibit.assignedEmployee.position || 'Не указана'}</p>
                  <p><strong>Отдел:</strong> {exhibit.assignedEmployee.department || 'Не указан'}</p>
                  {exhibit.assignedEmployee.email && (
                    <p><strong>Email:</strong> {exhibit.assignedEmployee.email}</p>
                  )}
                  {exhibit.assignedEmployee.phone && (
                    <p><strong>Телефон:</strong> {exhibit.assignedEmployee.phone}</p>
                  )}
                </div>
              </div>
             
            </div>
          )}

          <div className="info-section">
            <h3>⚙️ Состояние</h3>
            <div className="status-display">
              <span className={`status-badge status-${exhibit.status}`}>
                {exhibit.status === 'exhibited' ? 'На выставке' : 
                 exhibit.status === 'stored' ? 'В хранилище' :
                 exhibit.status === 'restoration' ? 'На реставрации' : 'В аренде'}
              </span>
              <span className={`conservation-badge conservation-${exhibit.conservationState}`}>
                {exhibit.conservationState === 'excellent' ? 'Отличное' :
                 exhibit.conservationState === 'good' ? 'Хорошее' :
                 exhibit.conservationState === 'satisfactory' ? 'Удовл.' : 'Требует внимания'}
              </span>
            </div>
          </div>

          {exhibit.materials && exhibit.materials.length > 0 && (
            <div className="info-section">
              <h3>🔧 Материалы</h3>
              <div className="materials-list">
                {exhibit.materials.map((material, index) => (
                  <span key={index} className="material-tag">
                    {material}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exhibit.dimensions && (
            <div className="info-section">
              <h3>📏 Размеры</h3>
              <p>Высота: {exhibit.dimensions.height || '?'} см</p>
              <p>Ширина: {exhibit.dimensions.width || '?'} см</p>
              <p>Глубина: {exhibit.dimensions.depth || '?'} см</p>
            </div>
          )}

          <div className="info-section">
            <h3>📅 Дата добавления</h3>
            <div className="date-info">
              <p><strong>Локальное время:</strong> {exhibit.createdAtLocal}</p>
              <p><strong>UTC время:</strong> {exhibit.createdAtUTC}</p>
              {exhibit.updatedAtLocal && (
                <p><strong>Обновлено:</strong> {exhibit.updatedAtLocal}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ai-analysis-section">
        <h2>🤖 AI Анализ через Ollama</h2>
        <div className="ai-controls">
          <button 
            onClick={() => handleAiAnalysis('description')} 
            disabled={analyzing}
            className="ai-btn"
          >
            {analyzing ? 'Анализ...' : '📝 Сгенерировать описание'}
          </button>
          
          <button 
            onClick={() => handleAiAnalysis('conservation')} 
            disabled={analyzing}
            className="ai-btn"
          >
            🛡️ Анализ сохранности
          </button>
          
          <button 
            onClick={() => handleAiAnalysis('art')} 
            disabled={analyzing}
            className="ai-btn"
          >
            🎨 Искусствоведческий анализ
          </button>
        </div>

        {aiAnalysis && (
          <div className="ai-result">
            <h3>{aiAnalysis.title}</h3>
            <div className="ai-content">
              {aiAnalysis.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <div className="ai-meta">
              <span>Модель: {aiAnalysis.model}</span>
              <span>Время: {aiAnalysis.time}мс</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitDetail;