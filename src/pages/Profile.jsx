import React, { useEffect, useState } from 'react';
import {
    Card, Image, Row, Col, Button, Form
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
    const [telegramId, setTelegramId] = useState(null);
    const [notificationUpdating, setNotificationUpdating] = useState(false);
    const [frequencyUpdating, setFrequencyUpdating] = useState(false);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
            setError('Telegram WebApp недоступен');
            return;
        }
        tg.expand();
        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser?.id) {
            setTelegramId(tgUser.id);
            fetchUserFromBackend(tgUser.id);
            fetchWallet(tgUser.id);
        } else {
            setError('Пользователь Telegram не найден');
        }
    }, []);

    const fetchUserFromBackend = async (telegramId) => {
        try {
            const res = await axios.get(`${URL}/api/Users/${telegramId}`);
            console.log('User data:', res.data);
            setUser(res.data);
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

    // Функция для переключения уведомлений
    const toggleNotifications = async () => {
        if (!telegramId) return;

        try {
            setNotificationUpdating(true);
            const response = await axios.patch(`${URL}/api/Users/notification-switch?telegramId=${telegramId}`);

            if (response.data.isSuccess) {
                // Обновляем локальное состояние
                setUser(prevUser => ({
                    ...prevUser,
                    turnNotification: !prevUser.turnNotification
                }));
            }
        } catch (error) {
            console.error('Ошибка при изменении настроек уведомлений:', error);
        } finally {
            setNotificationUpdating(false);
        }
    };

    // Функция для изменения частоты уведомлений
    const changeNotificationFrequency = async (frequency) => {
        if (!telegramId) return;

        try {
            setFrequencyUpdating(true);
            const response = await axios.patch(`${URL}/api/Users/notification-frequency?telegramId=${telegramId}&frequency=${frequency}`);

            if (response.data.isSuccess) {
                // Обновляем локальное состояние
                setUser(prevUser => ({
                    ...prevUser,
                    notificationFrequency: parseInt(frequency)
                }));
            }
        } catch (error) {
            console.error('Ошибка при изменении частоты уведомлений:', error);
        } finally {
            setFrequencyUpdating(false);
        }
    };

    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (loading) return <div className="text-center mt-5">Загрузка профиля...</div>;
    if (!user) return <div className="text-center mt-5">Пользователь не найден</div>;

    // Стили для улучшения внешнего вида
    const rowStyle = {
        paddingTop: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
    };

    const darkRowStyle = {
        ...rowStyle,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    };

    // Стили для текста в левой колонке (названия полей)
    const labelStyle = {
        fontSize: '16px',
        fontWeight: 'bold'
    };

    // Стили для значений в правой колонке
    const valueStyle = {
        fontSize: '16px'
    };

    return (
        <div className="container mt-4">
            <Card className={`${cardBg} shadow-sm p-0 overflow-hidden`}>


                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        {/* Левая колонка (аватар) */}
                        <Col xs={12} md={3} className="text-center mb-4 mb-md-0">
                            <div style={{ position: 'relative' }} className="mb-3">
                                <Image
                                    src={avatar}
                                    roundedCircle
                                    fluid
                                    style={{
                                        width: 120,
                                        height: 120,
                                        objectFit: 'cover',
                                        border: `3px solid ${theme === 'dark' ? '#444' : '#ddd'}`
                                    }}
                                />
                            </div>
                            <Button
                                size="sm"
                                variant={theme === 'dark' ? 'outline-light' : 'outline-dark'}
                                className="mb-2"
                                onClick={() => setShowAvatars(!showAvatars)}
                            >
                                {showAvatars ? 'Скрыть иконки' : 'Выбрать иконку'}
                            </Button>

                            <AnimatePresence>
                                {showAvatars && (
                                    <motion.div
                                        className="d-flex flex-wrap justify-content-center mt-3 gap-2"
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
                                                    border: avatar === icon ? '2px solid green' : `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`
                                                }}
                                                onClick={() => setAvatar(icon)}
                                            />
                                        ))}
                                        <div className="w-100 mt-3">
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

                        {/* Правая колонка (информация) */}
                        <Col xs={12} md={9}>
                            <div className="profile-details">
                                {/* Имя и Фамилия в одной строке */}
                                <Row
                                    className="align-items-center"
                                    style={theme === 'dark' ? darkRowStyle : rowStyle}
                                >
                                    <Col md={6}>
                                        <Row className="align-items-center">
                                            <Col xs={4} style={labelStyle}>Имя:</Col>
                                            <Col xs={8} style={valueStyle}>{user.realFirstName || '—'}</Col>
                                        </Row>
                                    </Col>
                                    <Col md={6}>
                                        <Row className="align-items-center">
                                            <Col xs={4} style={labelStyle}>Фамилия:</Col>
                                            <Col xs={8} style={valueStyle}>{user.realLastName || '—'}</Col>
                                        </Row>
                                    </Col>
                                </Row>

                                {/* Email и Баланс в одной строке */}
                                <Row
                                    className="align-items-center"
                                    style={theme === 'dark' ? darkRowStyle : rowStyle}
                                >
                                    <Col md={6}>
                                        <Row className="align-items-center">
                                            <Col xs={4} style={labelStyle}>Email:</Col>
                                            <Col xs={8} style={valueStyle}>{user.email || '—'}</Col>
                                        </Row>
                                    </Col>
                                    <Col md={6}>
                                        <Row className="align-items-center">
                                            <Col xs={4} style={labelStyle}>Баланс:</Col>
                                            <Col xs={8}
                                                 style={valueStyle}>💰 {wallet !== null ? wallet : 'Загрузка...'}</Col>
                                        </Row>
                                    </Col>
                                </Row>

                                {/* Уровень и Опыт в одной строке */}
                                <Row
                                    className="align-items-center"
                                    style={theme === 'dark' ? darkRowStyle : rowStyle}
                                >
                                    <Col md={6}>
                                        <Row className="align-items-center">
                                            <Col xs={4} style={labelStyle}>Уровень:</Col>
                                            <Col xs={8} style={valueStyle}>{user.level || 0}</Col>
                                        </Row>
                                    </Col>
                                    <Col md={6}>
                                        <Row className="align-items-center">
                                            <Col xs={4} style={labelStyle}>Опыт:</Col>
                                            <Col xs={8} style={valueStyle}>{user.experience || 0}</Col>
                                        </Row>
                                    </Col>
                                </Row>

                                {/* Уведомления и Частота в одной строке с переключателями */}
                                <Row
                                    className="align-items-center"
                                    style={{...rowStyle, borderBottom: 'none'}}
                                >
                                    <Col md={6}>
                                        <Row className="align-items-center">
                                            <Col xs={4} style={labelStyle}>Уведомления:</Col>
                                            <Col xs={8}>
                                                <Form.Check
                                                    type="switch"
                                                    id="notification-switch"
                                                    checked={user.turnNotification}
                                                    onChange={toggleNotifications}
                                                    disabled={notificationUpdating}
                                                    label={user.turnNotification ? 'Включены' : 'Выключены'}
                                                    style={{fontSize: '16px'}}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col md={6}>
                                        <Row className="align-items-center">
                                            <Col xs={5} style={labelStyle}>Частота:</Col>
                                            <Col xs={7}>
                                                {user.turnNotification ? (
                                                    <Form.Select
                                                        value={user.notificationFrequency}
                                                        onChange={(e) => changeNotificationFrequency(e.target.value)}
                                                        disabled={frequencyUpdating || !user.turnNotification}
                                                        style={{
                                                            fontSize: '14px',
                                                            height: 'auto',
                                                            padding: '4px 8px'
                                                        }}
                                                    >
                                                        <option value="1">Каждый день</option>
                                                        <option value="2">Каждые 2 дня</option>
                                                        <option value="3">Каждые 3 дня</option>
                                                        <option value="5">Каждые 5 дней</option>
                                                        <option value="7">Раз в неделю</option>
                                                    </Form.Select>
                                                ) : (
                                                    <span className="text-muted"
                                                          style={{fontSize: '14px'}}>Недоступно</span>
                                                )}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                            <div className="mt-4">
                                <Button
                                    variant={theme === 'dark' ? 'light' : 'primary'}
                                    onClick={handleEditProfile}
                                    className="w-100"
                                >
                                    Редактировать профиль
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Profile;

