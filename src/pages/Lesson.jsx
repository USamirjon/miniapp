import React, { useEffect, useState } from 'react';
import { Button, Card, ProgressBar } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const Lesson = ({ onFinish, theme }) => {
    const { id, courseId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${URL}/api/Course/lessonByCourse`, {
                    params: { courseId }
                });

                const foundLesson = data.find(l => l.testId === id);
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

        fetchLesson();
    }, [id, courseId]);

    const handleComplete = () => {
        setCompleted(true);
        if (lesson.experience) {
            onFinish(lesson.experience);
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

                    {lesson.urlVideo && (
                        <video width="100%" controls className="mb-3">
                            <source src={lesson.urlVideo} type="video/mp4" />
                            Ваш браузер не поддерживает видео.
                        </video>
                    )}

                    <ProgressBar now={completed ? 100 : 0} label={`${completed ? 100 : 0}%`} className="mb-3" />

                    {!completed ? (
                        <Button className="btn btn-success mb-2" onClick={handleComplete}>
                            ✅ Завершить урок
                        </Button>
                    ) : (
                        <Button variant="success" disabled className="mb-2">
                            Урок завершён
                        </Button>
                    )}

                    {lesson.testId && (
                        <Link to={`/test/${lesson.testId}`}>
                            <Button variant={isDark ? 'outline-light' : 'outline-primary'}>
                                📋 Перейти к тесту
                            </Button>
                        </Link>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Lesson;
