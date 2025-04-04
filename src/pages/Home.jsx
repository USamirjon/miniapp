import React from 'react';
import ProgressBar from '../components/ProgressBar';

const Home = () => {
    const xp = 180;

    const theme = localStorage.getItem('theme') || 'light';
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';

    return (
        <div className={`card ${cardBg} p-4 shadow rounded`}>
            <h2 className="mb-3">👋 Добро пожаловать в курс!</h2>
            <p className="mb-4">Изучайте теорию, смотрите видеоуроки и проходите тесты, чтобы прокачиваться и набирать опыт.</p>

            <ProgressBar xp={xp} />
        </div>
    );
};

export default Home;
