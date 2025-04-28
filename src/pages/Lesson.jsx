import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Container, Spinner } from 'react-bootstrap';
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

    if (loading) return (
        <Container className="py-3 text-center">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Загрузка...</p>
        </Container>
    );

    if (error || !lesson) return (
        <Container className="py-3">
            <div className="alert alert-danger" role="alert">
                <h5 className="mb-0">{error || 'Урок не найден'}</h5>
            </div>
        </Container>
    );

    return (
        <Container fluid className="px-0 py-3">
            <div className={`lesson-container ${isDark ? 'text-light' : 'text-dark'}`}>
                <div className="px-3 mb-3">
                    <h2>{lesson.title}</h2>
                </div>

                <div
                    className="lesson-content mb-4 lesson-html-content"
                    dangerouslySetInnerHTML={{ __html: lesson.description }}
                />

                <div className="px-3">
                    <Row className="mt-4 g-2 justify-content-center">
                        {lessonCompleted ? (
                            <Col xs={12}>
                                <Button
                                    variant="success"
                                    className="w-100 py-2"
                                    onClick={() => navigate(`/block/${blockId}`)}
                                >
                                    ✅ Урок завершён — Вернуться в блок
                                </Button>
                            </Col>
                        ) : (
                            <Col xs={12}>
                                <Button
                                    variant="success"
                                    className="w-100 py-2"
                                    onClick={handleComplete}
                                >
                                    ✅ {isLastLessonWithoutTest
                                    ? 'Завершить урок и блок'
                                    : 'Завершить урок'}
                                </Button>
                            </Col>
                        )}
                    </Row>
                </div>
            </div>

            {/* Add CSS styles for proper HTML content display */}
            <style>{`
                .lesson-html-content {
                    width: 100%;
                }
                
                .lesson-html-content table {
                    width: 100%;
                    margin-bottom: 1rem;
                    table-layout: fixed;
                    border-collapse: collapse;
                }
                
                .lesson-html-content table th,
                .lesson-html-content table td {
                    padding: 0.75rem;
                    border: 1px solid #dee2e6;
                    vertical-align: top;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    font-size: 0.95rem;
                }
                
                .lesson-html-content table th {
                    background-color: rgba(0, 0, 0, 0.05);
                    font-weight: bold;
                }
                
                .lesson-html-content ul,
                .lesson-html-content ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                
                .lesson-html-content ul li,
                .lesson-html-content ol li {
                    margin-bottom: 0.5rem;
                }
                
                .lesson-html-content p {
                    margin-bottom: 1rem;
                }
                
                .lesson-html-content strong,
                .lesson-html-content b {
                    font-weight: bold;
                }
                
                .lesson-html-content em,
                .lesson-html-content i {
                    font-style: italic;
                }
                
                /* Table responsiveness */
                @media (max-width: 767px) {
                    .lesson-html-content table {
                        table-layout: fixed;
                        font-size: 0.85rem;
                    }
                    
                    .lesson-html-content table th,
                    .lesson-html-content table td {
                        padding: 0.5rem;
                    }
                }
                
                /* 2x2 table special handling */
                .lesson-html-content table tr:nth-child(1) td:nth-child(1),
                .lesson-html-content table tr:nth-child(1) td:nth-child(2) {
                    width: 50%;
                }
                
                /* Ensure proper padding in the container */
                .lesson-html-content {
                    padding: 0 0.75rem;
                }
            `}</style>
        </Container>
    );
};

export default Lesson;