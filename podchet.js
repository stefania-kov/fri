import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Calculator from './Calculator';
import ActivityTracker from './ActivityTracker';
import './calculator.css';
import axios from 'axios';

const Podchet = () => {
  const [mealType, setMealType] = useState('Завтрак');
  const [calculatorCalories, setCalculatorCalories] = useState(0);
  const [activityCalories, setActivityCalories] = useState(0);
  const [products, setProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Проверка авторизации при монтировании
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleCalculatorData = useCallback((calories, products) => {
    setProducts(products.filter(p => p?.id));
    setCalculatorCalories(calories);
  }, []);

  const handleActivityData = useCallback((calories, activities) => {
    setActivities(activities.filter(a => a?.id));
    setActivityCalories(calories);
  }, []);

  const saveData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!user || !token) {
        throw new Error('Требуется авторизация');
      }

      if (products.length === 0 && activities.length === 0) {
        throw new Error('Добавьте хотя бы один продукт или активность');
      }

      // Подготовка данных для сервера
      const requestData = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false }),
        id_user: user.id,                     // было userId → должно быть id_user
        mealType,                             // если в базе нет такого поля, удалите
        products: products.map(p => ({
          id_product: p.id,                   // было productId → должно быть id_product
          gramovka: p.gramovka || p.amount
        })),
        activities: activities.map(a => ({
          id_active: a.id,                    // было activityId → должно быть id_active
          minute: a.duration                  // было minutes → должно быть minute
        }))
      };

      console.log('Отправка данных на сервер:', requestData);

      // Отправка данных
      const response = await axios.post('http://localhost:5050/api/dnevnik', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Ответ сервера:', response.data);

      // Локальное сохранение
      const diaryEntry = {
        ...response.data,
        products,
        activities,
        consumedCalories: calculatorCalories,
        burnedCalories: activityCalories,
        netCalories: calculatorCalories - activityCalories,
        date: requestData.date,
        time: requestData.time,
        mealType
      };

      const diary = JSON.parse(localStorage.getItem('foodDiary')) || [];
      localStorage.setItem('foodDiary', JSON.stringify([...diary, diaryEntry]));

      navigate('/dnevnik');
    } catch (err) {
      console.error('Полная ошибка:', err);
      console.error('Детали ошибки:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      let errorMessage = 'Ошибка при сохранении данных';
      if (err.response) {
        errorMessage = err.response.data?.message || 
                      `Ошибка сервера: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Сервер не отвечает';
      }

      setError(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Учёт питания</h1>
      
      <div className="meal-type">
        <label>Приём пищи:</label>
        {['Завтрак', 'Обед', 'Ужин', 'Перекус'].map(type => (
          <button
            key={type}
            className={mealType === type ? 'active' : ''}
            onClick={() => setMealType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="columns">
        <div className="column">
          <Calculator 
            mealType={mealType}
            onUpdate={handleCalculatorData}
          />
        </div>
        
        <div className="column">
          <ActivityTracker
            mealType={mealType}
            onUpdate={handleActivityData}
          />
        </div>
      </div>

      <div className="save-area">
        {error && (
          <div className="error">
            {error}
            {error.includes('авторизация') && (
              <button 
                onClick={() => navigate('/')}
                className="login-redirect"
              >
                Войти в систему
              </button>
            )}
          </div>
        )}
        
        <button
          onClick={saveData}
          disabled={(products.length === 0 && activities.length === 0) || isLoading}
          className={`save-btn ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Сохранение...
            </>
          ) : (
            'Сохранить в дневник'
          )}
        </button>
      </div>
    </div>
  );
};

export default Podchet;