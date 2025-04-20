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
    const [error, setError] = useState(null);
    const [showAvatars, setShowAvatars] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // локальные состояния для редактирования
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [notificationFrequency, setNotificationFrequency] = useState(1);
    const [turnNotification, setTurnNotification] = useState(false);

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
            const data = res.data;
            setUser(data);
            setAvatar(localStorage.getItem('avatar') || data.avatar || defaultAvatars[0]);

            // заполняем данные для редактирования
            setFirstName(data.realFirstName || '');
            setLastName(data.realLastName || '');
            setEmail(data.email || '');
            setNotificationFrequency(data.notificationFrequency || 1);
            setTurnNotification(data.turnNotification || false);
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

    const handleSaveProfile = async () => {
        try {
            const res = await axios.put(`${URL}/api/Users`, {
                telegramId: user.telegramId,
                email,
                realFirstName: firstName,
                realLastName: lastName,
                notificationFrequency,
                turnNotification
            });

            if (res.data.isSuccess) {
                setUser(prev => ({
                    ...prev,
                    email,
                    realFirstName: firstName,
                    realLastName: lastName,
                    notificationFrequency,
                    turnNotification
                }));
                setIsEditing(false);
            } else {
                alert('Не удалось сохранить изменения');
            }
        } catch (err) {
            console.error('Ошибка при обновлении профиля:', err);
            alert('Произошла ошибка при обновлении');
        }
    };

    const xpPercent = Math.round((user?.experience || 0) / 20000 * 100);

    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!user) return <div className="text-center mt-5">Загрузка профиля...</div>;

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
                                        onClick={() => setAvatar(icon)}
                                    />
                                ))}
                            </div>
                        )}
                        {showAvatars && avatar && (
                            <Button variant="success" size="sm" className="mt-2" onClick={() => {
                                localStorage.setItem('avatar', avatar);
                                navigate('/profile');
                            }}>
                                Подтвердить иконку
                            </Button>
                        )}
                    </Col>

                    <Col xs={12} md={9}>
                        <Form>
                            <Form.Group className="mb-2">
                                <Form.Label>Имя</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Фамилия</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </Form.Group>

                            <p><strong>Баланс:</strong> 💰 {wallet}</p>
                            <p><strong>Уровень:</strong> {user.level}</p>
                            <p><strong>Опыт:</strong> {user.experience}/20000</p>
                            <ProgressBar now={xpPercent} label={`${xpPercent}%`} className="mb-3" />

                            <Form.Check
                                type="switch"
                                label="Уведомления"
                                checked={turnNotification}
                                onChange={() => setTurnNotification(!turnNotification)}
                                className="mb-3"
                                disabled={!isEditing}
                            />

                            <Form.Group controlId="notif-frequency" className="mb-3">
                                <Form.Label>Частота уведомлений</Form.Label>
                                <Form.Select
                                    value={notificationFrequency}
                                    onChange={(e) => setNotificationFrequency(parseInt(e.target.value))}
                                    disabled={!isEditing}
                                >
                                    <option value={1}>Каждый день</option>
                                    <option value={2}>Каждые 2 дня</option>
                                    <option value={3}>Каждые 3 дня</option>
                                    <option value={5}>Каждые 5 дней</option>
                                    <option value={7}>Раз в неделю</option>
                                </Form.Select>
                            </Form.Group>

                            {!isEditing ? (
                                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                                    Редактировать профиль
                                </Button>
                            ) : (
                                <Button variant="primary" onClick={handleSaveProfile}>
                                    Сохранить изменения
                                </Button>
                            )}
                        </Form>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Profile;
