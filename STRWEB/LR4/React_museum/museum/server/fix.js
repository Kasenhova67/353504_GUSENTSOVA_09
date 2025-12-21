// fix-mongo.js
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔗 Тестируем подключение к MongoDB...');
  
  // Пробуем несколько вариантов подключения
  const connectionOptions = [
    'mongodb://127.0.0.1:27017/museum_db',
    'mongodb://localhost:27017/museum_db',
    'mongodb://localhost:27017/test'
  ];
  
  for (const uri of connectionOptions) {
    console.log(`\nПробуем: ${uri}`);
    try {
      await mongoose.connect(uri);
      console.log('✅ Успешное подключение!');
      console.log('📊 База данных:', mongoose.connection.name);
      return true;
    } catch (error) {
      console.log('❌ Ошибка:', error.message);
      await mongoose.disconnect();
    }
  }
  
  console.log('\n❌ Не удалось подключиться к MongoDB');
  console.log('\n💡 РЕШЕНИЯ:');
  console.log('1. Установите MongoDB: https://www.mongodb.com/try/download/community');
  console.log('2. Запустите: mongod');
  console.log('3. Или используйте MongoDB Atlas (облачную базу)');
  return false;
}

testConnection().then(success => {
  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});