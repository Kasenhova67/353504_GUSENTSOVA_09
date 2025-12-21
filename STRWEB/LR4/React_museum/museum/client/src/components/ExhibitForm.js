import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import '../App.css';

const ExhibitForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();   
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Археология',
    location: {
      hall: '',
      room: '',
      floor: ''
    },
    status: 'В экспозиции',
    conservationState: 'Хорошее',
    assignedEmployee: '', 
    imageUrl: '',
    year: new Date().getFullYear(),
    materials: [],
    dimensions: {
      height: '',
      width: '',
      depth: ''
    },
    value: 'Средняя'
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadEmployees();
    
    if (mode === 'edit' && id) {
      loadExhibit();
    }
  }, [mode, id]);

  const loadEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEmployees(data.employees || []);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
      setErrorMessage('Не удалось загрузить список сотрудников');
      
      setEmployees([
        { _id: '1', name: 'Иванова А.С.', position: 'куратор', department: 'Отдел живописи' },
        { _id: '2', name: 'Петров Д.В.', position: 'реставратор', department: 'Реставрационный отдел' },
        { _id: '3', name: 'Сидорова Е.М.', position: 'экскурсовод', department: 'Экскурсионный отдел' },
        { _id: '4', name: 'Кузнецов А.П.', position: 'смотритель', department: 'Служба безопасности' },
        { _id: '5', name: 'Морозова О.В.', position: 'администратор', department: 'Администрация' }
      ]);
    }
  };

  const loadExhibit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/bits/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.exhibit) {
         
          setFormData({
            name: data.exhibit.name || '',
            description: data.exhibit.description || '',
            category: data.exhibit.category || 'Археология',
            location: data.exhibit.location || { hall: '', room: '', floor: '' },
            status: data.exhibit.status || 'В экспозиции',
            conservationState: data.exhibit.conservationState || 'Хорошее',
            assignedEmployee: data.exhibit.assignedEmployee?._id || data.exhibit.assignedEmployee || '',
            imageUrl: data.exhibit.imageUrl || '',
            year: data.exhibit.year || new Date().getFullYear(),
            materials: Array.isArray(data.exhibit.materials) ? data.exhibit.materials : [],
            dimensions: data.exhibit.dimensions || { height: '', width: '', depth: '' },
            value: data.exhibit.value || 'Средняя'
          });
        }
      } else {
        setErrorMessage('Не удалось загрузить данные экспоната');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setErrorMessage('Не удалось загрузить данные экспоната');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMaterialsChange = (e) => {
    const materials = e.target.value.split(',').map(m => m.trim()).filter(m => m);
    setFormData(prev => ({
      ...prev,
      materials
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!user || user.role !== 'admin') {
      setErrorMessage('Только администраторы могут сохранять экспонаты');
      return;
    }
    
    if (!formData.assignedEmployee) {
      setErrorMessage('Пожалуйста, выберите ответственного сотрудника');
      return;
    }
    
    setLoading(true);
    
    try {
      const url = mode === 'edit' 
        ? `http://localhost:5000/api/bits/${id}`
        : 'http://localhost:5000/api/bits';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(
          mode === 'edit' ? 'Экспонат успешно обновлен' : 'Экспонат успешно создан'
        );
        setTimeout(() => {
          navigate(`/exhibits/${mode === 'edit' ? id : data.bit?._id || data.exhibit?._id}`);
        }, 1000);
      } else {
        setErrorMessage(data.message || 'Ошибка при сохранении');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setErrorMessage('Ошибка при сохранении экспоната');
    } finally {
      setLoading(false);
    }
  };

  if (loading && mode === 'edit') {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="exhibit-form-container">
      <div className="form-header">
        <h1>{mode === 'edit' ? '✏️ Редактирование экспоната' : '🏺 Создание нового экспоната'}</h1>
        <p>{mode === 'edit' ? 'Измените данные экспоната' : 'Заполните информацию о новом экспонате'}</p>
        
        {!user || user.role !== 'admin' ? (
          <div className="admin-warning">
            ⚠️ Только администраторы могут {mode === 'edit' ? 'редактировать' : 'добавлять'} экспонаты
          </div>
        ) : null}
      </div>

      {errorMessage && (
        <div className="alert alert-error">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="exhibit-form">
      
        <div className="form-section">
          <h2>📋 Основная информация</h2>
          
          <div className="form-group">
            <label htmlFor="name">Название *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!user || user.role !== 'admin'}
              placeholder="Например: Древнегреческая амфора"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              disabled={!user || user.role !== 'admin'}
              placeholder="Подробное описание экспоната"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Категория</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
              >
                <option value="Археология">Археология</option>
                <option value="Живопись">Живопись</option>
                <option value="Скульптура">Скульптура</option>
                <option value="Оружие">Оружие</option>
                <option value="Текстиль">Текстиль</option>
                <option value="Ювелирные изделия">Ювелирные изделия</option>
                <option value="Керамика">Керамика</option>
                <option value="История">История</option>
                <option value="Естествознание">Естествознание</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="year">Год создания</label>
              <input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
                placeholder="2024"
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>👨‍💼 Ответственный сотрудник</h2>
          <p className="form-note">
            {mode === 'create' 
              ? 'Выберите сотрудника, ответственного за этот экспонат' 
              : 'Текущий ответственный сотрудник. Можно изменить при редактировании.'}
          </p>
          
          <div className="form-group">
            <label htmlFor="assignedEmployee">Сотрудник *</label>
            <select
              id="assignedEmployee"
              name="assignedEmployee"
              value={formData.assignedEmployee}
              onChange={handleChange}
              required
              disabled={!user || user.role !== 'admin' || employees.length === 0}
            >
              <option value="">-- Выберите сотрудника --</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} - {employee.position} ({employee.department})
                </option>
              ))}
            </select>
            {employees.length === 0 && (
              <p className="form-hint">Загружаем список сотрудников...</p>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>📍 Местоположение</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location.hall">Зал *</label>
              <input
                id="location.hall"
                name="location.hall"
                type="text"
                value={formData.location.hall}
                onChange={handleChange}
                required
                disabled={!user || user.role !== 'admin'}
                placeholder="Например: Зал античности"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location.room">Комната</label>
              <input
                id="location.room"
                name="location.room"
                type="text"
                value={formData.location.room}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
                placeholder="101"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location.floor">Этаж</label>
              <input
                id="location.floor"
                name="location.floor"
                type="text"
                value={formData.location.floor}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
                placeholder="1"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>⚙️ Состояние</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Статус</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
              >
                <option value="В экспозиции">В экспозиции</option>
                <option value="В хранилище">В хранилище</option>
                <option value="На реставрации">На реставрации</option>
                <option value="Временное хранение">Временное хранение</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="conservationState">Сохранность</label>
              <select
                id="conservationState"
                name="conservationState"
                value={formData.conservationState}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
              >
                <option value="Отличное">Отличное</option>
                <option value="Хорошее">Хорошее</option>
                <option value="Удовлетворительное">Удовлетворительное</option>
                <option value="Плохое">Плохое</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="value">Ценность</label>
              <select
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
              >
                <option value="Низкая">Низкая</option>
                <option value="Средняя">Средняя</option>
                <option value="Высокая">Высокая</option>
                <option value="Бесценно">Бесценно</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>🔧 Материалы и размеры</h2>
          
          <div className="form-group">
            <label htmlFor="materials">Материалы (через запятую)</label>
            <input
              id="materials"
              type="text"
              value={formData.materials.join(', ')}
              onChange={handleMaterialsChange}
              disabled={!user || user.role !== 'admin'}
              placeholder="дерево, золото, краски"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dimensions.height">Высота (см)</label>
              <input
                id="dimensions.height"
                name="dimensions.height"
                type="number"
                value={formData.dimensions.height}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
                placeholder="150"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dimensions.width">Ширина (см)</label>
              <input
                id="dimensions.width"
                name="dimensions.width"
                type="number"
                value={formData.dimensions.width}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
                placeholder="80"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dimensions.depth">Глубина (см)</label>
              <input
                id="dimensions.depth"
                name="dimensions.depth"
                type="number"
                value={formData.dimensions.depth}
                onChange={handleChange}
                disabled={!user || user.role !== 'admin'}
                placeholder="30"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>🖼️ Изображение</h2>
          
          <div className="form-group">
            <label htmlFor="imageUrl">URL изображения</label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              disabled={!user || user.role !== 'admin'}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          {formData.imageUrl && (
            <div className="image-preview">
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Ошибка+загрузки';
                }} 
              />
              <p>Предпросмотр</p>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(mode === 'edit' ? `/exhibits/${id}` : '/exhibits')}
            className="btn btn-secondary"
          >
            ← Отмена
          </button>
          
          {(user && user.role === 'admin') ? (
            <button
              type="submit"
              disabled={loading || !formData.assignedEmployee}
              className="btn btn-primary"
            >
              {loading 
                ? (mode === 'edit' ? '⏳ Сохранение...' : '⏳ Создание...') 
                : (mode === 'edit' ? '💾 Сохранить изменения' : '➕ Создать экспонат')}
            </button>
          ) : (
            <div className="admin-required">
              ⚠️ Для сохранения необходимы права администратора
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExhibitForm;