const { pool } = require('../server'); // Импортируем pool из server.js

exports.createDiaryEntry = async (data) => {
  const { date, time, id_user, products = [], activities = [] } = data;
  
  if (!date || !id_user) {
    throw new Error('Обязательные поля: date и id_user');
  }

  await pool.query('BEGIN');

  // 1. Сохраняем основную запись
  const diaryResult = await pool.query(
    `INSERT INTO dnevnik (date, time, id_user) 
     VALUES ($1, $2, $3) RETURNING id`,
    [date, time || null, id_user]
  );
  const diaryId = diaryResult.rows[0].id;

  // 2. Сохраняем активности
  for (const activity of activities) {
    // Проверка существования активности
    const activityExists = await pool.query(
      'SELECT id FROM activities WHERE id = $1',
      [activity.id_active]
    );
    
    if (activityExists.rowCount === 0) {
      throw new Error(`Активность с ID ${activity.id_active} не найдена`);
    }

    await pool.query(
      `INSERT INTO dnevn_active (id_active, id_dnevnik, minute) 
       VALUES ($1, $2, $3) RETURNING id`,
      [activity.id_active, diaryId, activity.minute]
    );
  }

  await pool.query('COMMIT');
  
  return { 
    success: true,
    message: 'Данные дневника успешно сохранены',
    diaryId
  };
};

exports.getUserDiary = async (userId) => {
  // Получаем записи дневника
  const entries = await pool.query(
    `SELECT * FROM dnevnik WHERE id_user = $1 ORDER BY date DESC, time DESC`,
    [userId]
  );
  
  // Получаем детали для каждой записи
  return Promise.all(
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
};