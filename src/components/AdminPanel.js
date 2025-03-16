import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const [homeContent, setHomeContent] = useState({ title: '', content: '', image_url: '' });
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Загрузка данных главной страницы
  useEffect(() => {
    axios.get('http://localhost:5050/api/admin/home')
      .then(response => setHomeContent(response.data))
      .catch(error => console.error('Ошибка при загрузке главной страницы:', error));
  }, []);

  // Загрузка статей
  useEffect(() => {
    axios.get('http://localhost:5050/api/admin/articles')
      .then(response => setArticles(response.data))
      .catch(error => console.error('Ошибка при загрузке статей:', error));
  }, []);

  // Загрузка изображения
  const handleImageUpload = async (event, setImageUrl) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:5050/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
    } finally {
      setUploading(false);
    }
  };

  // Обновление главной страницы
  const updateHomeContent = async () => {
    try {
      await axios.put('http://localhost:5050/api/admin/', homeContent);
      alert('Главная страница обновлена!');
    } catch (error) {
      console.error('Ошибка при обновлении главной страницы:', error);
    }
  };

  // Обновление статьи
  const updateArticle = async () => {
    try {
      await axios.put(`http://localhost:5050/api/admin/articles/${selectedArticle.id}`, selectedArticle);
      alert('Статья обновлена!');
    } catch (error) {
      console.error('Ошибка при обновлении статьи:', error);
    }
  };

  // Выход из админ-панели
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="admin-panel">
      <h2>Админ-панель</h2>

      {/* Редактирование главной страницы */}
      <div>
        <h3>Редактирование главной страницы</h3>
        <input
          type="text"
          value={homeContent.title}
          onChange={(e) => setHomeContent({ ...homeContent, title: e.target.value })}
          placeholder="Заголовок"
        />
        <textarea
          value={homeContent.content}
          onChange={(e) => setHomeContent({ ...homeContent, content: e.target.value })}
          placeholder="Контент"
        />
        <input
          type="file"
          onChange={(e) => handleImageUpload(e, (url) => setHomeContent({ ...homeContent, image_url: url }))}
          disabled={uploading}
        />
        {homeContent.image_url && <img src={homeContent.image_url} alt="Загруженное изображение" style={{ width: '100px' }} />}
        <button onClick={updateHomeContent}>Сохранить</button>
      </div>

      {/* Редактирование статей */}
      <div>
        <h3>Редактирование статей</h3>
        <select onChange={(e) => setSelectedArticle(articles[e.target.value])}>
          <option value="">Выберите статью</option>
          {articles.map((article, index) => (
            <option key={article.id} value={index}>{article.title}</option>
          ))}
        </select>
        {selectedArticle && (
          <div>
            <input
              type="text"
              value={selectedArticle.title}
              onChange={(e) => setSelectedArticle({ ...selectedArticle, title: e.target.value })}
              placeholder="Заголовок"
            />
            <textarea
              value={selectedArticle.content}
              onChange={(e) => setSelectedArticle({ ...selectedArticle, content: e.target.value })}
              placeholder="Контент"
            />
            <input
              type="file"
              onChange={(e) => handleImageUpload(e, (url) => setSelectedArticle({ ...selectedArticle, image_url: url }))}
              disabled={uploading}
            />
            {selectedArticle.image_url && <img src={selectedArticle.image_url} alt="Загруженное изображение" style={{ width: '100px' }} />}
            <button onClick={updateArticle}>Сохранить</button>
          </div>
        )}
      </div>

      {/* Кнопка выхода */}
      <button onClick={handleLogout} className="logout-button">Выйти</button>
    </div>
  );
}

export default AdminPanel;