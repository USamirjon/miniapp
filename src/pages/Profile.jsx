import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Image, Row, Col, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { URL } from '../domain.ts';

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
    const [wallet, setWallet] = useState(null);
    const [showAvatars, setShowAvatars] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return setError('Telegram WebApp недоступен');
        tg.expand();

        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser?.id) {
            fetchUserFromBackend(tgUser.id);
            fetchWallet(tgUser.id);
        } else {
            setError('Пользователь Telegram не найден');
        }
    }, []);

    const fetchUserFromBackend = async (telegramId) => {
        try {
            const res = await axios.get(`${URL}/api/Users`, {
                params: { telegramId }
            });

            setUser(res.data);
            setAvatar(localStorage.getItem('avatar') || res.data.avatar || defaultAvatars[0]);
        } catch (err) {
            console.error('Ошибка при получении данных:', err);
            setError('Не удалось загрузить профиль');
        }
    };

    const fetchWallet = async (telegramId) => {
        try {
            const res = await axios.get(`${URL}/api/Transaction`, {
                params: { telegramId }
            });
            setWallet(res.data);
        } catch (err) {
            console.error('Ошибка при получении баланса:', err);
            setWallet(null);
        }
    };

    const toggleNotifications = async () => {
        try {
            await axios.put(`${URL}/api/Users/notifications`, {
                telegramId: user.telegramId,
                turnNotification: !user.turnNotification
            });

            setUser(prev => ({ ...prev, turnNotification: !prev.turnNotification }));
        } catch (err) {
            console.error('Ошибка переключения уведомлений:', err);
        }
    };

    const changeFrequency = async (e) => {
        const value = parseInt(e.target.value);
        try {
            await axios.put(`${URL}/api/Users/frequency`, {
                telegramId: user.telegramId,
                notificationFrequency: value
            });

            setUser(prev => ({ ...prev, notificationFrequency: value }));
        } catch (err) {
            console.error('Ошибка смены частоты:', err);
        }
    };

    const selectDefaultAvatar = (url) => setAvatar(url);
    const saveAvatar = () => {
        localStorage.setItem('avatar', avatar);
        setAvatar(avatar);
        setShowAvatars(false);
        navigate(`/profile`);
    };

    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!user) return <div className="text-center mt-5">Загрузка профиля...</div>;

    const xpPercent = Math.round((user.experience / 20000) * 100);

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
                        <Button size="sm" variant="outline-secondary" className="mt-2" onClick={() => setShowAvatars(!showAvatars)}>
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
                                            border: avatar === icon ? '2px solid green' : '1px solid #aaa'
                                        }}
                                        onClick={() => selectDefaultAvatar(icon)}
                                    />
                                ))}
                            </div>
                        )}
                        {showAvatars && avatar && (
                            <Button variant="success" size="sm" className="mt-2" onClick={saveAvatar}>
                                Подтвердить иконку
                            </Button>
                        )}
                    </Col>

                    <Col xs={12} md={9}>
                        <h4>{user.realFirstName} {user.realLastName}</h4>
                        <p><strong>Номер:</strong> {user.phone}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Баланс:</strong> 💰 {wallet}</p>
                        <div className="mb-3">
                            <strong>Уровень:</strong> {user.level}
                        </div>

                        <div className="mb-3">
                            <strong>Опыт:</strong> {user.experience}/20000
                            <ProgressBar now={xpPercent} label={`${xpPercent}%`} className="mt-1"/>
                        </div>

                        <Form>
                            <Form.Check
                                type="switch"
                                id="notification-switch"
                                label="Уведомления"
                                checked={user.turnNotification}
                                onChange={toggleNotifications}
                                className="mb-3"
                            />
                            <Form.Group controlId="notif-frequency">
                                <Form.Label>Частота уведомлений</Form.Label>
                                <Form.Select
                                    value={user.notificationFrequency}
                                    onChange={changeFrequency}
                                >
                                    <option value={1}>Каждый день</option>
                                    <option value={2}>Каждые 2 дня</option>
                                    <option value={3}>Каждые 3 дня</option>
                                    <option value={5}>Каждые 5 дней</option>
                                    <option value={7}>Раз в неделю</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Profile;
