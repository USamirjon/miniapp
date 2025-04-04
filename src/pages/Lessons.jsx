import React from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const lessons = [
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
];

const Lessons = () => {
    const theme = localStorage.getItem('theme') || 'light';
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';

    return (
        <div>
            <h2 className="mb-4">📚 Список уроков</h2>

            <div className="row">
                {lessons.map(lesson => (
                    <div className="col-md-6 mb-4" key={lesson.id}>
                        <Card className={`${cardBg} shadow-sm h-100`}>
                            <Card.Body>
                                <Card.Title>{lesson.title}</Card.Title>
                                <Card.Text>{lesson.description}</Card.Text>

                                <ProgressBar now={lesson.progress} label={`${lesson.progress}%`} className="mb-3" />

                                <Link to={`/lesson/${lesson.id}`}>
                                    <Button variant={theme === 'dark' ? 'light' : 'primary'}>
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
