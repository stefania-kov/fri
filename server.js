const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();

// Подключение к PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'products',
  password: process.env.DB_PASSWORD || '0000',
  port: process.env.DB_PORT || 5432
});

// Проверка подключения
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ Connection error:', err));

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/fotos', express.static(path.join(__dirname, 'public/fotos')));

// Импорт роутов
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Подключение роутов
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Функция валидации числовых значений
const validateNumber = (value, fieldName) => {
  if (isNaN(value)) {
    throw new Error(`Поле ${fieldName} должно быть числом`);
  }
  if (value < 0) {
    throw new Error(`Поле ${fieldName} не может быть отрицательным`);
  }
};

// Роуты для продуктов
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('Error getting products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, calories, proteins, fats, carbs } = req.body;
  
  try {
    if (!name || !calories || !proteins || !fats || !carbs) {
      throw new Error('Все поля обязательны для заполнения');
    }
    
    validateNumber(calories, 'calories');
    validateNumber(proteins, 'proteins');
    validateNumber(fats, 'fats');
    validateNumber(carbs, 'carbs');

    const { rows } = await pool.query(
      `INSERT INTO products 
       (name, caloriesper100g, proteins, fats, carbohydrates) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, calories, proteins, fats, carbs]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ 
      error: err.message || 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Роуты для активностей
app.get('/api/activities', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM activities ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('Error getting activities:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Улучшенный роут для сохранения дневника
app.post('/api/dnevnik', async (req, res) => {
  const { date, time, id_user, products = [], activities = [] } = req.body;
  
  console.log('Получен запрос на сохранение дневника:', {
    date,
    time,
    id_user,
    products_count: products.length,
    activities_count: activities.length
  });

  try {
    // Валидация
    if (!date || !id_user) {
      throw new Error('Обязательные поля: date и id_user');
    }

    validateNumber(id_user, 'id_user');
    
    await pool.query('BEGIN');

    // 1. Сохраняем основную запись
    const diaryResult = await pool.query(
      `INSERT INTO dnevnik (date, time, id_user) 
       VALUES ($1, $2, $3) RETURNING id`,
      [date, time || null, id_user]
    );
    const diaryId = diaryResult.rows[0].id;
    console.log('Создана запись дневника ID:', diaryId);

    // 2. Сохраняем активности с проверкой
    for (const activity of activities) {
      try {
        console.log('Сохранение активности:', activity);
        
        validateNumber(activity.id_active, 'activity.id_active');
        validateNumber(activity.minute, 'activity.minute');

        // Проверка существования активности
        const activityExists = await pool.query(
          'SELECT id FROM activities WHERE id = $1',
          [activity.id_active]
        );
        
        if (activityExists.rowCount === 0) {
          throw new Error(`Активность с ID ${activity.id_active} не найдена`);
        }

        // Сохранение в dnevn_active
        const insertResult = await pool.query(
          `INSERT INTO dnevn_active (id_active, id_dnevnik, minute) 
           VALUES ($1, $2, $3) RETURNING id`,
          [activity.id_active, diaryId, activity.minute]
        );
        
        console.log('Активность сохранена, ID записи:', insertResult.rows[0].id);
      } catch (err) {
        console.error('Ошибка сохранения активности:', {
          error: err.message,
          activity,
          diaryId
        });
        throw err;
      }
    }

    await pool.query('COMMIT');
    
    res.status(201).json({ 
      success: true,
      message: 'Данные дневника успешно сохранены',
      diaryId
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Ошибка сохранения дневника:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      detail: err.detail
    });
    
    let errorMessage = 'Ошибка сервера при сохранении данных';
    if (err.code === '23503') {
      errorMessage = 'Ошибка: Неверный ID активности или записи дневника';
    } else if (err.message.includes('Активность с ID')) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Получение записей дневника
app.get('/api/dnevnik/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    validateNumber(userId, 'userId');
    
    // Получаем записи дневника
    const entries = await pool.query(
      `SELECT * FROM dnevnik WHERE id_user = $1 ORDER BY date DESC, time DESC`,
      [userId]
    );
    
    // Получаем детали для каждой записи
    const result = await Promise.all(
      entries.rows.map(async entry => {
        const products = await pool.query(
          `SELECT p.*, dp.gramovka 
           FROM dnevn_product dp
           JOIN products p ON dp.id_product = p.id
           WHERE dp.id_dnevnik = $1`,
          [entry.id]
        );
        
        const activities = await pool.query(
          `SELECT a.*, da.minute 
           FROM dnevn_active da
           JOIN activities a ON da.id_active = a.id
           WHERE da.id_dnevnik = $1`,
          [entry.id]
        );
        
        return {
          ...entry,
          products: products.rows,
          activities: activities.rows
        };
      })
    );
    
    res.json(result);
  } catch (err) {
    console.error('Ошибка получения дневника:', err);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Что-то пошло не так!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});