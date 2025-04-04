import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      console.log('Telegram initData:', tg.initData);
      tg.ready();
    }
  }, []);

  return (
      <div className="App container mt-5">
        <div className="card text-center">
          <div className="card-body">
            <h1 className="card-title">Мой Telegram Mini App</h1>
            <p className="card-text">Привет! Это интерфейс на Bootstrap.</p>
            <button className="btn btn-primary">Нажми меня</button>
          </div>
        </div>
      </div>
  );
}

export default App;
