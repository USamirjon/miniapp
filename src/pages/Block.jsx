import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

const Block = ({ theme }) => {
    const { id: blockId } = useParams();
    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    const [lessons, setLessons] = useState([]);
    const [tests, setTests] = useState([]);
    const [blockTitle, setBlockTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const telegramUser = tg?.initDataUnsafe?.user;
        if (telegramUser?.id) {
            setUserId(telegramUser.id);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const blockRes = await axios.get(`${URL}/api/Block`, {
                    params: { blockId }
                });

                const blockData = blockRes.data;
                setBlockTitle(blockData?.title || '');
                const rawLessons = blockData.lessons || [];
                const rawTests = blockData.tests || [];

                // Обогащаем уроки и тесты статусом прохождения
                const fetchStatuses = async (items, type) => {
                    return Promise.all(
                        items.map(item =>
                            axios.get(`${URL}/api/Course/${type}Sucsess`, {
                                params: {
                                    telegramId: userId,
                                    [`${type}Id`]: item.id
                                }
                            })
                                .then(res => res.data)
                                .catch(() => false)
                        )
                    );
                };

                const completedLessonStatuses = userId
                    ? await fetchStatuses(rawLessons, 'lesson')
                    : rawLessons.map(() => false);

                const completedTestStatuses = userId
                    ? await fetchStatuses(rawTests, 'test')
                    : rawTests.map(() => false);

                setLessons(rawLessons.map((lesson, i) => ({
                    ...lesson,
                    isCompleted: completedLessonStatuses[i]
                })));

                setTests(rawTests.map((test, i) => ({
                    ...test,
                    isCompleted: completedTestStatuses[i]
                })));

            } catch (err) {
                console.error('Ошибка при загрузке блока или уроков/тестов:', err);
                setError('Не удалось загрузить данные блока.');
            } finally {
                setLoading(false);
            }
        };

        if (blockId) {
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

    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📦 Блок: {blockTitle}</h2>

            {/* Уроки */}
            {lessons.length > 0 && <h4>📘 Уроки</h4>}
            <div className="row">
                {lessons.map((lesson) => (
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
                                <Link to={`/lesson/${lesson.id}`}>
                                    <Button variant={buttonVariant}>
                                        {lesson.isCompleted ? 'Повторить' : 'Начать'}
                                    </Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Тесты */}
            {tests.length > 0 && <h4 className="mt-4">📝 Тесты</h4>}
            <div className="row">
                {tests.map((test) => (
                    <div className="col-md-6 mb-4" key={test.id}>
                        <Card className={`${cardBg} shadow-sm h-100`}>
                            <Card.Body>
                                <Card.Title className="d-flex justify-content-between align-items-center">
                                    {test.title}
                                    {test.isCompleted ? (
                                        <CheckCircleFill color="green" size={22} />
                                    ) : (
                                        <XCircleFill color="red" size={22} />
                                    )}
                                </Card.Title>
                                <Card.Text>{test.description}</Card.Text>
                                <Link to={`/test/${test.id}`}>
                                    <Button variant={buttonVariant}>
                                        {test.isCompleted ? 'Пройти снова' : 'Пройти тест'}
                                    </Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Block;
