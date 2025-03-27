const { pool } = require('../server');

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
  const { 
    name, 
    caloriesper100g: calories,
    proteins, 
    fats, 
    carbohydrates: carbs
  } = productData;
  
  // Проверка наличия всех обязательных полей
  if (!name) throw new Error('Не указано название продукта (name)');
  if (!calories) throw new Error('Не указаны калории (calories)');
  if (!proteins) throw new Error('Не указаны белки (proteins)');
  if (!fats) throw new Error('Не указаны жиры (fats)');
  if (!carbs) throw new Error('Не указаны углеводы (carbs)');
  
  // Валидация числовых полей
  validateNumber(calories, 'calories');
  validateNumber(proteins, 'proteins');
  validateNumber(fats, 'fats');
  validateNumber(carbs, 'carbs');

  // Вставка в базу данных
  const { rows } = await pool.query(
    `INSERT INTO products 
     (name, caloriesper100g, proteins, fats, carbohydrates) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, calories, proteins, fats, carbs]
  );
  
  return rows[0];
};
