import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { URL } from '../domain.ts';
import CourseContent from './CourseContent.jsx';

const CourseDetails = ({ theme }) => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [userId, setUserId] = useState(null);
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.expand();
        const user = tg.initDataUnsafe?.user;
        if (user) {
            setUserId(user.id);
            fetchCourse(id);
            fetchBalance(user.id);
        }
    }, [id]);

    const fetchCourse = async (courseId) => {
        try {
            const { data } = await axios.get(`${URL}/api/Course`, {
                params: { courseid: courseId }
            });
            setCourse(data);
        } catch (err) {
            console.error('Ошибка при получении курса:', err);
        }
    };

    const fetchBalance = async (telegramId) => {
        try {
            const { data } = await axios.get(`${URL}/api/Transaction`, {
                params: { telegramId }
            });
            setBalance(data); // предполагается, что приходит число
        } catch (err) {
            console.error('Ошибка при получении баланса:', err);
        }
    };

    const handleSubscribe = async () => {
        try {
            setLoading(true);
            await axios.post(`${URL}/api/Course/subscribe`, {
                courseId: id,
                telegramId: userId
            });
            setSubscribed(true);

            if (course.price === 0) {
                setSuccessMessage('✅ Вы успешно подписались на данный курс!');
            }
        } catch (err) {
            setError('Не удалось подписаться на курс.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        const hasDiscount = course.discount === true;
        const actualPrice = hasDiscount ? course.priceWithDiscount : course.price;

        if (balance < actualPrice) {
            setError(`Недостаточно средств. Нужно ${actualPrice}₽, у вас ${balance}₽`);
            return;
        }

        const newBalance = balance - actualPrice;
        await handleSubscribe();

        setSuccessMessage(
            `✅ Успешная покупка! Было: ${balance}₽, списано: ${actualPrice}₽, осталось: ${newBalance}₽`
        );
        setBalance(newBalance);
    };

    if (!course) return <p>Загрузка...</p>;

    const actualPrice = course.discount ? course.priceWithDiscount : course.price;

    return (
        <div className="container mt-4">
            <Card className={`${cardBg} shadow`}>
                <Card.Body>
                    <Card.Title>{course.title}</Card.Title>
                    <Card.Text>{course.fullDescription || course.briefDescription}</Card.Text>

                    <Card.Text>
                        <strong>Цена:</strong>{' '}
                        {actualPrice === 0 ? 'Бесплатно' : (
                            course.discount ? (
                                <>
                                    <del>{course.price}₽</del>{' '}
                                    <span className="text-success fw-bold">{course.priceWithDiscount}₽</span>
                                </>
                            ) : (
                                `${course.price}₽`
                            )
                        )}
                    </Card.Text>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    {loading ? (
                        <Button variant={buttonVariant} disabled>
                            <Spinner animation="border" size="sm" /> Загрузка...
                        </Button>
                    ) : subscribed ? (
                        <Button variant="success" onClick={() => navigate(`/course/${id}/block`)}>
                            Перейти к курсу
                        </Button>
                    ) : actualPrice === 0 ? (
                        <Button variant={buttonVariant} onClick={handleSubscribe}>
                            Подписаться бесплатно
                        </Button>
                    ) : (
                        <Button variant={buttonVariant} onClick={handlePurchase}>
                            Купить курс
                        </Button>
                    )}
                </Card.Body>
            </Card>

            {(subscribed || actualPrice === 0) && (
                <CourseContent blocks={course.blocks} theme={theme} />
            )}
        </div>
    );
};

export default CourseDetails;
