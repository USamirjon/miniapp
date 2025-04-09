import React, { useEffect, useState } from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';

const Lessons = ({ theme }) => {
    const { courseId } = useParams();
    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    const [lessons, setLessons] = useState([]);
    const [courseTitle, setCourseTitle] = useState('');

    useEffect(() => {
        // Заглушка — в будущем заменить на запрос к API:
        setCourseTitle('Frontend на React');

        setLessons([
            {
                id: 1,
                title: 'Основы Telegram Mini App',
                description: 'Изучим, как работает Telegram WebApp и как подключиться.',
                progress: 100
            },
            {
                id: 2,
                title: 'Видео-уроки и теория',
                description: 'Добавим видео и текстовые материалы в приложение.',
                progress: 60
            },
            {
                id: 3,
                title: 'Создание тестов',
                description: 'Пользователь сможет пройти интерактивный тест.',
                progress: 0
            }
        ]);

        // API-запрос, если будет бэк:
        // const fetchLessons = async () => {
        //     const res = await fetch(`https://localhost:7137/api/courses/${courseId}/lessons`);
        //     const data = await res.json();
        //     setLessons(data.lessons);
        //     setCourseTitle(data.title);
        // };
        // fetchLessons();
    }, [courseId]);

    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📚 Уроки курса: {courseTitle}</h2>

            <div className="row">
                {lessons.map(lesson => (
                    <div className="col-md-6 mb-4" key={lesson.id}>
                        <Card className={`${cardBg} shadow-sm h-100`}>
                            <Card.Body>
                                <Card.Title>{lesson.title}</Card.Title>
                                <Card.Text>{lesson.description}</Card.Text>

                                <ProgressBar
                                    now={lesson.progress}
                                    label={`${lesson.progress}%`}
                                    className="mb-3"
                                    variant={isDark ? 'info' : 'primary'}
                                />

                                <Link to={`/lesson/${lesson.id}`}>
                                    <Button variant={buttonVariant}>
                                        {lesson.progress === 100 ? 'Повторить' : 'Начать'}
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

export default Lessons;
