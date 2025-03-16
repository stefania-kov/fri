import React from 'react';
import { Link } from 'react-router-dom';

function MainContent() {
  return (
    <main className="container text-center">
      <div className="col d-flex justify-content-end mb-3">
      <Link to="/..." className="link-button">Дневник питания</Link>
      <Link to="/..." className="link-button">Расчет калорий</Link>
      </div>
      <div className="main-content">
        <img src="/fotos/фото1.svg" className="img-fluid rounded" alt="основное фото" style={{ marginTop: '45px' }} />
        <div className="d-flex flex-column align-items-center">
          <h2>Умное питание для умных решений</h2>
          <div className="row no-gutters justify-content-center">
            <div className="col-md-6 mb-3 d-flex justify-content-center">
              <div className="card" style={{ width: '18rem' }}>
                <img src="/fotos/mol1.svg" className="card-img img-fluid" alt="Молочная продукция" />
                <div className="card-body">
                  <h4 className="card-title">Молочная продукция</h4>
                  <Link to="/fitness2" className="link-button">Читать подробнее</Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3 d-flex justify-content-center">
              <div className="card" style={{ width: '18rem' }}>
                <img src="/fotos/fit2.svg" className="card-img img-fluid" alt="Фитнес" />
                <div className="card-body">
                  <h4 className="card-title">Фитнес</h4>
                  <Link to="/fitness" className="link-button">Читать подробнее</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <h3>Приводим питание в порядок</h3>
      </div>
    </main>
  );
}

export default MainContent;