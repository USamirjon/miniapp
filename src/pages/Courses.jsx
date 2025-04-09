import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Courses = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [userId, setUserId] = useState(null);

    const navigate = useNavigate();

    const theme = localStorage.getItem('theme') || 'light';
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = theme === 'dark' ? 'light' : 'primary';

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.expand();
        const user = tg.initDataUnsafe?.user;
        if (user) {
            setUserId(user.id);
            fetchMyCourses(user.id);
        }
    }, []);

    const fetchMyCourses = async (telegramId) => {
        try {
            const res = await fetch(`https://localhost:7137/api/users/${telegramId}/courses`);
            const data = await res.json();
            setMyCourses(data);
        } catch (err) {
            console.error('Ошибка при получении курсов пользователя:', err);
        }
    };

    const handleGoToCourse = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">📘 Мои курсы</h2>
            <Row>
                {myCourses.length === 0 && (
                    <Col>
                        <p>У вас пока нет активных курсов.</p>
                    </Col>
                )}

                {myCourses.map((course) => {
                    const progressPercent = Math.round(
                        (course.lessonsPassed / course.totalLessons) * 100
                    );

                    return (
                        <Col key={course.id} xs={12} md={6} lg={4} className="mb-4">
                            <Card className={`${cardBg} shadow-sm h-100`}>
                                <Card.Body>
                                    <Card.Title>{course.title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{course.topic}</Card.Subtitle>
                                    <Card.Text>
                                        <strong>Прогресс:</strong>{' '}
                                        {course.lessonsPassed}/{course.totalLessons}
                                    </Card.Text>

                                    <ProgressBar
                                        now={progressPercent}
                                        label={`${progressPercent}%`}
                                        className="mb-3"
                                    />

                                    <Button
                                        variant={buttonVariant}
                                        onClick={() => handleGoToCourse(course.id)}
                                    >
                                        Перейти
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default Courses;
