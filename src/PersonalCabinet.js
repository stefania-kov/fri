import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './PersonalCabinet.css';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Импортируем Link

function PersonalCabinet() {
  const [user, setUser] = useState({
    username: '',
    gender: '',
    height: '',
    age: '',
    weight: '',
    activity: '',
    photo: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const initialUserData = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
          setErrorMessage('Данные пользователя не найдены. Пожалуйста, войдите в систему.');
          return;
        }

        const response = await axios.get(`http://localhost:5050/api/user/${userData.id}`);
        setUser(response.data);
        initialUserData.current = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        setErrorMessage('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      }
    };

    fetchUserData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Проверяем, что все числовые поля содержат допустимые значения
    if (isNaN(user.height) || isNaN(user.age) || isNaN(user.weight)) {
      setErrorMessage('Пожалуйста, введите корректные числовые значения для роста, возраста и веса.');
      return;
    }

    const updatedData = {
      gender: user.gender,
      height: parseFloat(user.height),
      age: parseInt(user.age),
      weight: parseFloat(user.weight),
      activity: user.activity,
    };

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        setErrorMessage('Данные пользователя не найдены. Пожалуйста, войдите в систему.');
        return;
      }

      const response = await axios.put(`http://localhost:5050/api/user/${userData.id}`, updatedData);

      setUser(response.data);
      setIsEditing(false);
      setSuccessMessage('Данные успешно сохранены!');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
      setErrorMessage('Ошибка при обновлении данных. Пожалуйста, проверьте введенные данные и попробуйте снова.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMessage('');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Недопустимый тип файла. Разрешены только изображения.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        setErrorMessage('Данные пользователя не найдены. Пожалуйста, войдите в систему.');
        return;
      }

      const response = await axios.post(
        `http://localhost:5050/api/user/${userData.id}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUser({ ...user, photo: response.data.photo });
      setSuccessMessage('Фото успешно загружено!');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
      setErrorMessage('Ошибка при загрузке фото. Пожалуйста, попробуйте снова.');
    }
  };

  // Функция для обработки изменений в числовых полях
  const handleNumberChange = (field, value) => {
    // Если значение пустое, устанавливаем пустую строку
    if (value === '') {
      setUser({ ...user, [field]: '' });
    } else {
      // Пытаемся преобразовать значение в число
      const numberValue = parseFloat(value);
      if (!isNaN(numberValue)) {
        setUser({ ...user, [field]: numberValue });
      }
    }
  };

  return (
    <div className="personal-cabinet">
            <div className="col d-flex justify-content-end mb-3">
        <Link to="/..." className="link-button">Дневник питания</Link>
        <Link to="/..." className="link-button">Расчет калорий</Link>
        <Link to="/" className="link-button">Главная</Link>
      </div>
      <div className="photo-container">
        <div className="photo-circle">
          {user.photo ? (
            <img src={`http://localhost:5050/uploads/${user.photo}`} alt="Фото профиля" className="profile-photo" />
          ) : (
            <FaUserCircle className="profile-icon" />
          )}
        </div>
      </div>

      <div className="user-data">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="edit-form">
            <label>
              Никнейм:
              <input
                type="text"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                className="editing-input"
              />
            </label>
            <label>
              Пол:
              <select
                value={user.gender}
                onChange={(e) => setUser({ ...user, gender: e.target.value })}
                className="editing-input"
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
            </label>
            <label>
              Рост (см):
              <input
                type="number"
                value={user.height}
                onChange={(e) => handleNumberChange('height', e.target.value)}
                step="0.1"
                className="editing-input"
              />
            </label>
            <label>
              Возраст:
              <input
                type="number"
                value={user.age}
                onChange={(e) => handleNumberChange('age', e.target.value)}
                className="editing-input"
              />
            </label>
            <label>
              Вес (кг):
              <input
                type="number"
                value={user.weight}
                onChange={(e) => handleNumberChange('weight', e.target.value)}
                step="0.1"
                className="editing-input"
              />
            </label>
            <div className="form-buttons">
              <button type="submit">Сохранить</button>
              <button type="button" onClick={handleCancel}>Отмена</button>
            </div>
          </form>
        ) : (
          <div className="display-data">
            <p>Никнейм: {user.username}</p>
            <p>Пол: {user.gender === 'male' ? 'Мужской' : user.gender === 'female' ? 'Женский' : 'Другой'}</p>
            <p>Рост: {user.height} см</p>
            <p>Возраст: {user.age} лет</p>
            <p>Вес: {user.weight} кг</p>
          </div>
        )}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>

      <div className="buttons-container">
        {!isEditing && (
          <>
            <button onClick={() => setIsEditing(true)}>Редактировать</button>
            <label className="upload-button">
              Загрузить фото профиля
              <input
                type="file"
                onChange={handlePhotoUpload}
                className="photo-upload"
                accept="image/*"
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

export default PersonalCabinet;