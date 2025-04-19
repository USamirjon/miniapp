import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const Lesson = ({ onFinish, theme }) => {
    const { id: lessonId, courseId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [lessonCompleted, setLessonCompleted] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

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
                const { data } = await axios.get(`${URL}/api/Course`, {
                    params: { courseid: courseId }
                });

                const foundLesson = data.lessons.find(l => l.id === lessonId);
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

        if (courseId && lessonId) fetchLesson();
    }, [courseId, lessonId]);

    useEffect(() => {
        const checkProgress = async () => {
            if (!userId || !lessonId || !lesson) return;

            try {
                const [lessonRes, testRes] = await Promise.all([
                    axios.get(`${URL}/api/Course/lessonSucsess`, {
                        params: { telegramId: userId, lessonId }
                    }),
                    lesson.testId
                        ? axios.get(`${URL}/api/Course/testSucsess`, {
                            params: { telegramId: userId, testId: lesson.testId }
                        })
                        : Promise.resolve({ data: false })
                ]);

                setLessonCompleted(lessonRes.data === true);
                setTestCompleted(testRes.data === true);
            } catch (err) {
                console.error('Ошибка при проверке прогресса:', err);
            }
        };

        if (lesson) checkProgress();
    }, [userId, lesson]);

    const handleComplete = async () => {
        if (!userId || !lessonId) return;

        try {
            await axios.post(`${URL}/api/Course/testLesson`, {
                telegramId: userId,
                lessonId
            });
            setLessonCompleted(true);
            if (lesson?.experience && onFinish) {
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

    return (
        <div className="container mt-4">
            <Card className={`${cardBg} shadow-sm`}>
                <Card.Body>
                    <Card.Title>{lesson.title}</Card.Title>
                    <Card.Text>{lesson.description}</Card.Text>

                    <Row className="mt-3 g-2">
                        {lessonCompleted ? (
                            <Col xs={12} md="auto">
                                <Link to={`/course/${courseId}/lessons`}>
                                    <Button
                                        variant="success"
                                        className="w-100"
                                    >
                                        ✅ Урок завершён — Вернуться к курсу
                                    </Button>
                                </Link>
                            </Col>
                        ) : lesson.testId ? (
                            testCompleted ? (
                                <Col xs={12} md="auto">
                                    <Button
                                        className="btn btn-success w-100"
                                        onClick={handleComplete}
                                    >
                                        ✅ Завершить урок
                                    </Button>
                                </Col>
                            ) : (
                                <Col xs={12} md="auto">
                                    <Link to={`/test/${lesson.testId}`}>
                                        <Button
                                            variant={isDark ? 'outline-light' : 'outline-primary'}
                                            className="w-100"
                                        >
                                            📋 Пройти тест
                                        </Button>
                                    </Link>
                                </Col>
                            )
                        ) : (
                            <Col xs={12} md="auto">
                                <Button
                                    className="btn btn-success w-100"
                                    onClick={handleComplete}
                                >
                                    ✅ Завершить урок
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
