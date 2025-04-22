// ProfileEdit.js
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { URL } from '../domain.ts';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = ({ theme }) => {
    const navigate = useNavigate();
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [notificationFrequency, setNotificationFrequency] = useState(1);
    const [turnNotification, setTurnNotification] = useState(false);

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
            const res = await axios.get(`${URL}/api/Users/${telegramId}`);
            const data = res.data;
            setUser(data);

            setFirstName(data.realFirstName || '');
            setLastName(data.realLastName || '');
            setEmail(data.email || '');
            setNotificationFrequency(data.notificationFrequency || 1);
            setTurnNotification(data.turnNotification || false);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при получении данных:', err);
            setError('Не удалось загрузить профиль');
            setLoading(false);
        }
    };

    const updateNotification = (val) => {
        setTurnNotification(val);
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
                alert('Профиль успешно обновлен!');
                navigate('/profile');
            } else {
                alert('Не удалось сохранить изменения');
            }
        } catch (err) {
            console.error('Ошибка при обновлении профиля:', err);
            alert('Произошла ошибка при обновлении');
        }
    };

    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (loading) return <div className="text-center mt-5">Загрузка профиля...</div>;
    if (!user) return <div className="text-center mt-5">Пользователь не найден</div>;

    return (
        <div className="container mt-4">
            <Card className={`${cardBg} shadow-sm p-4`}>
                <h3 className="mb-4">Редактирование профиля</h3>
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Имя</Form.Label>
                                <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Фамилия</Form.Label>
                                <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Form.Group>

                    <div className="notification-section mb-4">
                        <h5 className="mb-3">Настройки уведомлений</h5>
                        <Form.Check
                            type="switch"
                            id="notification-switch"
                            label="Уведомления"
                            checked={turnNotification}
                            onChange={() => updateNotification(!turnNotification)}
                            className="mb-3"
                        />
                        <Form.Group controlId="notif-frequency" className="mb-3">
                            <Form.Label>Частота уведомлений</Form.Label>
                            <Form.Select
                                value={notificationFrequency}
                                onChange={(e) => setNotificationFrequency(parseInt(e.target.value))}
                                disabled={!turnNotification}
                            >
                                <option value={1}>Каждый день</option>
                                <option value={2}>Каждые 2 дня</option>
                                <option value={3}>Каждые 3 дня</option>
                                <option value={5}>Каждые 5 дней</option>
                                <option value={7}>Раз в неделю</option>
                            </Form.Select>
                        </Form.Group>
                    </div>

                    <div className="d-flex">
                        <Button variant="success" className="me-2" onClick={handleSaveProfile}>
                            Сохранить
                        </Button>
                        <Button variant="secondary" onClick={() => navigate('/profile')}>
                            Вернуться
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ProfileEdit;