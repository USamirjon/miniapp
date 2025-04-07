import React, { useEffect } from 'react';
import ProgressBar from '../components/ProgressBar';

const Home = () => {
    const xp = 180;

    const theme = localStorage.getItem('theme') || 'light';
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
            console.error("Telegram WebApp not found");
            return;
        }

        tg.expand();
        const user = tg.initDataUnsafe?.user;

        if (user) {
            sendUserToBackend(user);
        } else {
            console.warn("No Telegram user found");
        }
    }, []);

    const sendUserToBackend = async (user) => {
        try {
            await fetch('http://localhost:5176/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId: user.id,
                    firstname: user.first_name,
                    lastname: user.last_name,
                    username: user.username
                }),
            });
        } catch (err) {
            console.error("Failed to send user data:", err);
        }
    };

    return (
        <div className={`card ${cardBg} p-4 shadow rounded`}>
            <h2 className="mb-3">👋 Добро пожаловать в курс!</h2>
            <p className="mb-4">
                Изучайте теорию, смотрите видеоуроки и проходите тесты, чтобы прокачиваться и набирать опыт.
            </p>

            <ProgressBar xp={xp} />
        </div>
    );
};

export default Home;
