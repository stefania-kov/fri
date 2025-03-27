const { pool } = require('../server'); // Импортируем pool из server.js
const validateNumber = (value, fieldName) => {
  if (isNaN(value)) {
    throw new Error(`Поле ${fieldName} должно быть числом`);
  }
  if (value < 0) {
    throw new Error(`Поле ${fieldName} не может быть отрицательным`);
  }
};

exports.getAllProducts = async () => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  return rows;
};

exports.createProduct = async (productData) => {
  const { name, calories, proteins, fats, carbs } = productData;
  
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
  
  return rows[0];
};