import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

function FitnessArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState({ title: '', content: '', image_url: '' });
  const [editing, setEditing] = useState(false);

  // Загрузка статьи
  useEffect(() => {
    axios.get(`http://localhost:5050/api/admin/articles/${id}`)
      .then(response => setArticle(response.data))
      .catch(error => console.error('Ошибка при загрузке статьи:', error));
  }, [id]);

  // Обновление статьи
  const updateArticle = async () => {
    try {
      await axios.put(`http://localhost:5050/api/admin/articles/${id}`, article);
      alert('Статья обновлена!');
      setEditing(false); // Закрываем режим редактирования
    } catch (error) {
      console.error('Ошибка при обновлении статьи:', error);
    }
  };

  return (
    <section className="mt-7">
      <div className="col d-flex justify-content-end mb-3">
        <Link to="/..." className="link-button">Дневник питания</Link>
        <Link to="/..." className="link-button">Расчет калорий</Link>
        <Link to="/" className="link-button">Главная</Link>
      </div>
      <h2 className="mb-3 text-center">
        {editing ? (
          <input
            type="text"
            value={article.title}
            onChange={(e) => setArticle({ ...article, title: e.target.value })}
          />
        ) : (
          article.title
        )}
      </h2>

      <div className="row align-items-center">
        <div className="col-md-6 d-flex justify-content-center">
          <img
            src={article.image_url}
            alt="Картинка"
            className="foto img-fluid rounded"
            style={{ maxWidth: '50%', height: 'auto' }}
          />
        </div>
        <div className="col-md-6 d-flex align-items-center">
          <div style={{ marginLeft: '20px', maxWidth: '90%' }}>
            {editing ? (
              <>
                <textarea
                  value={article.content}
                  onChange={(e) => setArticle({ ...article, content: e.target.value })}
                  style={{ width: '100%', height: '200px' }}
                />
                <input
                  type="text"
                  value={article.image_url}
                  onChange={(e) => setArticle({ ...article, image_url: e.target.value })}
                  placeholder="URL изображения"
                />
                <button onClick={updateArticle}>Сохранить</button>
              </>
            ) : (
              <p className="mt-3 text-center" style={{ fontSize: '20px', fontFamily: 'Abhaya Libre' }}>
                {article.content}
              </p>
            )}
          </div>
        </div>
      </div>
      <button onClick={() => setEditing(!editing)}>
        {editing ? 'Отменить редактирование' : 'Редактировать статью'}
      </button>
    </section>
  );
}

export default FitnessArticle;