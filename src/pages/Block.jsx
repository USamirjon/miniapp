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


    // Стили для карточек
    const cardStyle = {
        minHeight: '150px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s'
    };

    const cardHoverProps = {
        onMouseOver: (e) => {
            if (!e.currentTarget.classList.contains('disabled-card')) {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
            }
        },
        onMouseOut: (e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
        }
    };


    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📦 {blockTitle}</h2>


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
                            <Card
                                className={`${cardBg} shadow-sm ${isLocked ? 'disabled-card opacity-75' : ''}`}
                                style={{
                                    ...cardStyle,
                                    cursor: isLocked ? 'not-allowed' : 'pointer'
                                }}
                                {...(!isLocked && cardHoverProps)}
                                onClick={() => !isLocked && handleLessonClick(lesson.id, isLastLessonWithoutTest)}
                            >
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <div>
                                        <Card.Title className="d-flex justify-content-between align-items-center">
                                            <span className="flex-grow-1">{lesson.title}</span>
                                            <span style={{ flexShrink: 0, marginLeft: '10px' }}>
                                               {lesson.isCompleted ? (
                                                   <CheckCircleFill color="green" size={22} />
                                               ) : (
                                                   <XCircleFill color="red" size={22} />
                                               )}
                                           </span>
                                        </Card.Title>
                                        <Card.Text>{lesson.briefDescription}</Card.Text>
                                    </div>
                                    <Button
                                        variant={buttonVariant}
                                        disabled={isLocked}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Предотвращаем всплытие события
                                            if (!isLocked) handleLessonClick(lesson.id, isLastLessonWithoutTest);
                                        }}
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
                            <Card
                                className={`${cardBg} shadow-sm ${!lessons.every(l => l.isCompleted) || testCompleted ? 'disabled-card opacity-75' : ''}`}
                                style={{
                                    ...cardStyle,
                                    cursor: !lessons.every(l => l.isCompleted) || testCompleted ? 'not-allowed' : 'pointer'
                                }}
                                {...(lessons.every(l => l.isCompleted) && !testCompleted && cardHoverProps)}
                                onClick={() => {
                                    if (lessons.every(l => l.isCompleted) && !testCompleted) {
                                        navigate(`/test/${test.id}`, {
                                            state: { testData: test }
                                        });
                                    }
                                }}
                            >
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <div>
                                        <Card.Title className="d-flex justify-content-between align-items-center">
                                            <span className="flex-grow-1">{test.title || 'Тест к блоку'}</span>
                                            <span style={{ flexShrink: 0, marginLeft: '10px' }}>
                                               {testCompleted ? (
                                                   <CheckCircleFill color="green" size={22} />
                                               ) : (
                                                   <XCircleFill color="red" size={22} />
                                               )}
                                           </span>
                                        </Card.Title>
                                        <Card.Text>
                                            {testCompleted
                                                ? 'Тест успешно пройден! Повторное прохождение отключено.'
                                                : 'Пройди тест, чтобы закрепить знания!'}
                                        </Card.Text>
                                    </div>
                                    <Button
                                        variant={buttonVariant}
                                        disabled={!lessons.every(l => l.isCompleted) || testCompleted}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Предотвращаем всплытие события
                                            if (lessons.every(l => l.isCompleted) && !testCompleted) {
                                                navigate(`/test/${test.id}`, {
                                                    state: { testData: test }
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

