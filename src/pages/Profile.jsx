import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Image, Form, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

const defaultAvatars = [
    'https://i.pravatar.cc/100?u=user1',
    'https://i.pravatar.cc/100?u=user2',
    'https://i.pravatar.cc/100?u=user3',
    'https://i.pravatar.cc/100?u=user4',
    'https://i.pravatar.cc/100?u=user5'
];

const Profile = ({ theme }) => {
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    const [user, setUser] = useState(null);
    const [avatar, setAvatar] = useState('');
    const [showAvatars, setShowAvatars] = useState(false);

    useEffect(() => {
        // Пример запроса к API (замени на свой эндпоинт)
        axios.get('/api/profile') // <--- заменишь на свой URL
            .then(res => {
                const data = res.data;
                setUser(data);
                setAvatar(localStorage.getItem('avatar') || data.avatar);
            })
            .catch(err => {
                console.error('Ошибка загрузки профиля', err);
                // Фолбэк
                setUser({
                    name: 'Иван',
                    avatar: defaultAvatars[0],
                    xp: 250,
                    maxXp: 500,
                    course: 'Frontend на React',
                    lessonsPassed: 7,
                    totalLessons: 10,
                    correctAnswers: 48,
                    totalAnswers: 60
                });
                setAvatar(defaultAvatars[0]);
            });
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
                localStorage.setItem('avatar', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const selectDefaultAvatar = (url) => {
        setAvatar(url);
    };

    const saveAvatar = () => {
        localStorage.setItem('avatar', avatar); // Сохраняем выбор в localStorage
        setShowAvatars(false); // Закрываем выбор иконки
    };

    if (!user) return <div className="text-center mt-5">Загрузка профиля...</div>;

    const xpPercent = Math.round((user.xp / user.maxXp) * 100);
    const lessonsPercent = Math.round((user.lessonsPassed / user.totalLessons) * 100);
    const correctPercent = Math.round((user.correctAnswers / user.totalAnswers) * 100);

    // Вычисление уровня на основе опыта
    const level = Math.floor(user.xp / 100);

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
                        <Form.Group className="mt-2">
                            <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} />
                        </Form.Group>

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

                        <div className="mb-3">
                            <strong>Уровень: {level}</strong>
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
