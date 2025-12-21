const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Tour = require('./models/Tour'); 
const Employee = require('./models/Employee');
require('dotenv').config();
const googleAuthService = require('./googleAuth');

const User = require('./models/User');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

console.log('🚀 Запуск сервера музея...');

const MONGO_URI = 'mongodb://127.0.0.1:27017/museum_db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB подключена!');
    console.log(`📊 База данных: ${mongoose.connection.name}`);
    
    createTestData();
  })
  .catch((error) => {
    console.error('❌ Ошибка MongoDB:', error.message);
    process.exit(1);
  });

const bitSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  location: Object,
  status: String,
  conservationState: String,
  conservationNotes: [{
    state: String,
    notes: String,
    updatedBy: String,
    updatedAt: { type: Date, default: Date.now }
  }],
  imageUrl: String,
  year: Number,
  materials: [String],
  dimensions: Object,
  value: String,
  
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  createdAt: { type: Date, default: Date.now }
}, {
  strictPopulate: false 
});


const bit = mongoose.model('bit', bitSchema);

const SECRET_KEY = 'museum-secret-key-2024-demo';


const checkAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (req.method === 'GET' && !token) {
    req.user = { id: 'guest', role: 'visitor' };
    return next();
  }
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Требуется авторизация' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Неверный или просроченный токен' 
    });
  }
};

app.get('/api/health', (req, res) => {
  res.json({ 
    status: '✅ Сервер работает',
    mongo: '✅ Подключено',
    database: mongoose.connection.name,
    timestamp: new Date().toLocaleString('ru-RU')
  });
});


app.patch('/api/bits/:id/conservation', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { conservationState, notes } = req.body;
    
    console.log('📝 Обновление сохранности:', { id, conservationState });
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Только администраторы могут обновлять состояние сохранности' 
      });
    }
    
    const updatedExhibit = await bit.findByIdAndUpdate(
      id,
      { 
        conservationState,
        $push: {
          conservationNotes: {
            state: conservationState,
            notes: notes || '',
            updatedBy: req.user.id,
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    );
    
    if (!updatedExhibit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Экспонат не найден' 
      });
    }
    
    res.json({
      success: true,
      exhibit: updatedExhibit,
      message: 'Статус сохранности обновлен'
    });
    
  } catch (error) {
    console.error('Ошибка при обновлении сохранности:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении статуса сохранности',
      error: error.message
    });
  }
});


app.get('/api/bits/:id', async (req, res) => {
  try {
    const exhibit = await bit.findById(req.params.id);
    
    if (!exhibit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Экспонат не найден' 
      });
    }
    
    res.json({
      success: true,
      exhibit: {
        ...exhibit.toObject(),
        createdAtLocal: new Date(exhibit.createdAt).toLocaleString('ru-RU'),
        createdAtUTC: exhibit.createdAt.toUTCString()
      },
      message: 'Экспонат найден'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении экспоната',
      error: error.message 
    });
  }
});

app.patch('/api/bits/:id/conservation', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { conservationState, notes } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Только администраторы могут обновлять состояние сохранности' 
      });
    }
    
    const updatedExhibit = await bit.findByIdAndUpdate(
      id,
      { 
        conservationState,
        $push: {
          conservationNotes: {
            state: conservationState,
            notes: notes,
            updatedBy: req.user.id,
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    );
    
    if (!updatedExhibit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Экспонат не найден' 
      });
    }
    
    res.json({
      success: true,
      exhibit: updatedExhibit,
      message: 'Статус сохранности обновлен'
    });
    
  } catch (error) {
    console.error('Ошибка при обновлении сохранности:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении статуса сохранности'
    });
  }
});

app.get('/api/bits', async (req, res) => {
  try {
    const bits = await bit.find({}).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      bits: bits.map(b => ({
        ...b.toObject(),
        createdAtLocal: new Date(b.createdAt).toLocaleString('ru-RU')
      })),
      total: bits.length,
      message: `Найдено ${bits.length} экспонатов`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении экспонатов',
      error: error.message 
    });
  }
});
app.post('/api/bits', checkAuth, async (req, res) => {
  try {
    const bitData = req.body;
    
    if (!bitData.assignedEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать ответственного сотрудника'
      });
    }
    
    const newbit = new bit({
      ...bitData,
      createdAt: new Date()
    });
    
    await newbit.save();
    
    const savedBit = await bit.findById(newbit._id);
    
    res.json({
      success: true,
      bit: {
        ...savedBit.toObject(),
        createdAtLocal: new Date(savedBit.createdAt).toLocaleString('ru-RU')
      },
      message: 'Экспонат успешно создан'
    });
  } catch (error) {
    console.error('Ошибка при создании экспоната:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании экспоната',
      error: error.message
    });
  }
});

