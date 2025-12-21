import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const Contacts = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для обработчиков
  const [clickCount, setClickCount] = useState(0);
  const [hoveredEmployee, setHoveredEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastAction, setLastAction] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': user?.token ? `Bearer ${user.token}` : ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEmployees(data.employees || []);
        } else {
          setError(data.message || 'Не удалось загрузить данные');
        }
      } else {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
      setError(error.message);
      
      setEmployees([
        { 
          _id: '1', 
          name: 'Иванова Анна Сергеевна', 
          position: 'Главный куратор', 
          department: 'Отдел живописи',
          email: 'ivanova@museum.ru',
          phone: '+7 (495) 123-45-67'
        },
        { 
          _id: '2', 
          name: 'Петров Дмитрий Владимирович', 
          position: 'Реставратор', 
          department: 'Реставрационный отдел',
          email: 'petrov@museum.ru',
          phone: '+7 (495) 123-45-68'
        },
        { 
          _id: '3', 
          name: 'Сидорова Елена Михайловна', 
          position: 'Экскурсовод', 
          department: 'Экскурсионный отдел',
          email: 'sidorova@museum.ru',
          phone: '+7 (495) 123-45-69'
        },
        { 
          _id: '4', 
          name: 'Кузнецов Алексей Петрович', 
          position: 'Смотритель', 
          department: 'Служба безопасности',
          email: 'kuznetsov@museum.ru',
          phone: '+7 (495) 123-45-70'
        },
        { 
          _id: '5', 
          name: 'Морозова Ольга Васильевна', 
          position: 'Администратор', 
          department: 'Администрация',
          email: 'morozova@museum.ru',
          phone: '+7 (495) 123-45-71'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderClick = (e) => {
    console.log('✅ Кликнули по заголовку страницы', e);
    setClickCount(prev => prev + 1);
    setLastAction(`Клик по заголовку ${new Date().toLocaleTimeString()}`);
    
    e.currentTarget.style.backgroundColor = '#e6f7ff';
    setTimeout(() => {
      if (e.currentTarget) {
        e.currentTarget.style.backgroundColor = '';
      }
    }, 300);
  };

  const handleEmployeeMouseEnter = (employee, e) => {
    console.log('✅ Навели на сотрудника:', employee.name);
    setHoveredEmployee(employee._id);
    setLastAction(`Навели на ${employee.name} ${new Date().toLocaleTimeString()}`);
  };

  const handleEmployeeMouseLeave = (employee, e) => {
    console.log('✅ Убрали мышь с сотрудника');
    setHoveredEmployee(null);
    setLastAction(`Убрали мышь ${new Date().toLocaleTimeString()}`);
  };

  const handleEmployeeDoubleClick = (employee, e) => {
    console.log('✅ Двойной клик по сотруднику:', employee.name);
    setSelectedEmployee(employee);
    setLastAction(`Двойной клик на ${employee.name} ${new Date().toLocaleTimeString()}`);
    
    e.currentTarget.style.border = '3px solid #4cc9f0';
    setTimeout(() => {
      if (e.currentTarget) {
        e.currentTarget.style.border = '';
      }
    }, 500);
  };

  const handleSearchChange = (e) => {
    console.log('✅ Изменён поисковый запрос:', e.target.value);
    setSearchQuery(e.target.value);
    setLastAction(`Поиск: "${e.target.value}" ${new Date().toLocaleTimeString()}`);
  };

  const handleRightClick = (e, employee) => {
    e.preventDefault(); 
    console.log('✅ Правая кнопка мыши на:', employee.name);
    setLastAction(`Правая кнопка на ${employee.name} ${new Date().toLocaleTimeString()}`);
    
    alert(`Быстрое меню для: ${employee.name}\nEmail: ${employee.email}`);
  };

  const handleEmployeeFocus = (employee, e) => {
    console.log('✅ Фокус на сотруднике:', employee.name);
    setLastAction(`Фокус на ${employee.name} ${new Date().toLocaleTimeString()}`);
  };

  const handleTestClick = () => {
    console.log('✅ Тестовая кнопка нажата!');
    setLastAction(`Тестовая кнопка ${new Date().toLocaleTimeString()}`);
    alert('✅ Обработчик onClick работает!');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка списка сотрудников...</p>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      
      <div style={{
        position: 'sticky',
        top: '0',
        backgroundColor: '#f8f9fa',
        padding: '10px',
        borderBottom: '2px solid #4cc9f0',
        zIndex: 100,
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Статус:</strong> 
            <span style={{ color: '#4cc9f0', marginLeft: '10px' }}>
              Кликов: {clickCount} | Наведено: {hoveredEmployee ? 'да' : 'нет'} | Выбрано: {selectedEmployee ? 'да' : 'нет'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Последнее действие: {lastAction || 'нет'}
          </div>
        </div>
      </div>
    
      <div 
        className="page-header" 
        onClick={handleHeaderClick}
        style={{ 
          cursor: 'pointer',
          padding: '20px',
          backgroundColor: '#f0f8ff',
          borderRadius: '10px',
          marginBottom: '20px',
          transition: 'background-color 0.3s',
          border: '2px dashed #4cc9f0'
        }}
      >
        <h1 style={{ margin: '0 0 10px 0' }}>📞 Контакты</h1>
        <p style={{ margin: 0 }}>
          Список сотрудников музея (кликните здесь! Кликов: <strong>{clickCount}</strong>)
        </p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          ⚡ Кликните для проверки onClick обработчика
        </p>
      </div>

     

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>Отображаются демо-данные</p>
        </div>
      )}

      <div className="contacts-info">
        <div className="contacts-overview">
          <h2>Музей "Цифровое наследие"</h2>
          <p><strong>Адрес:</strong> г. Минск ул. Музейная, д. 1</p>
          <p><strong>Телефон:</strong> +375 (44) 123-45-66</p>
          <p><strong>Email:</strong> info@museum.ru</p>
          <p><strong>Часы работы:</strong> 10:00 - 20:00 (без выходных)</p>
        </div>

        <div className="contacts-stats">
          <div className="stat-card">
            <h3>{employees.length}</h3>
            <p>Всего сотрудников</p>
          </div>
          <div className="stat-card">
            <h3>7</h3>
            <p>Отделов</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Поддержка</p>
          </div>
        </div>
      </div>

      {/* Поле поиска с onChange */}
      <div className="search-section" style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="🔍 Поиск сотрудников по имени или отделу..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            padding: '12px',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '8px',
            border: '2px solid #4cc9f0',
            backgroundColor: '#f0f8ff',
            transition: 'all 0.2s ease',
            outline: 'none',
            fontSize: '16px'
          }}
        />
        <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
          Введите текст для поиска. Текущий запрос: "{searchQuery}"
          {searchQuery && ` (найдено: ${employees.filter(e => 
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.position.toLowerCase().includes(searchQuery.toLowerCase())
          ).length})`}
        </p>
      </div>

      <div className="employees-section">
        <h2>👥 Сотрудники музея</h2>
        
        <div className="departments-container">
          {Array.from(new Set(employees.map(e => e.department))).map(department => {
            const deptEmployees = employees.filter(e => e.department === department);
            
            const filteredEmployees = deptEmployees.filter(employee => 
              employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
              employee.department.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredEmployees.length === 0) return null;

            return (
              <div key={department} className="department-card">
                <h3>{department} ({filteredEmployees.length})</h3>
                <div className="employees-list">
                  {filteredEmployees.map(employee => (
                    <div 
                      key={employee._id} 
                      className="employee-card"
                      tabIndex="0"
                      style={{
                        backgroundColor: hoveredEmployee === employee._id 
                          ? '#e6f7ff' 
                          : selectedEmployee?._id === employee._id 
                            ? '#d4edda' 
                            : 'white',
                        border: selectedEmployee?._id === employee._id 
                          ? '3px solid #28a745' 
                          : hoveredEmployee === employee._id 
                            ? '2px solid #4cc9f0' 
                            : '1px solid #ddd',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        outline: 'none',
                        padding: '15px',
                        marginBottom: '10px',
                        borderRadius: '8px',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => handleEmployeeMouseEnter(employee, e)}
                      onMouseLeave={(e) => handleEmployeeMouseLeave(employee, e)}
                      onDoubleClick={(e) => handleEmployeeDoubleClick(employee, e)}
                      onContextMenu={(e) => handleRightClick(e, employee)}
                      onFocus={(e) => handleEmployeeFocus(employee, e)}
                      onClick={(e) => {
                        console.log('Одиночный клик по сотруднику:', employee.name);
                        setLastAction(`Клик по ${employee.name} ${new Date().toLocaleTimeString()}`);
                      }}
                    >
                      {hoveredEmployee === employee._id && (
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          backgroundColor: '#4cc9f0',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '10px'
                        }}>
                          🖱️ Наведено
                        </div>
                      )}
                      
                      {selectedEmployee?._id === employee._id && (
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          left: '5px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '10px'
                        }}>
                          ✅ Выбрано
                        </div>
                      )}

                      <div className="employee-header">
                        <div 
                          className="employee-avatar"
                          style={{
                            backgroundColor: hoveredEmployee === employee._id ? '#4cc9f0' : '#ccc',
                            color: hoveredEmployee === employee._id ? 'white' : '#333',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {employee.name?.charAt(0) || 'С'}
                        </div>
                        <div className="employee-info" style={{ marginLeft: '15px' }}>
                          <h4 style={{ margin: '0 0 5px 0' }}>{employee.name}</h4>
                          <p className="employee-position" style={{ 
                            margin: 0,
                            color: '#666',
                            fontSize: '14px'
                          }}>
                            {employee.position}
                          </p>
                        </div>
                      </div>
                      <div className="employee-contact" style={{ marginTop: '10px' }}>
                        {employee.email && (
                          <p style={{ margin: '5px 0' }}>
                            <strong>Email:</strong> <a href={`mailto:${employee.email}`}>{employee.email}</a>
                          </p>
                        )}
                        {employee.phone && (
                          <p style={{ margin: '5px 0' }}>
                            <strong>Телефон:</strong> <a href={`tel:${employee.phone}`}>{employee.phone}</a>
                          </p>
                        )}
                        <p style={{ margin: '5px 0' }}>
                          <strong>Отдел:</strong> {employee.department}
                        </p>
                        
                        <div style={{
                          fontSize: '11px',
                          color: '#666',
                          marginTop: '10px',
                          padding: '8px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '4px',
                          borderLeft: '3px solid #4cc9f0'
                        }}>
                          💡 <strong>Действия:</strong><br/>
                          • Наведите мышку (onMouseEnter)<br/>
                          • Двойной клик (onDoubleClick)<br/>
                          • Правая кнопка (onContextMenu)<br/>
                          • Tab для фокуса (onFocus)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h3>📋 Список обработчиков событий:</h3>
        
        <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
          <li> <strong>onClick</strong> - Клик по заголовку страницы  </li>          
           <li><strong>onMouseEnter</strong> - Наведение на карточку сотрудника    </li>         
           <li><strong>onMouseLeave</strong> - Уход мыши с карточки сотрудника          </li>          
          <li><strong>onDoubleClick</strong> - Двойной клик по сотруднику          </li>          
           <li><strong>onChange</strong> - Поиск сотрудников           </li>          
          <li><strong>onContextMenu</strong> - Правая кнопка мыши на карточке          </li>          
           <li><strong>onFocus</strong> - Фокус на поле сотрудника           </li>
        </ul>
      </div>


      <div className="back-section" style={{ marginTop: '30px' }}>
        <Link to="/" className="back-link">
          ← Вернуться на главную
        </Link>
      </div>

     
    </div>
  );
};

export default Contacts;