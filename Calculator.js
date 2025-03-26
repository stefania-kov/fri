import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Calculator = ({ mealType, onUpdate }) => {
  const [formData, setFormData] = useState({
    product: '',
    search: '',
    weight: '',
    newProduct: '',
    newProductCalories: '',
    newProductProteins: '',
    newProductFats: '',
    newProductCarbs: ''
  });
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [addedProducts, setAddedProducts] = useState([]);
  const [calculationResult, setCalculationResult] = useState(null);

  // Защищённая функция форматирования чисел
  const safeToFixed = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  // Обработчик изменений
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Выбор продукта из списка
  const handleProductClick = (product) => {
    setFormData(prev => ({
      ...prev,
      product: product.name,
      search: ''
    }));
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setShowAddProductForm(false);
    setError(null);
    setSuccessMessage('');
  };

  // Загрузка продуктов
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError(`Ошибка загрузки: ${error.message}`);
        console.error("Ошибка загрузки продуктов:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Фильтрация продуктов
  useEffect(() => {
    const filtered = products.filter(p => 
      p?.name?.toLowerCase().includes(formData.search.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [formData.search, products]);

  // Добавление нового продукта
  const addNewProduct = async () => {
    const { newProduct, newProductCalories, newProductProteins, newProductFats, newProductCarbs } = formData;
    
    if (!newProduct || !newProductCalories || !newProductProteins || !newProductFats || !newProductCarbs) {
      setError("Все поля обязательны для заполнения");
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct,
          caloriesper100g: parseFloat(newProductCalories),
          proteins: parseFloat(newProductProteins),
          fats: parseFloat(newProductFats),
          carbohydrates: parseFloat(newProductCarbs)
        })
      });

      if (!response.ok) throw new Error('Ошибка при добавлении продукта');

      const addedProduct = await response.json();
      setProducts([...products, addedProduct]);
      setSuccessMessage('Продукт успешно добавлен');
      setFormData(prev => ({
        ...prev,
        newProduct: '',
        newProductCalories: '',
        newProductProteins: '',
        newProductFats: '',
        newProductCarbs: ''
      }));
    } catch (error) {
      setError(error.message);
    }
  };

  // Добавление продукта в расчёт
  const addProductToCalculation = () => {
    const selectedProduct = products.find(p => p.name === formData.product);
    const weightValue = Number(formData.weight);
  if (isNaN(weightValue) || weightValue <= 0) {
    setError("Введите корректное количество грамм (больше 0)");
    return;
  }

    const weightRatio = weightValue / 100;
    const calculated = {
      calories: (selectedProduct.caloriesper100g || 0) * weightRatio,
      proteins: (selectedProduct.proteins || 0) * weightRatio,
      fats: (selectedProduct.fats || 0) * weightRatio,
      carbs: (selectedProduct.carbohydrates || 0) * weightRatio
    };

    setAddedProducts([...addedProducts, {
      product: selectedProduct,
      weight: weightValue,
      ...calculated
    }]);
    setFormData(prev => ({ ...prev, product: '', weight: '' }));
    setError(null);
    setCalculationResult(null); // Сбрасываем предыдущие результаты
  };

  /// Подсчёт итоговых значений
const calculateTotalNutrients = () => {
  if (addedProducts.length === 0) {
    setError("Добавьте продукты для расчёта");
    return;
  }

  const totals = addedProducts.reduce((acc, item) => ({
    calories: (acc.calories || 0) + (item.calories || 0),
    proteins: (acc.proteins || 0) + (item.proteins || 0),
    fats: (acc.fats || 0) + (item.fats || 0),
    carbs: (acc.carbs || 0) + (item.carbs || 0)
  }), { calories: 0, proteins: 0, fats: 0, carbs: 0 });

  // Сохраняем результаты расчёта
  setCalculationResult({
    totals,
    products: [...addedProducts] // Создаём копию массива
  });

  // Передаём данные родительскому компоненту
  onUpdate(totals.calories, addedProducts.map(item => ({
    id: item.product.id,
    name: item.product.name,
    gramovka: Number(item.weight) // Явное преобразование и правильное имя поля
  })));

  // Очищаем список добавленных продуктов
  setAddedProducts([]);
  setError(null);
};
  // Модальное окно добавления продукта
  const addProductModal = createPortal(
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Добавить новый продукт</h2>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <div className="form-group">
          <label>Название продукта:</label>
          <input
            type="text"
            name="newProduct"
            value={formData.newProduct}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Калории (на 100г):</label>
          <input
            type="number"
            name="newProductCalories"
            value={formData.newProductCalories}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Белки (г):</label>
          <input
            type="number"
            name="newProductProteins"
            value={formData.newProductProteins}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Жиры (г):</label>
          <input
            type="number"
            name="newProductFats"
            value={formData.newProductFats}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Углеводы (г):</label>
          <input
            type="number"
            name="newProductCarbs"
            value={formData.newProductCarbs}
            onChange={handleChange}
          />
        </div>
        
        <div className="modal-actions">
          <button onClick={addNewProduct}>Добавить</button>
          <button onClick={handleCloseModal}>Отмена</button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );

  return (
    <div className="calculator-container">
      {isLoading ? (
        <div className="loading">Загрузка продуктов...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="search-section">
            <input
              type="text"
              name="search"
              placeholder="Поиск продукта"
              value={formData.search}
              onChange={handleChange}
              className="search-input"
            />
            
            {formData.search && (
              <div className="search-results">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      className="product-item"
                      onClick={() => handleProductClick(p)}
                    >
                      {p.name}
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>Ничего не найдено</p>
                    <button 
                      onClick={() => setShowAddProductForm(true)}
                      className="add-product-btn"
                    >
                      Добавить новый продукт
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="selected-product-section">
            <div className="selected-product">
              <label>Выбранный продукт: {formData.product}</label>
              <input
                type="number"
                name="weight"
                placeholder="Вес (г)"
                value={formData.weight}
                onChange={handleChange}
                className="weight-input"
              />
              <button 
                onClick={addProductToCalculation}
                disabled={!formData.product || !formData.weight}
                className="add-btn"
              >
                Добавить к расчёту
              </button>
            </div>
          </div>

          <div className="added-products-section">
            <h3>Добавленные продукты:</h3>
            {addedProducts.length > 0 ? (
              <ul className="products-list">
                {addedProducts.map((item, index) => (
                  <li key={index} className="product-item">
                    <span className="product-name">{item.product.name}</span>
                    <span className="product-weight">{item.weight}г</span>
                    <span className="product-calories">
                      {safeToFixed(item.calories)} ккал
                    </span>
                    <span className="product-nutrients">
                      Б: {safeToFixed(item.proteins)}г, Ж: {safeToFixed(item.fats)}г, У: {safeToFixed(item.carbs)}г
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-products">Нет добавленных продуктов</p>
            )}
          </div>

          {calculationResult && (
            <div className="calculation-result">
              <h3>Результаты расчёта:</h3>
              <p>Общее количество калорий: {safeToFixed(calculationResult.totals.calories)}</p>
              <p>Белки: {safeToFixed(calculationResult.totals.proteins)}г</p>
              <p>Жиры: {safeToFixed(calculationResult.totals.fats)}г</p>
              <p>Углеводы: {safeToFixed(calculationResult.totals.carbs)}г</p>
              <h4>Использованные продукты:</h4>
              <ul>
                {calculationResult.products.map((item, index) => (
                  <li key={index}>
                    {item.product.name} - {item.weight}г
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="calculate-section">
            <button
              onClick={calculateTotalNutrients}
              disabled={addedProducts.length === 0}
              className="calculate-btn"
            >
              Подсчитать калории
            </button>
          </div>

          {showAddProductForm && addProductModal}
        </>
      )}
    </div>
  );
};

export default Calculator;