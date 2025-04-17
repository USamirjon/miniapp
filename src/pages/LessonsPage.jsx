import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

const LessonsPage = ({ theme }) => {
    const { id: courseId } = useParams();
    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    const [lessons, setLessons] = useState([]);
    const [courseTitle, setCourseTitle] = useState('');
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
        const fetchLessons = async () => {
            try {
                setLoading(true);
                setError(null);

                const [courseRes, lessonsRes] = await Promise.all([
                    axios.get(`${URL}/api/Course`, { params: { courseid: courseId } }),
                    axios.get(`${URL}/api/Course/lessonByCourse`, { params: { courseId } })
                ]);

                setCourseTitle(courseRes.data?.title || '');

                // Здесь ты можешь заменить временную логику на реальный API:
                const lessonsWithStatus = lessonsRes.data.map((lesson, idx) => ({
                    ...lesson,
                    id: lesson.testId,
                    isCompleted: idx === 0 // только первый считается пройденным — демонстрация
                }));

                setLessons(lessonsWithStatus);
            } catch (err) {
                console.error('Ошибка при загрузке курса и уроков:', err);
                setError('Не удалось загрузить данные курса. Попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchLessons();
    }, [courseId]);

    if (loading) {
        return <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}><h4>Загрузка...</h4></div>;
    }

    if (error) {
        return (
            <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
                <h4>Ошибка</h4>
                <p>{error}</p>
                <Link to="/courses">
                    <Button variant={buttonVariant}>Назад к курсам</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📘 Уроки курса: {courseTitle}</h2>

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

                                <Link to={`/course/${courseId}/lesson/${lesson.id}`}>
                                    <Button variant={buttonVariant}>
                                        {lesson.isCompleted ? 'Повторить' : 'Начать'}
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

export default LessonsPage;
