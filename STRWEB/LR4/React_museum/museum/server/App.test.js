// server/fill-db.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fillDatabase() {
  try {
    console.log('🔗 Подключение к MongoDB...');
    
    // Подключаемся
    await mongoose.connect('mongodb://127.0.0.1:27017/museum_db');
    console.log('✅ MongoDB подключен');
    
    // ПРОСТЫЕ схемы без middleware
    const exhibitSchema = new mongoose.Schema({
      name: String,
      description: String,
      category: String,
      location: Object,
      status: String,
      conservationState: String,
      imageUrl: String,
      year: Number,
      materials: [String],
      dimensions: Object,
      value: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    // Создаем модели
    const Exhibit = mongoose.model('Exhibit', exhibitSchema);
    
    // Очищаем коллекции
    console.log('🧹 Очистка старых данных...');
    await Exhibit.deleteMany({});
    
    // Хешируем пароли ДО создания пользователей
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    // Простая схема для User
    const userSchema = new mongoose.Schema({
      username: { type: String, unique: true },
      email: { type: String, unique: true },
      password: String,
      role: String
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Удаляем старых пользователей
    await User.deleteMany({});
    
    console.log('👤 Создание пользователей...');
    
    // Создаем пользователей с уже захешированными паролями
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@museum.ru',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date()
    });
    
    await User.create({
      username: 'user',
      email: 'user@museum.ru',
      password: userPassword,
      role: 'visitor',
      createdAt: new Date()
    });
    
    // Экспонаты
    console.log('🏛️  Создание экспонатов...');
    const exhibits = [
      {
        name: "Древнегреческая амфора",
        description: "Керамический сосуд V века до н.э. для хранения вина и масла.",
        category: "archaeology",
        location: { hall: "Античное искусство", room: "101", floor: 1 },
        status: "exhibited",
        conservationState: "good",
        imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=300&h=200&fit=crop",
        year: -500,
        materials: ["керамика", "глазурь", "краски"],
        dimensions: { height: 45, width: 30, depth: 30 },
        value: "Высокая историческая ценность",
        createdBy: adminUser._id
      },
      {
        name: "Портрет Екатерины II",
        description: "Масляная живопись работы Дмитрия Левицкого.",
        category: "art",
        location: { hall: "Русское искусство", room: "205", floor: 2 },
        status: "exhibited",
        conservationState: "excellent",
        imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&h=200&fit=crop",
        year: 1780,
        materials: ["холст", "масло", "дерево", "позолота"],
        dimensions: { height: 120, width: 90, depth: 5 },
        value: "Национальное достояние",
        createdBy: adminUser._id
      },
      {
        name: "Скифское золото",
        description: "Золотые украшения из кургана Солоха.",
        category: "history",
        location: { hall: "Древние цивилизации", room: "301", floor: 3 },
        status: "exhibited",
        conservationState: "excellent",
        imageUrl: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=300&h=200&fit=crop",
        year: -400,
        materials: ["золото", "бирюза", "гранат"],
        dimensions: { height: 15, width: 10, depth: 2 },
        value: "Бесценно",
        createdBy: adminUser._id
      }
    ];
    
    await Exhibit.insertMany(exhibits);
    
    // Проверяем
    const userCount = await User.countDocuments();
    const exhibitCount = await Exhibit.countDocuments();
    
    console.log('\n🎉 БАЗА ДАННЫХ УСПЕШНО ЗАПОЛНЕНА!');
    console.log('=================================');
    console.log(`👥 Пользователей: ${userCount}`);
    console.log(`🏛️  Экспонатов: ${exhibitCount}`);
    console.log('\n🔐 ДЛЯ ВХОДА В СИСТЕМУ:');
    console.log('Логин: admin');
    console.log('Пароль: admin123');
    console.log('\n🌐 Проверьте API:');
    console.log('GET http://localhost:5000/api/exhibits');
    console.log('GET http://localhost:5000/api/stats');
    
    await mongoose.disconnect();
    console.log('\n✅ Готово!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.code === 11000) {
      console.log('💡 Ошибка дублирования. Удалите старые данные вручную:');
      console.log('mongo → use museum_db → db.users.deleteMany({})');
    }
    
    process.exit(1);
  }
}

fillDatabase();