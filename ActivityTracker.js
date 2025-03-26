import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

const ActivityTracker = ({ mealType, onUpdate }) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityDuration, setActivityDuration] = useState('');
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [activityHistory, setActivityHistory] = useState([]);
  const [activitySearch, setActivitySearch] = useState('');
  const [showAddActivityForm, setShowAddActivityForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityCaloriesPerMinute, setNewActivityCaloriesPerMinute] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных активностей из API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/activities');
        setActivities(response.data);
        setFilteredActivities(response.data);
      } catch (err) {
        setError('Не удалось загрузить список активностей');
        console.error('Ошибка загрузки активностей:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Фильтрация активностей
  useEffect(() => {
    const filtered = activities.filter(a => 
      a?.name?.toLowerCase().includes(activitySearch.toLowerCase())
    );
    setFilteredActivities(filtered);
  }, [activitySearch, activities]);

  // Обновление данных в родительском компоненте
  const updateParent = useCallback(() => {
    if (onUpdate) {
      const formattedActivities = activityHistory.map(activity => ({
        id_active: activity.id,
        minute: activity.duration
      }));
      
      onUpdate(totalCaloriesBurned, formattedActivities);
    }
  }, [totalCaloriesBurned, activityHistory, onUpdate]);

  useEffect(() => {
    updateParent();
  }, [updateParent]);

  const addActivity = () => {
    const duration = parseInt(activityDuration, 10);

    if (!selectedActivity) {
      setError('Пожалуйста, выберите активность');
      return;
    }

    if (!activityDuration || isNaN(duration)) {
      setError('Пожалуйста, введите корректную длительность');
      return;
    }

    if (duration <= 0) {
      setError('Длительность должна быть положительным числом');
      return;
    }

    const caloriesBurned = selectedActivity.calories_per_minute * duration;
    
    const newActivity = {
      id: selectedActivity.id,
      name: selectedActivity.name,
      duration: duration,
      caloriesBurned: caloriesBurned,
      mealType: mealType,
      calories_per_minute: selectedActivity.calories_per_minute
    };
    
    setActivityHistory(prev => [...prev, newActivity]);
    setTotalCaloriesBurned(prev => prev + caloriesBurned);
    setSelectedActivity(null);
    setActivityDuration('');
    setError(null);
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setActivitySearch('');
  };

  const addActivityToDB = async () => {
    const calories = parseFloat(newActivityCaloriesPerMinute);

    if (!newActivityName.trim()) {
      setError('Пожалуйста, введите название активности');
      return;
    }

    if (isNaN(calories)) {
      setError('Пожалуйста, введите корректное количество калорий');
      return;
    }

    if (calories <= 0) {
      setError('Калории должны быть положительным числом');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('/api/activities', {
        name: newActivityName.trim(),
        calories_per_minute: calories
      });

      const newActivity = response.data;
      
      setActivities(prev => [...prev, newActivity]);
      setFilteredActivities(prev => [...prev, newActivity]);
      setSuccessMessage('Активность успешно добавлена!');
      setError(null);
      setShowAddActivityForm(false);
      setNewActivityName('');
      setNewActivityCaloriesPerMinute('');
    } catch (err) {
      setError('Не удалось добавить активность');
      console.error('Ошибка добавления активности:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addActivityModal = createPortal(
    <div className="modal-overlay" onClick={() => setShowAddActivityForm(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="add-activity-form">
          <h2>Добавить активность</h2>
          <label>
            Название:
            <input
              type="text"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              placeholder="Например: Йога"
            />
          </label>
          <label>
            Калории за минуту:
            <input
              type="number"
              value={newActivityCaloriesPerMinute}
              onChange={(e) => setNewActivityCaloriesPerMinute(e.target.value)}
              step="0.1"
              min="0.1"
              placeholder="Например: 5.5"
            />
          </label>
          <div className="form-buttons">
            <button onClick={addActivityToDB} disabled={isLoading}>
              {isLoading ? 'Добавление...' : 'Добавить'}
            </button>
            <button onClick={() => setShowAddActivityForm(false)} disabled={isLoading}>
              Отмена
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );

  if (isLoading && activities.length === 0) {
    return <div className="loading">Загрузка активностей...</div>;
  }

  return (
    <div className="activity-tracker">
      <h2>Трекер активности</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="activity-search">
        <label>
          Поиск активности:
          <input
            type="text"
            placeholder="Введите название активности"
            value={activitySearch}
            onChange={(e) => setActivitySearch(e.target.value)}
            disabled={isLoading}
          />
        </label>
        
        {activitySearch.length > 0 && (
          filteredActivities.length > 0 ? (
            <ul className="search-results">
              {filteredActivities.map((activity) => (
                <li 
                  key={activity.id} 
                  className="search-result" 
                  onClick={() => !isLoading && handleActivityClick(activity)}
                >
                  {activity.name} ({activity.calories_per_minute} ккал/мин)
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">
              <p>
                Ничего не найдено{' '}
                <span 
                  className="add-activity-link" 
                  onClick={() => !isLoading && setShowAddActivityForm(true)}
                >
                  Не нашли активность? Добавьте её!
                </span>
              </p>
            </div>
          )
        )}
      </div>

      {selectedActivity && (
        <div className="selected-activity">
          <h3>Выбранная активность:</h3>
          <p>
            {selectedActivity.name} ({selectedActivity.calories_per_minute} ккал/мин)
          </p>
        </div>
      )}

      <div className="activity-duration">
        <label>
          Длительность (минуты):
          <input
            type="number"
            value={activityDuration}
            onChange={(e) => setActivityDuration(e.target.value)}
            min="1"
            placeholder="Например: 30"
            disabled={isLoading || !selectedActivity}
          />
        </label>
        <button 
          onClick={addActivity} 
          disabled={isLoading || !selectedActivity || !activityDuration}
        >
          {isLoading ? 'Обработка...' : 'Добавить активность'}
        </button>
      </div>

      {showAddActivityForm && addActivityModal}

      <div className="activity-history">
        <h3>История активностей:</h3>
        {activityHistory.length > 0 ? (
          <ul>
            {activityHistory.map((activity, index) => (
              <li key={`${activity.id}-${index}`}>
                {activity.name} - {activity.duration} мин - {activity.caloriesBurned.toFixed(1)} ккал
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет добавленных активностей</p>
        )}
      </div>

      <div className="total-calories">
        <p>Всего сожжено калорий: {totalCaloriesBurned.toFixed(1)}</p>
      </div>
    </div>
  );
};

export default ActivityTracker;