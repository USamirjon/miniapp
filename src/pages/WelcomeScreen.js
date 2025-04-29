import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
    const navigate = useNavigate();

    const handleContinue = () => {
        localStorage.setItem('hasVisited', 'true');
        window.location.href = '/';
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center text-center px-3" style={{ minHeight: '100vh' }}>
            <img
                src="/hamster.png"
                alt="Хомяк"
                className="img-fluid"
                style={{ maxWidth: '200px', height: 'auto', marginBottom: 20 }}
            />
            <h2>Добро пожаловать!</h2>
            <p style={{ maxWidth: 400 }}>
                Мы рады видеть тебя в нашем приложении 🐹. Здесь ты найдешь множество интересных курсов и уроков.
            </p>
            <Button onClick={handleContinue} variant="primary">Начать</Button>
        </div>
    );
};

export default WelcomeScreen;
