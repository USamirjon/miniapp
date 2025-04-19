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
        const fetchData = async () => {
            try {
                setLoading(true);
                const courseRes = await axios.get(`${URL}/api/Course`, {
                    params: { courseid: courseId }
                });

                const courseData = courseRes.data;
                setCourseTitle(courseData?.title || '');
                const rawLessons = courseData.lessons || [];

                if (!userId) {
                    setLessons(rawLessons.map(lesson => ({
                        ...lesson,
                        isCompleted: false
                    })));
                    return;
                }

                const completedStatuses = await Promise.all(
                    rawLessons.map(lesson =>
                        axios.get(`${URL}/api/Course/lessonSucsess`, {
                            params: {
                                telegramId: userId,
                                lessonId: lesson.id
                            }
                        })
                            .then(res => res.data)
                            .catch(() => false)
                    )
                );

                const enrichedLessons = rawLessons.map((lesson, idx) => ({
                    ...lesson,
                    isCompleted: completedStatuses[idx]
                }));

                setLessons(enrichedLessons);
            } catch (err) {
                console.error('Ошибка при загрузке курса или уроков:', err);
                setError('Не удалось загрузить данные курса.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchData();
        }
    }, [courseId, userId]);

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
