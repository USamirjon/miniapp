// Lesson.jsx
import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const Lesson = ({ onFinish, theme }) => {
    const { id: lessonId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isLastLessonWithoutTest = location.state?.isLastLessonWithoutTest || false;

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

    // Track lesson visit
    useEffect(() => {
        const trackVisit = async () => {
            if (!lessonId) return;

            try {
                await axios.post(`${URL}/api/Courses/visit`, { lessonId });
                console.log('Lesson visit tracked successfully');
            } catch (err) {
                console.error('Error tracking lesson visit:', err);
                // We don't set an error state here to avoid disrupting the user experience
            }
        };

        trackVisit();
    }, [lessonId]);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                const storedBlockId = sessionStorage.getItem('currentBlockId');
                if (!storedBlockId) return setError('blockId не найден');
                setBlockId(storedBlockId);
                const { data } = await axios.get(`${URL}/api/Courses/lessons`, { params: { blockId: storedBlockId } });
                const foundLesson = data.find(l => l.id === lessonId);
                setLesson(foundLesson || null);
            } catch (err) {
                setError('Ошибка при загрузке урока.');
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) fetchLesson();
    }, [lessonId]);

    useEffect(() => {
        const checkProgress = async () => {
            if (!userId || !lessonId || !lesson) return;
            try {
                const res = await axios.get(`${URL}/api/Courses/lesson-sucsess`, {
                    params: { telegramId: userId, lessonId }
                });
                setLessonCompleted(res.data === true);
            } catch {}
        };
        if (lesson) checkProgress();
    }, [userId, lesson]);

    const checkAndCompleteBlock = async () => {
        try {
            const { data: lessons } = await axios.get(`${URL}/api/Courses/lessons`, { params: { blockId } });
            const statuses = await Promise.all(
                lessons.map(l => axios.get(`${URL}/api/Courses/lesson-sucsess`, {
                    params: { telegramId: userId, lessonId: l.id }
                }).then(res => res.data).catch(() => false))
            );
            const allLessonsDone = statuses.every(Boolean);

            // Если это последний урок и нет теста, сразу завершаем блок
            if (isLastLessonWithoutTest && allLessonsDone) {
                await axios.patch(`${URL}/api/Courses/block-finish`, null, {
                    params: { blockId, telegramId: userId }
                });
                return;
            }

            // Стандартная проверка, если есть тест
            const { data: test } = await axios.get(`${URL}/api/Courses/test-block-id`, { params: { blockId } });
            let testDone = true;
            if (test?.id) {
                const testStatus = await axios.get(`${URL}/api/Courses/test-sucsess`, {
                    params: { telegramId: userId, testId: test.id }
                });
                testDone = testStatus.data === true;
            }
            if (allLessonsDone && testDone) {
                await axios.patch(`${URL}/api/Courses/block-finish`, null, {
                    params: { blockId, telegramId: userId }
                });
            }
        } catch (err) {
            console.error('Ошибка при завершении блока:', err);
        }
    };

    const handleComplete = async () => {
        if (!userId || !lessonId) return;
        try {
            await axios.post(`${URL}/api/Courses/lesson-sucsess`, { telegramId: userId, lessonId });
            setLessonCompleted(true);
            if (lesson?.experience && onFinish) onFinish(lesson.experience);

            // Особая обработка для последнего урока без теста
            if (isLastLessonWithoutTest) {
                try {
                    await axios.patch(`${URL}/api/Courses/block-finish`, null, {
                        params: { blockId, telegramId: userId }
                    });
                    console.log('Блок успешно завершен, так как это последний урок и нет теста');
                } catch (blockErr) {
                    console.error('Ошибка при завершении блока:', blockErr);
                }
            } else {
                await checkAndCompleteBlock();
            }
        } catch (err) {
            console.error('Ошибка при отметке урока как завершенного:', err);
        }
    };

    if (loading) return <div className="container mt-4 text-center"><h5>Загрузка...</h5></div>;
    if (error || !lesson) return <div className="container mt-4 text-danger"><h5>{error || 'Урок не найден'}</h5></div>;

    return (
        <div className="container mt-4">
            <Card className={`${cardBg} shadow-sm`}>
                <Card.Body>
                    <Card.Title>{lesson.title}</Card.Title>
                    <Card.Text>{lesson.description}</Card.Text>
                    <Row className="mt-3 g-2">
                        {lessonCompleted ? (
                            <Col xs={12} md="auto">
                                <Button variant="success" className="w-100" onClick={() => navigate(`/block/${blockId}`)}>
                                    ✅ Урок завершён — Вернуться в блок
                                </Button>
                            </Col>
                        ) : (
                            <Col xs={12} md="auto">
                                <Button className="btn btn-success w-100" onClick={handleComplete}>
                                    {isLastLessonWithoutTest
                                        ? '✅ Завершить урок и блок'
                                        : '✅ Завершить урок'}
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