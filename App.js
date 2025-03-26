import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom'; 
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Cabinet from './Cabinet';
import FitnessArticle from './components/FitnessArticle';
import FitnessArticle2 from './components/FitnessArticle2';
import MainContent from './MainContent';
import PersonalCabinet from './PersonalCabinet';
import AdminPanel from './components/AdminPanel';
import Dnevnik from './dnevnik';
import Podchet from './podchet';
import Calculator from './Calculator';
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
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/cabinet" element={<Cabinet />} />
        <Route path="/fitness2" element={<FitnessArticle2 />} />
        <Route path="/fitness" element={<FitnessArticle />} />
        <Route path="/personal-cabinet" element={<PersonalCabinet userId={1} />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/dnevnik" element={<Dnevnik />} />
        <Route path="/podchet" element={<Podchet />} />
        <Route path="/admin-panel" element={user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;