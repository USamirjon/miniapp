import React, { useState } from 'react';
import { Button, Card, ProgressBar } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const lessons = [
    {
        id: 1,
        title: 'Основы Telegram Mini App',
        description: 'Изучим, как работает Telegram WebApp и как подключиться.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Пример видео
        progress: 100
    },
    {
        id: 2,
        title: 'Видео-уроки и теория',
        description: 'Добавим видео и текстовые материалы в приложение.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        progress: 60
    },
    {
        id: 3,
        title: 'Создание тестов',
        description: 'Пользователь сможет пройти интерактивный тест.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        progress: 0
    }
];

const Lesson = ({ onFinish }) => {
    const { id } = useParams();
    const lesson = lessons.find(l => l.id === parseInt(id));

    const [completed, setCompleted] = useState(lesson.progress === 100);

    const handleComplete = () => {
        setCompleted(true);
    };

    const theme = localStorage.getItem('theme') || 'light';
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';

    return (
        <div className="container">
            <Card className={`${cardBg} shadow-sm`}>
                <Card.Body>
                    <Card.Title>{lesson.title}</Card.Title>
                    <Card.Text>{lesson.description}</Card.Text>

                    <video width="100%" controls>
                        <source src={lesson.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    <ProgressBar now={lesson.progress} label={`${lesson.progress}%`} className="my-3" />

                    {!completed && (
                        <Button variant="primary" onClick={handleComplete}>
                            Завершить урок
                        </Button>
                        //<Button className="btn btn-success mt-3" onClick={() => onFinish(50)}>
                        //    ✅ Завершить урок
                        //</Button>
                    )}

                    {completed && (
                        <Button variant="success" disabled>
                            Урок завершён
                        </Button>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Lesson;
