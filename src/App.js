import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Cabinet from './Cabinet'; // Импортируйте компонент Cabinet
import FitnessArticle from './components/FitnessArticle'; // Импортируйте компонент FitnessArticle
import FitnessArticle2 from './components/FitnessArticle2'; // Импортируйте компонент FitnessArticle
import MainContent from './MainContent'; // Импортируйте компонент MainContent
import PersonalCabinet from './PersonalCabinet'; // Импортируйте компонент MainContent
import AdminPanel from './components/AdminPanel'; // Импортируем компонент AdminPanel

function Header() {
  return (
    <header className="mb-4">
      <div className="header container d-flex justify-content-center">
        <div className="logo-container d-flex align-items-center">
          <img src="/fotos/logo.png" alt="Логотип" className="logo mr-2" />
          <Link to="/cabinet" className="cabinet-link btn btn-link mr-5" style={{ fontSize: '34px', fontFamily: "'Abhaya Libre', regular" }}>Личный кабинет</Link>  
          <h1>SmartFood</h1>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ marginTop: 'auto' }}>
      <div className="container text-center p-4">
        <p>&copy; 2025</p>
      </div>
    </footer>
  );
}

function App() {
  const user = JSON.parse(localStorage.getItem('user')); // Получаем данные пользователя

  return (
    <Router>
      <>
        <Header />
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/cabinet" element={<Cabinet />} />
          <Route path="/fitness2" element={<FitnessArticle2 />} />
          <Route path="/fitness" element={<FitnessArticle />} />
          <Route path="/personal-cabinet" element={<PersonalCabinet userId={1} />} />
          <Route path="/admin-panel" element={user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />}
          />
        </Routes>
        <Footer />
      </>
    </Router>
  );
}

export default App;
