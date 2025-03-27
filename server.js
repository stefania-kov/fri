const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Инициализация приложения
const app = express();

// Подключение к базе данных
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'products',
  password: process.env.DB_PASSWORD || '0000',
  port: process.env.DB_PORT || 5432
});
module.exports = { app, pool };
// Проверка подключения к БД
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ Connection error:', err));

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(bodyParser.json());

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/fotos', express.static(path.join(__dirname, 'public/fotos')));

// Импорт роутов
const productRoutes = require('./routes/productRoutes');
const activityRoutes = require('./routes/activityRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

// Подключение роутов
app.use('/api/products', productRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dnevnik', diaryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Для тестирования