// activityService.js
const { pool } = require('../server'); // Импортируем pool из server.js

const activityService = {
  async getAllActivities() {
    try {
      const query = 'SELECT * FROM activities'; // Запрос к БД для получения всех активностей
      const result = await pool.query(query);
      return result.rows; // Возвращаем массив активностей
    } catch (error) {
      console.error('Ошибка при получении активностей из сервиса:', error);
      throw new Error('Не удалось получить список активностей');
    }
  },

  async createActivity(activityData) {
    try {
      // Валидация входных данных
      if (!activityData.name || typeof activityData.name !== 'string' || activityData.name.trim() === '') {
        throw new Error('Название активности обязательно и должно быть строкой.');
      }
      const caloriesPerMinute = parseFloat(activityData.calories_per_minute);
      if (isNaN(caloriesPerMinute) || caloriesPerMinute <= 0) {
        throw new Error('Калории в минуту должны быть положительным числом.');
      }

      const newActivity = {
        name: activityData.name.trim(),
        calories_per_minute: caloriesPerMinute,
      };

      const query = `
        INSERT INTO activities (name, calories_per_minute)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const values = [newActivity.name, newActivity.calories_per_minute];
      const result = await pool.query(query, values);
      return result.rows[0]; // Возвращаем созданную активность
    } catch (error) {
      console.error('Ошибка при создании активности в сервисе:', error);
      throw error; // Перебрасываем ошибку для обработки в контроллере
    }
  },

  // Другие методы сервиса, если понадобятся
};

module.exports = activityService;
