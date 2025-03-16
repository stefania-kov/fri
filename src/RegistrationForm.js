import React, { useState } from 'react';
import axios from 'axios';

const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Состояние для успешного сообщения

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }

    try {
      // Отправка данных на сервер
      const response = await axios.post('http://localhost:5050/api/auth/register', {
        username,
        email,
        password,
      });

      // Устанавливаем сообщение об успешной регистрации
      if (response.data.emailSent) {
        setSuccessMessage('Пользователь зарегистрирован. Письмо с подтверждением отправлено на вашу почту.');
      } else {
        setSuccessMessage('Пользователь зарегистрирован.');
      }

      // Очищаем ошибки и поля формы
      setError('');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Обработка ошибок
      setError(error.response?.data?.error || 'Ошибка при регистрации');
      setSuccessMessage(''); // Очищаем сообщение об успехе, если есть ошибка
    }
  };

  return (
    <div className="auth-form">
      <h2 className="text-center">Регистрация</h2>

      {/* Отображение ошибки */}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {/* Отображение успешного сообщения */}
      {successMessage && (
        <p style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>
      )}

      {/* Форма регистрации */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reg-username">Никнейм:</label>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-email">Email:</label>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-password">Пароль:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-confirm-password">Подтвердите пароль:</label>
          <input
            type="password"
            id="reg-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group text-center">
          <button type="submit" className="submit-button">Зарегистрироваться</button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;