import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Image, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {URL} from '../domain.ts'


const defaultAvatars = [
    'https://i.pravatar.cc/100?u=user1',
    'https://i.pravatar.cc/100?u=user2',
    'https://i.pravatar.cc/100?u=user3',
    'https://i.pravatar.cc/100?u=user4',
    'https://i.pravatar.cc/100?u=user5'
];

const Profile = ({ theme, avatar, setAvatar }) => {
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    const [user, setUser] = useState(null);
    const [showAvatars, setShowAvatars] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
            setError('Telegram WebApp недоступен');
            return;
        }

        tg.expand();

        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser?.id) {
            fetchUserFromBackend(tgUser.id);
        } else {
            setError('Пользователь Telegram не найден');
        }
    }, []);

    const fetchUserFromBackend = async (telegramId) => {
        try {
            const res = await axios.get(URL + 'api/Users', {
                params: { telegramId }
            });

            const data = res.data;
            const userData = {
                name: `${data.firstName} ${data.lastName}`,
                username: data.userName,
                telegramId: data.telegramId,
                avatar: data.avatar || defaultAvatars[0],
                xp: data.experience,
                maxXp: 20000,
                course: 'Frontend на React',
                lessonsPassed: 7,
                totalLessons: 10,
                correctAnswers: 48,
                totalAnswers: 60,
                level: data.level
            };

            setUser(userData);
            setAvatar(localStorage.getItem('avatar') || userData.avatar);
        } catch (err) {
            console.error('Ошибка при получении данных:', err);
            setError('Не удалось загрузить профиль');
        }
    };

    const selectDefaultAvatar = (url) => setAvatar(url);

    const saveAvatar = () => {
        localStorage.setItem('avatar', avatar);
        setAvatar(avatar); // обновляем глобальный стейт
        setShowAvatars(false);
        navigate(`/profile`);
    };

    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!user) return <div className="text-center mt-5">Загрузка профиля...</div>;

    const xpPercent = Math.round((user.xp / user.maxXp) * 100);
    const lessonsPercent = Math.round((user.lessonsPassed / user.totalLessons) * 100);
    const correctPercent = Math.round((user.correctAnswers / user.totalAnswers) * 100);

    return (
        <div className="container mt-4">
            <Card className={`${cardBg} shadow-sm p-4`}>
                <Row className="align-items-center">
                    <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
                        <Image
                            src={avatar}
                            roundedCircle
                            fluid
                            style={{ width: 100, height: 100, border: '2px solid #ccc' }}
                        />

                        <Button
                            size="sm"
                            variant="outline-secondary"
                            className="mt-2"
                            onClick={() => setShowAvatars(!showAvatars)}
                        >
                            {showAvatars ? 'Скрыть иконки' : 'Выбрать иконку'}
                        </Button>

                        {showAvatars && (
                            <div className="d-flex flex-wrap justify-content-center mt-2 gap-2">
                                {defaultAvatars.map((icon, idx) => (
                                    <Image
                                        key={idx}
                                        src={icon}
                                        roundedCircle
                                        style={{
                                            width: 50,
                                            height: 50,
                                            cursor: 'pointer',
                                            border: avatar === icon ? '2px solid green' : '1px solid #aaa',
                                            transition: 'border-color 0.3s'
                                        }}
                                        onClick={() => selectDefaultAvatar(icon)}
                                        alt={`Avatar ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {showAvatars && avatar && (
                            <Button
                                variant="success"
                                size="sm"
                                className="mt-2"
                                onClick={saveAvatar}
                            >
                                Подтвердить иконку
                            </Button>
                        )}
                    </Col>

                    <Col xs={12} md={9}>
                        <h4>{user.name}</h4>
                        <p><strong>Курс:</strong> {user.course}</p>
                        <p><strong>Username:</strong> @{user.username}</p>
                        <p><strong>Telegram ID:</strong> {user.telegramId}</p>

                        <div className="mb-3">
                            <strong>Уровень: {user.level}</strong>
                        </div>

                        <div className="mb-2">
                            <strong>Опыт: {user.xp}/{user.maxXp}</strong>
                            <ProgressBar now={xpPercent} label={`${xpPercent}%`} className="mt-1" />
                        </div>

                        <div className="mb-2">
                            <strong>Уроки: {user.lessonsPassed}/{user.totalLessons}</strong>
                            <ProgressBar variant="info" now={lessonsPercent} label={`${lessonsPercent}%`} className="mt-1" />
                        </div>

                        <div className="mb-2">
                            <strong>Правильных ответов: {correctPercent}%</strong>
                            <ProgressBar variant="success" now={correctPercent} className="mt-1" />
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Profile;
