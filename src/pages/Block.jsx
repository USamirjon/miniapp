import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

const Block = ({ theme }) => {
    const { id: blockId } = useParams();
    const location = useLocation();
    const blockTitleFromState = location.state?.blockTitle || 'Блок без названия';

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    const [lessons, setLessons] = useState([]);
    const [test, setTest] = useState(null);
    const [testCompleted, setTestCompleted] = useState(false);
    const [blockTitle, setBlockTitle] = useState(blockTitleFromState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);

    const handleLessonClick = (lessonId, isLastLessonWithoutTest) => {
        sessionStorage.setItem('currentBlockId', blockId);
        navigate(`/lesson/${lessonId}`, {
            state: {
                isLastLessonWithoutTest // Передаем флаг о том, что это последний урок без теста
            }
        });
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const telegramUser = tg?.initDataUnsafe?.user;
        if (telegramUser?.id) {
            setUserId(telegramUser.id);
        }
    }, []);

    // Track block visit
    useEffect(() => {
        const trackBlockVisit = async () => {
            if (!blockId || !userId) return;

            try {
                await axios.post(`${URL}/api/Courses/visit-block`, {
                    blockId,
                    telegramId: userId
                });
                console.log('Block visit tracked successfully');
            } catch (err) {
                console.error('Error tracking block visit:', err);
                // Don't set error state to avoid disrupting user experience
            }
        };

        if (blockId && userId) {
            trackBlockVisit();
        }
    }, [blockId, userId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await axios.get(`${URL}/api/Courses/lessons`, {
                    params: { blockId }
                });

                const rawLessons = res.data || [];

                const completedStatuses = userId
                    ? await Promise.all(
                        rawLessons.map(lesson =>
                            axios
                                .get(`${URL}/api/Courses/lesson-sucsess`, {
                                    params: {
                                        telegramId: userId,
                                        lessonId: lesson.id,
                                    },
                                })
                                .then(res => res.data)
                                .catch(() => false)
                        )
                    )
                    : rawLessons.map(() => false);

                setLessons(
                    rawLessons.map((lesson, i) => ({
                        ...lesson,
                        isCompleted: completedStatuses[i],
                    }))
                );

                try {
                    const testRes = await axios.get(`${URL}/api/Courses/test-block-id`, {
                        params: { blockId }
                    });

                    if (testRes.status === 200 && testRes.data) {
                        setTest(testRes.data);

                        if (userId) {
                            try {
                                const testStatusRes = await axios.get(`${URL}/api/Courses/test-sucsess`, {
                                    params: {
                                        telegramId: userId,
                                        testId: testRes.data.id
                                    }
                                });
                                setTestCompleted(testStatusRes.data === true);
                            } catch (err) {
                                console.error('Ошибка при проверке статуса теста:', err);
                                setTestCompleted(false);
                            }
                        }
                    }
                } catch (error) {
                    if (error.response?.status !== 204) {
                        console.error('Ошибка при загрузке теста:', error);
                    }
                }

            } catch (err) {
                console.error('Ошибка при загрузке уроков блока:', err);
                setError('Не удалось загрузить данные блока.');
            } finally {
                setLoading(false);
            }
        };

        if (blockId && userId) {
            fetchData();
        }
    }, [blockId, userId]);

    if (loading) return <div className="container mt-4 text-center"><h5>Загрузка...</h5></div>;

    if (error) {
        return (
            <div className="container mt-4">
                <h4>Ошибка</h4>
                <p>{error}</p>
                <Link to="/courses">
                    <Button variant={buttonVariant}>Назад</Button>
                </Link>
            </div>
        );
    }

    // Определяем, есть ли тест в блоке
    const hasTest = test !== null;

    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📦 Блок: {blockTitle}</h2>

            {lessons.length > 0 && <h4>📘 Уроки</h4>}
            <div className="row">
                {lessons.map((lesson, index) => {
                    const prevCompleted = index === 0 || lessons[index - 1].isCompleted;
                    const isLocked = !prevCompleted;

                    // Определяем, является ли этот урок последним в блоке
                    const isLastLesson = index === lessons.length - 1;

                    // Флаг для определения, является ли это последним уроком без теста
                    const isLastLessonWithoutTest = isLastLesson && !hasTest;

                    return (
                        <div className="col-md-6 mb-4" key={lesson.id}>
                            <Card className={`${cardBg} shadow-sm h-100`}>
                                <Card.Body>
                                    <Card.Title className="d-flex justify-content-between align-items-center">
                                        {lesson.title}
                                        {lesson.isCompleted ? (
                                            <CheckCircleFill color="green" size={22} />
                                        ) : (
                                            <XCircleFill color="red" size={22} />
                                        )}
                                    </Card.Title>
                                    <Card.Text>{lesson.description}</Card.Text>
                                    <Button
                                        variant={buttonVariant}
                                        disabled={isLocked}
                                        onClick={() => !isLocked && handleLessonClick(lesson.id, isLastLessonWithoutTest)}
                                    >
                                        {isLocked
                                            ? 'Завершите предыдущий урок'
                                            : lesson.isCompleted
                                                ? 'Повторить'
                                                : 'Начать'}
                                    </Button>

                                </Card.Body>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {test && (
                <>
                    <h4 className="mt-4">📝 Тест</h4>
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <Card className={`${cardBg} shadow-sm h-100`}>
                                <Card.Body>
                                    <Card.Title className="d-flex justify-content-between align-items-center">
                                        {test.title || 'Тест к блоку'}
                                        {testCompleted ? (
                                            <CheckCircleFill color="green" size={22} />
                                        ) : (
                                            <XCircleFill color="red" size={22} />
                                        )}
                                    </Card.Title>
                                    <Card.Text>
                                        {testCompleted
                                            ? 'Тест успешно пройден! Повторное прохождение отключено.'
                                            : 'Пройди тест, чтобы закрепить знания!'}
                                    </Card.Text>
                                    <Button
                                        variant={buttonVariant}
                                        disabled={!lessons.every(l => l.isCompleted) || testCompleted}
                                        onClick={() => {
                                            if (lessons.every(l => l.isCompleted) && !testCompleted) {
                                                navigate(`/test/${test.id}`, {
                                                    state: { testData: test}
                                                });
                                            }
                                        }}
                                    >
                                        {!lessons.every(l => l.isCompleted)
                                            ? 'Завершите все уроки'
                                            : testCompleted
                                                ? 'Тест пройден'
                                                : 'Пройти тест'}
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Block;