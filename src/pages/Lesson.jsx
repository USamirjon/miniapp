import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const Lesson = ({ onFinish, theme }) => {
    const { id, courseId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [testSuccess, setTestSuccess] = useState(false);

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const telegramUser = tg?.initDataUnsafe?.user;
        if (telegramUser?.id) {
            setUserId(telegramUser.id);
        }
    }, []);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${URL}/api/Course/lessonByCourse`, {
                    params: { courseId }
                });

                const foundLesson = data.find(l => l.testId === id);
                if (foundLesson) {
                    setLesson(foundLesson);
                } else {
                    setError('Урок не найден');
                }
            } catch (err) {
                console.error('Ошибка при загрузке урока:', err);
                setError('Ошибка при загрузке урока.');
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [id, courseId]);

    useEffect(() => {
        const checkTestSuccess = async () => {
            if (!userId || !lesson?.testId) return;

            try {
                const { data } = await axios.get(`${URL}/api/Course/testSucsess`, {
                    params: { telegramId: userId }
                });

                if (data?.testId === lesson.testId && data.result === true) {
                    setTestSuccess(true);
                }
            } catch (err) {
                console.error('Ошибка при проверке прохождения теста:', err);
            }
        };

        checkTestSuccess();
    }, [userId, lesson]);

    const handleComplete = async () => {
        if (!userId || !lesson) return;

        try {
            await axios.post(`${URL}/api/Course/testLesson`, {
                telegramId: userId,
                lessonId: lesson.testId
            });
            setCompleted(true);
            if (lesson.experience && onFinish) {
                onFinish(lesson.experience);
            }
        } catch (err) {
            console.error('Ошибка при завершении урока:', err);
        }
    };

    if (loading) {
        return <div className="container mt-4 text-center"><h5>Загрузка...</h5></div>;
    }

    if (error || !lesson) {
        return <div className="container mt-4 text-danger"><h5>{error || 'Урок не найден'}</h5></div>;
    }

    const showTestButton = lesson.testId && !testSuccess;

    return (
        <div className="container mt-4">
            <Card className={`${cardBg} shadow-sm`}>
                <Card.Body>
                    <Card.Title>{lesson.title}</Card.Title>
                    <Card.Text>{lesson.description}</Card.Text>

                    <Row className="mt-3 g-2">
                        {showTestButton ? (
                            <Col xs={12} md="auto">
                                <Link to={`/test/${lesson.testId}`}>
                                    <Button
                                        variant={isDark ? 'outline-light' : 'outline-primary'}
                                        className="w-100"
                                    >
                                        📋 Перейти к тесту
                                    </Button>
                                </Link>
                            </Col>
                        ) : (
                            <Col xs={12} md="auto">
                                <Button
                                    className="btn btn-success w-100"
                                    onClick={handleComplete}
                                    disabled={completed}
                                >
                                    {completed ? 'Урок завершён' : '✅ Завершить урок'}
                                </Button>
                            </Col>
                        )}
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Lesson;
