// Profile.js
import React, { useEffect, useState } from 'react';
import {
    Card, ProgressBar, Image, Row, Col, Button
} from 'react-bootstrap';
import axios from 'axios';
import { URL } from '../domain.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Updated avatar URLs with different animal icons
const defaultAvatars = [
    'https://cdn-icons-png.flaticon.com/512/616/616430.png', // cat
    'https://cdn-icons-png.flaticon.com/512/616/616408.png', // dog
    'https://cdn-icons-png.flaticon.com/512/620/620851.png', // badger
    'https://cdn-icons-png.flaticon.com/512/616/616494.png', // hamster
    'https://cdn-icons-png.flaticon.com/512/616/616438.png'  // fox
];

const Profile = ({ theme, avatar, setAvatar }) => {
    const navigate = useNavigate();
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [error, setError] = useState(null);
    const [showAvatars, setShowAvatars] = useState(false);
    const [loading, setLoading] = useState(true);

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
            fetchWallet(tgUser.id);
        } else {
            setError('Пользователь Telegram не найден');
        }
    }, []);

    const fetchUserFromBackend = async (telegramId) => {
        try {
            const res = await axios.get(`${URL}/api/Users/${telegramId}`);
            console.log('User data:', res.data);  // Убедитесь, что данные приходят
            setUser(res.data);  // Сохраняем данные в состоянии
            const savedAvatar = localStorage.getItem('avatar');
            if (savedAvatar) {
                setAvatar(savedAvatar);
            } else if (res.data.avatar) {
                setAvatar(res.data.avatar);
            } else {
                setAvatar(defaultAvatars[0]);
            }
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

    const saveAvatar = () => {
        localStorage.setItem('avatar', avatar);
        setShowAvatars(false); // Hide avatar selection after saving
    };

    const handleEditProfile = () => {
        navigate('/profile/edit');
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
                            <Button
                                variant="primary"
                                className="mb-4"
                                onClick={handleEditProfile}
                            >
                                Редактировать профиль
                            </Button>
                        </div>

                        <div className="profile-details mb-4">
                            <Row className="mb-3">
                                <Col md={3}><strong>Имя:</strong></Col>
                                <Col md={9}>{user.realFirstName || '—'}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={3}><strong>Фамилия:</strong></Col>
                                <Col md={9}>{user.realLastName || '—'}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={3}><strong>Email:</strong></Col>
                                <Col md={9}>{user.email || '—'}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={3}><strong>Уведомления:</strong></Col>
                                <Col md={9}>{user.turnNotification ? 'Включены' : 'Выключены'}</Col>
                            </Row>
                            {user.turnNotification && (
                                <Row className="mb-3">
                                    <Col md={3}><strong>Частота уведомлений:</strong></Col>
                                    <Col md={9}>
                                        {user.notificationFrequency === 1 ? 'Каждый день' :
                                            user.notificationFrequency === 2 ? 'Каждые 2 дня' :
                                                user.notificationFrequency === 3 ? 'Каждые 3 дня' :
                                                    user.notificationFrequency === 5 ? 'Каждые 5 дней' :
                                                        user.notificationFrequency === 7 ? 'Раз в неделю' : '—'}
                                    </Col>
                                </Row>
                            )}
                        </div>

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
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Profile;