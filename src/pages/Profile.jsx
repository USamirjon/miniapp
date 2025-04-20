// Profile.js
import React, { useEffect, useState } from 'react';
import {
    Card, ProgressBar, Image, Row, Col, Button, Form
} from 'react-bootstrap';
import axios from 'axios';
import { URL } from '../domain.ts';
import { motion, AnimatePresence } from 'framer-motion';

// Updated avatar URLs with different animal icons
const defaultAvatars = [
    'https://cdn-icons-png.flaticon.com/512/616/616430.png', // cat
    'https://cdn-icons-png.flaticon.com/512/616/616408.png', // dog
    'https://cdn-icons-png.flaticon.com/512/620/620851.png', // badger
    'https://cdn-icons-png.flaticon.com/512/616/616494.png', // hamster
    'https://cdn-icons-png.flaticon.com/512/616/616438.png'  // fox
];

const Profile = ({ theme, avatar, setAvatar }) => {
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [error, setError] = useState(null);
    const [showAvatars, setShowAvatars] = useState(false);
    const [loading, setLoading] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [notificationFrequency, setNotificationFrequency] = useState(1);
    const [turnNotification, setTurnNotification] = useState(false);

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

            // Get avatar from localStorage or user data or default to first avatar
            const savedAvatar = localStorage.getItem('avatar');
            if (savedAvatar) {
                setAvatar(savedAvatar);
            } else if (data.avatar) {
                setAvatar(data.avatar);
            } else {
                setAvatar(defaultAvatars[0]);
            }

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

    const fetchWallet = async (telegramId) => {
        try {
            const res = await axios.get(`${URL}/api/Transaction`, {
                params: { telegramId }
            });
            setWallet(res.data);
        } catch (err) {
            console.error('Ошибка при получении баланса:', err);
            setWallet(0); // Default to 0 if there's an error
        }
    };

    const updateNotification = async (val) => {
        try {
            await axios.patch(`${URL}/api/Users/notification-switch`, null, {
                params: { telegramId: user.telegramId }
            });
            setTurnNotification(val);
        } catch (err) {
            console.error('Ошибка при переключении уведомлений:', err);
        }
    };

    const updateFrequency = async (val) => {
        try {
            await axios.patch(`${URL}/api/Users/notification-frequency`, null, {
                params: {
                    telegramId: user.telegramId,
                    frequency: val
                }
            });
            setNotificationFrequency(val);
        } catch (err) {
            console.error('Ошибка при изменении частоты:', err);
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
                    realLastName: lastName
                }));
                // Не закрываем форму, так как она теперь постоянно видна
            } else {
                alert('Не удалось сохранить изменения');
            }
        } catch (err) {
            console.error('Ошибка при обновлении профиля:', err);
            alert('Произошла ошибка при обновлении');
        }
    };

    const saveAvatar = () => {
        localStorage.setItem('avatar', avatar);
        setShowAvatars(false); // Hide avatar selection after saving
    };

    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (loading) return <div className="text-center mt-5">Загрузка профиля...</div>;
    if (!user) return <div className="text-center mt-5">Пользователь не найден</div>;

    const xpPercent = Math.round((user?.experience || 0) / 20000 * 100);

    return (
        <div className="container mt-4">
            <Card className={`${cardBg} shadow-sm p-4`}>
                <Row className="align-items-center">
                    <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
                        <div style={{ position: 'relative' }}>
                            <Image
                                src={avatar}
                                roundedCircle
                                fluid
                                style={{ width: 100, height: 100, objectFit: 'cover' }}
                            />
                        </div>
                        <Button
                            size="sm"
                            variant="outline-secondary"
                            className="mt-2"
                            onClick={() => setShowAvatars(!showAvatars)}
                        >
                            {showAvatars ? 'Скрыть иконки' : 'Выбрать иконку'}
                        </Button>

                        <AnimatePresence>
                            {showAvatars && (
                                <motion.div
                                    className="d-flex flex-wrap justify-content-center mt-2 gap-2"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
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
                                    <div className="w-100 mt-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={saveAvatar}
                                        >
                                            Подтвердить
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Col>

                    <Col xs={12} md={9}>
                        <div className="user-info mb-4">
                            <h4>{user.telegramName || 'Пользователь'}</h4>
                        </div>

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

                            <Button variant="primary" className="mb-4" onClick={handleSaveProfile}>
                                Сохранить данные
                            </Button>

                            <div className="stats-section mb-4">
                                <h5 className="mb-3">Статистика</h5>
                                <p><strong>Баланс:</strong> 💰 {wallet !== null ? wallet : 'Загрузка...'}</p>
                                <p><strong>Уровень:</strong> {user.level || 0}</p>
                                <p><strong>Опыт:</strong> {user.experience || 0}/20000</p>
                                <ProgressBar
                                    now={xpPercent}
                                    label={`${xpPercent}%`}
                                    variant="success"
                                    className="mb-3"
                                />
                            </div>

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
                                        onChange={(e) => updateFrequency(parseInt(e.target.value))}
                                    >
                                        <option value={1}>Каждый день</option>
                                        <option value={2}>Каждые 2 дня</option>
                                        <option value={3}>Каждые 3 дня</option>
                                        <option value={5}>Каждые 5 дней</option>
                                        <option value={7}>Раз в неделю</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Profile;