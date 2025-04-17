import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const Courses = ({ theme }) => {
    const [myCourses, setMyCourses] = useState([]);
    const [userId, setUserId] = useState(null);

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
            fetchMyCourses(user.id);
        }
    }, []);

    const fetchMyCourses = async (telegramId) => {
        try {
            console.log('Запрос подписок:', `${URL}/api/Users/listSubscriptionCourses?telegramId=${telegramId}`);

            const { data: subscriptions } = await axios.get(`${URL}/api/Users/list-subscription-courses`, {
                params: { telegramId }
            });

            console.log('📦 Subscriptions:', subscriptions);

            if (!subscriptions || subscriptions.length === 0) {
                setMyCourses([]);
                return;
            }

            const courseRequests = subscriptions.map(async (sub) => {
                try {
                    const courseId = sub.courseId || sub.id || sub;
                    console.log('Запрос курса:', `${URL}/api/Course?courseid=${courseId}`);

                    const { data } = await axios.get(`${URL}/api/Course`, {
                        params: { courseid: courseId }
                    });
                    return data;
                } catch (err) {
                    console.warn(`❌ Ошибка при получении курса ${sub.courseId || sub.id || sub}:`, err.message);
                    if (err.response) {
                        console.warn('Статус:', err.response.status);
                        console.warn('Данные:', err.response.data);
                    }
                    return null;
                }
            });

            const results = await Promise.all(courseRequests);
            const filtered = results.filter(course => course !== null);
            setMyCourses(filtered);
        } catch (err) {
            console.error('Ошибка при получении курсов пользователя:', err);
            if (err.response) {
                console.error('Статус:', err.response.status);
                console.error('Данные:', err.response.data);
            }
        }
    };

    const handleGoToCourse = (courseId) => {
        navigate(`/course/${courseId}/lessons`);
    };

    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📘 Мои курсы</h2>
            <Row>
                {myCourses.length === 0 && (
                    <Col>
                        <p>У вас пока нет активных курсов.</p>
                    </Col>
                )}
                {myCourses.map((course) => {
                    const totalLessons = course.lessons?.length || 0;
                    const lessonsPassed = 0; // если у тебя где-то хранится прогресс — сюда вставить
                    const progressPercent = totalLessons > 0
                        ? Math.round((lessonsPassed / totalLessons) * 100)
                        : 0;

                    return (
                        <Col key={course.id} xs={12} md={6} lg={4} className="mb-4">
                            <Card className={`${cardBg} shadow-sm h-100`}>
                                <Card.Body>
                                    <Card.Title>{course.title}</Card.Title>
                                    <Card.Subtitle className={`mb-2`}>
                                        {course.briefDescription}
                                    </Card.Subtitle>
                                    <Card.Text>
                                        <strong>Прогресс:</strong> {lessonsPassed}/{totalLessons}
                                    </Card.Text>

                                    <ProgressBar
                                        now={progressPercent}
                                        label={`${progressPercent}%`}
                                        className="mb-3"
                                        variant={isDark ? 'info' : 'primary'}
                                    />

                                    <Button
                                        variant={buttonVariant}
                                        onClick={() => handleGoToCourse(course.id)}
                                    >
                                        Перейти
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default Courses;