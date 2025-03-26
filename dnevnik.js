import { useState, useEffect } from 'react';
import axios from 'axios';
import './dnevnik.css';

const Dnevnik = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiaryEntries();
  }, []);

  const fetchDiaryEntries = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('Пользователь не авторизован');

      const response = await axios.get(`/api/diary?userId=${userId}`);
      setEntries(response.data);
    } catch (err) {
      console.error('Ошибка загрузки дневника:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5); // Обрезаем секунды
  };

  const calculateTotalCalories = (entry) => {
    return entry.consumedCalories - entry.burnedCalories;
  };

  return (
    <div className="dnevnik-container">
      <h1>Мой дневник питания</h1>
      
      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading">Загрузка данных...</div>
      ) : (
        <div className="entries-list">
          {entries.length === 0 ? (
            <p>Записей пока нет</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="diary-entry">
                <div className="entry-header">
                  <h2>{entry.mealType}</h2>
                  <div className="entry-meta">
                    <span>{formatDate(entry.date)}</span>
                    <span>{formatTime(entry.time)}</span>
                  </div>
                </div>

                <div className="entry-content">
                  <div className="products-section">
                    <h3>Продукты:</h3>
                    <ul>
                      {entry.products.map((product) => (
                        <li key={product.id}>
                          {product.name} - {product.gramovka}г ({product.calories} ккал)
                        </li>
                      ))}
                    </ul>
                    <p>Всего съедено: {entry.consumedCalories} ккал</p>
                  </div>

                  <div className="activities-section">
                    <h3>Активности:</h3>
                    <ul>
                      {entry.activities.map((activity) => (
                        <li key={activity.id}>
                          {activity.name} - {activity.duration} мин ({activity.caloriesBurned} ккал)
                        </li>
                      ))}
                    </ul>
                    <p>Всего сожжено: {entry.burnedCalories} ккал</p>
                  </div>

                  <div className="total-calories">
                    <h3>Итоговый баланс:</h3>
                    <p>{calculateTotalCalories(entry)} ккал</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dnevnik;