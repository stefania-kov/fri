import React, { useState } from 'react';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';
import { Link } from 'react-router-dom'; // Импортируем Link
import './Cabinet.css'; // Импортируйте ваш CSS

function Cabinet() {
  const [isLogin, setIsLogin] = useState(true); // Состояние для переключения между авторизацией и регистрацией

  return (
    <div className="cabinet-container">
      {/* Ссылки в правом верхнем углу */}
      <div className="col d-flex justify-content-end mb-3">
        <Link to="/..." className="link-button">Дневник питания</Link>
        <Link to="/..." className="link-button">Расчет калорий</Link>
        <Link to="/" className="link-button">Главная</Link>
      </div>

      {/* Заголовок по центру */}
      <h2 className="cabinet-title">Добро пожаловать на сайт, Войдите или зарегистрируйтесь!</h2>

      {/* Переключатель между авторизацией и регистрацией */}
      <div className="auth-switch">
        <button
          className={`auth-button ${isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Авторизация
        </button>
        <button
          className={`auth-button ${!isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Регистрация
        </button>
      </div>

      {/* Форма авторизации или регистрации */}
      {isLogin ? <LoginForm /> : <RegistrationForm />}
    </div>
  );
}

export default Cabinet;