app.put('/api/bits/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Только администраторы могут редактировать экспонаты' 
      });
    }
    
    if (updateData.assignedEmployee && typeof updateData.assignedEmployee === 'string') {
      updateData.assignedEmployee = new mongoose.Types.ObjectId(updateData.assignedEmployee);
    }
    
    const updatedExhibit = await bit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedEmployee'); 
    
    if (!updatedExhibit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Экспонат не найден' 
      });
    }
    
    res.json({
      success: true,
      exhibit: {
        ...updatedExhibit.toObject(),
        createdAtLocal: new Date(updatedExhibit.createdAt).toLocaleString('ru-RU'),
        createdAtUTC: updatedExhibit.createdAt.toUTCString()
      },
      message: 'Экспонат успешно обновлен'
    });
    
  } catch (error) {
    console.error('Ошибка при обновлении:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении экспоната',
      error: error.message
    });
  }
});

app.get('/api/bits/:id/with-employee', async (req, res) => {
  try {
    const exhibit = await bit.findById(req.params.id).populate('assignedEmployee');
    
    if (!exhibit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Экспонат не найден' 
      });
    }
    
    res.json({
      success: true,
      exhibit: {
        ...exhibit.toObject(),
        createdAtLocal: new Date(exhibit.createdAt).toLocaleString('ru-RU'),
        createdAtUTC: exhibit.createdAt.toUTCString()
      },
      message: 'Экспонат найден'
    });
  } catch (error) {
    console.error('Ошибка при получении экспоната с сотрудником:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении экспоната',
      error: error.message 
    });
  }
});

app.delete('/api/bits/:id', checkAuth, async (req, res) => {
  try {
    const foundBit = await bit.findById(req.params.id);
    
    if (!foundBit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Экспонат не найден' 
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Только администраторы могут удалять экспонаты' 
      });
    }
    
    await foundBit.deleteOne();
    
    res.json({
      success: true,
      message: 'Экспонат успешно удален',
      id: foundBit._id
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении экспоната'
    });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalbits = await bit.countDocuments();
    const bitsByCategory = await bit.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      bitsCount: totalbits,
      bitsByCategory: bitsByCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      updatedAt: new Date().toLocaleString('ru-RU')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики'
    });
  }
});

app.get('/api/tours', async (req, res) => {
  try {
    console.log('📋 Запрос на получение туров');
    
    const tours = await Tour.find({ isActive: true }).sort({ createdAt: -1 });
    
    console.log(`✅ Найдено ${tours.length} туров`);
    
    res.json({
      success: true,
      tours: tours.map(tour => ({
        id: tour._id,
        name: tour.name,
        description: tour.description,
        duration: tour.duration,
        price: tour.price,
        schedule: tour.schedule,
        isActive: tour.isActive,
        createdAt: tour.createdAt
      })),
      total: tours.length,
      message: `Найдено ${tours.length} экскурсий`
    });
  } catch (error) {
    console.error('❌ Ошибка при получении туров:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении экскурсий',
      error: error.message 
    });
  }
});

app.get('/api/tours/:id', async (req, res) => {
  try {
    if (req.params.id === 'seed' || req.params.id === 'stats') {
      return res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
      });
    }
    
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ 
        success: false, 
        message: 'Экскурсия не найдена' 
      });
    }
    
    res.json({
      success: true,
      tour: {
        id: tour._id,
        name: tour.name,
        description: tour.description,
        duration: tour.duration,
        price: tour.price,
        schedule: tour.schedule,
        isActive: tour.isActive
      },
      message: 'Экскурсия найдена'
    });
  } catch (error) {
   
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Неверный формат ID экскурсии'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении экскурсии',
      error: error.message 
    });
  }
});

app.post('/api/tours', checkAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Только администраторы могут создавать экскурсии' 
      });
    }
    
    const tourData = req.body;
    
    const newTour = new Tour({
      ...tourData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newTour.save();
    
    res.json({
      success: true,
      tour: {
        id: newTour._id,
        ...newTour.toObject()
      },
      message: 'Экскурсия успешно создана'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании экскурсии',
      error: error.message
    });
  }
});

app.put('/api/tours/:id', checkAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Только администраторы могут обновлять экскурсии' 
      });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedTour) {
      return res.status(404).json({ 
        success: false, 
        message: 'Экскурсия не найдена' 
      });
    }
    
    res.json({
      success: true,
      tour: updatedTour,
      message: 'Экскурсия успешно обновлена'
    });
    
  } catch (error) {
    console.error('Ошибка при обновлении экскурсии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении экскурсии',
      error: error.message
    });
  }
});

