import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const Lesson = ({ onFinish, theme }) => {
    const { id: lessonId } = useParams(); // id — это lessonId
    const location = useLocation();
    const navigate = useNavigate();
    const [blockId, setBlockId] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [lessonCompleted, setLessonCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const user = tg?.initDataUnsafe?.user;
        if (user?.id) {
            setUserId(user.id);
        }
    }, []);

    useEffect(() => {
        const fetchLessonAndBlockData = async () => {
            try {
                setLoading(true);

                const storedBlockId = sessionStorage.getItem('currentBlockId');
                if (!storedBlockId) {
                    setError('blockId не найден');
                    return;
                }

                setBlockId(storedBlockId);

                // Загружаем уроки для этого блока
                const { data } = await axios.get(`${URL}/api/Courses/lessons`, {
                    params: { blockId: storedBlockId }
                });

                const foundLesson = data.find(l => l.id === lessonId);
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

        if (lessonId) fetchLessonAndBlockData();
    }, [lessonId]);

    useEffect(() => {
        const checkProgress = async () => {
            if (!userId || !lessonId || !lesson) return;

            try {
                const lessonRes = await axios.get(`${URL}/api/Courses/lesson-sucsess`, {
                    params: { telegramId: userId, lessonId }
                });

                setLessonCompleted(lessonRes.data === true);
            } catch (err) {
                console.error('Ошибка при проверке прогресса:', err);
            }
        };

        if (lesson) checkProgress();
    }, [userId, lesson]);

    const handleComplete = async () => {
        if (!userId || !lessonId) return;

        try {
            await axios.post(`${URL}/api/Courses/lesson-sucsess`, {
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

    const handleBack = () => {
        navigate(`/block/${blockId}`, { state: { blockTitle: lesson?.blockTitle } });
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
                                <Button variant="success" className="w-100" onClick={handleBack}>
                                    ✅ Урок завершён — Вернуться в блок
                                </Button>
                            </Col>
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
