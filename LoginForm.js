import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5050/api/auth/login', {
        email,
        password,
      });

      // Отладка
      console.log('Ответ сервера:', response.data);
      console.log('Роль пользователя:', response.data.user.role);

      // Сохранение токена и данных пользователя в localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Проверка роли пользователя
      if (response.data.user.role.toLowerCase() === 'admin') {
        navigate('/admin-panel'); // Перенаправление на страницу админ-панели
      } else {
        navigate('/personal-cabinet'); // Перенаправление в личный кабинет
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при авторизации');
      console.error('Ошибка при авторизации:', error);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="text-center">Авторизация</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email:</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Пароль:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group text-center">
          <button type="submit" className="submit-button">Войти</button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;