app.delete('/api/tours/:id', checkAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Только администраторы могут удалять экскурсии' 
      });
    }
    
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ 
        success: false, 
        message: 'Экскурсия не найдена' 
      });
    }
    
    tour.isActive = false;
    tour.updatedAt = new Date();
    await tour.save();
    
    res.json({
      success: true,
      message: 'Экскурсия успешно деактивирована',
      id: tour._id
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при деактивации экскурсии',
      error: error.message
    });
  }
});

app.get('/api/tours/stats', async (req, res) => {
  try {
    const totalTours = await Tour.countDocuments();
    const activeTours = await Tour.countDocuments({ isActive: true });
    const inactiveTours = await Tour.countDocuments({ isActive: false });
    
    res.json({
      success: true,
      stats: {
        total: totalTours,
        active: activeTours,
        inactive: inactiveTours
      },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики'
    });
  }
});


app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
      .sort({ name: 1 })
      .select('name position email department phone');
    
    res.json({
      success: true,
      employees,
      total: employees.length,
      message: `Найдено ${employees.length} сотрудников`
    });
  } catch (error) {
    console.error('Ошибка при получении сотрудников:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении сотрудников' 
    });
  }
});

async function createTestData() {
  try {
    const count = await bit.countDocuments();
    if (count === 0) {
      console.log('📦 База пуста, создаю тестовые данные...');
      
      const response = await fetch(`http://localhost:${PORT}/api/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log(`✅ ${result.message}`);
    } else {
      console.log(`📊 В базе уже есть ${count} экспонатов`);
    }
  } catch (error) {
    console.log('⚠️ Не удалось создать тестовые данные автоматически');
  }
}

app.post('/api/auth/google', async (req, res) => {
  try {
    const { id_token } = req.body;
    
    console.log('🔐 Получен запрос на Google аутентификацию');
    console.log('ID Token получен:', id_token ? 'Да' : 'Нет');
    
    if (!id_token) {
      return res.status(400).json({
        success: false,
        message: 'ID Token не предоставлен'
      });
    }
    
    const verificationResult = await googleAuthService.verifyToken(id_token);
    
    if (!verificationResult.success) {
      console.error('❌ Ошибка верификации:', verificationResult.error);
      return res.status(401).json({
        success: false,
        message: 'Неверный Google токен: ' + verificationResult.error
      });
    }
    
    const userResult = await googleAuthService.findOrCreateUser(verificationResult.userInfo);
    
    if (!userResult.success) {
      console.error('❌ Ошибка создания пользователя:', userResult.error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка обработки пользователя: ' + userResult.error
      });
    }
    
    console.log('✅ Пользователь успешно аутентифицирован:', userResult.user.email);
    
    res.json({
      success: true,
      user: userResult.user,
      message: 'Google аутентификация успешна'
    });
    
  } catch (error) {
    console.error('❌ Ошибка Google аутентификации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при Google аутентификации',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Попытка входа:', { username });
    
    const demoUsers = {
      'admin': { 
        password: 'admin123', 
        role: 'admin', 
        email: 'admin@museum.ru',
        name: 'Администратор Музея'
      },
      'user': { 
        password: 'user123', 
        role: 'visitor', 
        email: 'user@museum.ru',
        name: 'Посетитель Музея'
      },
      'visitor': {
        password: 'visitor123',
        role: 'visitor',
        email: 'visitor@museum.ru',
        name: 'Тестовый Посетитель'
      }
    };
    
    const userData = demoUsers[username];
    
    if (!userData) {
      console.log('❌ Пользователь не найден:', username);
      return res.status(400).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    if (userData.password !== password) {
      console.log('❌ Неверный пароль для:', username);
      return res.status(400).json({
        success: false,
        message: 'Неверный пароль'
      });
    }
    
    console.log('✅ Успешная проверка для:', username);
    
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      user = new User({
        username: username,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        authMethod: 'demo',
        isActive: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
        lastLogin: new Date()
      });
      await user.save();
      console.log('👤 Создан новый пользователь:', username);
    } else {
      user.lastLogin = new Date();
      await user.save();
      console.log('👤 Обновлен существующий пользователь:', username);
    }
    
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Токен создан для пользователя:', username);
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        token: token,
        authMethod: 'demo'
      },
      message: 'Вход выполнен успешно'
    });
    
  } catch (error) {
    console.error('❌ Ошибка при входе:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при входе',
      error: error.message
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {

  console.log(`\n Клиент должен быть на http://localhost:3000`);
});