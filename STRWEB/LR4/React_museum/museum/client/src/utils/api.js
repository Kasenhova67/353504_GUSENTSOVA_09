// src/utils/api.js
const API_BASE = 'http://localhost:5000/api';

// Получить токен из localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('museumUser'));
  return user?.token || localStorage.getItem('authToken');
};

// Создать заголовки с авторизацией
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API функции
export const api = {
  // Экспонаты
  getExhibits: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/exhibits${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  getExhibit: async (id) => {
    const response = await fetch(`${API_BASE}/exhibits/${id}`);
    return response.json();
  },
  
  createExhibit: async (exhibitData) => {
    const response = await fetch(`${API_BASE}/exhibits`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(exhibitData)
    });
    return response.json();
  },
  
  updateExhibit: async (id, exhibitData) => {
    const response = await fetch(`${API_BASE}/exhibits/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(exhibitData)
    });
    return response.json();
  },
  
  deleteExhibit: async (id) => {
    const response = await fetch(`${API_BASE}/exhibits/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },
  
  // Аутентификация
  login: async (username, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },
  
  googleLogin: async (token) => {
    const response = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return response.json();
  },
  
  // Заполнение базы
  seedDatabase: async () => {
    const response = await fetch(`${API_BASE}/seed`, {
      method: 'POST'
    });
    return response.json();
  },
  
  // Статистика
  getStats: async () => {
    const response = await fetch(`${API_BASE}/stats`);
    return response.json();
  }
};