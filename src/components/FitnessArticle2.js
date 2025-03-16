import React from 'react';
import './Statia.css';
import { Link } from 'react-router-dom'; // Импортируем Link для навигации

function FitnessArticle2() {
  return (
    <section className="mt-7">
      {/* Кнопки навигации */}
      <div className="col d-flex justify-content-end mb-3">
        <Link to="/..." className="link-button">Дневник питания</Link>
        <Link to="/..." className="link-button">Расчет калорий</Link>
        <Link to="/" className="link-button">Главная</Link>
      </div>

      {/* Заголовок по центру */}
      <h2 className="mb-3 text-center">Статья про молочную продукцию</h2>

      {/* Контент с фото и текстом */}
      <div className="row align-items-center"> {/* Выравниваем содержимое строки по вертикали */}
        {/* Фото сдвинуто правее */}
        <div className="col-md-6 d-flex justify-content-center"> {/* Сдвигаем фото вправо */}
          <img
            src="/fotos/molocka.svg"
            alt="Картинка"
            className="foto img-fluid rounded"
            style={{ maxWidth: '50%', height: 'auto' }} // Уменьшаем размер фото
          />
        </div>

        {/* Текст сдвинут влево и ограничен по ширине */}
        <div className="col-md-6 d-flex align-items-center"> {/* Выравниваем текст по вертикали */}
          <div style={{ marginLeft: '20px', maxWidth: '90%' }}> {/* Сдвиг влево и ограничение ширины */}
            <p className="mt-3 text-center" style={{ fontSize: '20px', fontFamily: 'Abhaya Libre' }}>
              Молоко и молочные продукты — основа сбалансированного рациона. Они содержат значительное количество незаменимых нутриентов, обладают высокой переваримостью.
            </p>
            <p className="mt-2 text-center" style={{ fontSize: '20px', fontFamily: 'Abhaya Libre' }}>
              Взрослому здоровому человеку рекомендуется ежедневно употреблять 2 стакана молока и жидких кисломолочных продуктов, ломтик сыра (20 г), порцию сливочного масла (12 г) и 30 г творога. Употребление молока и молочной продукции ненадлежащего качества может стать причиной возникновения целого ряда заболеваний. В первую очередь — острых кишечных инфекций, так как молочные продукты относятся к скоропортящейся продукции.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FitnessArticle2;