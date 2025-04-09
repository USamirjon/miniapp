import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

const CoursePage = () => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [courseTitle, setCourseTitle] = useState('');
    const [theme, setTheme] = useState('light');

    const navigate = useNavigate();

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);

        fetchCourseLessons();
    }, [courseId]);

    const fetchCourseLessons = async () => {
        try {
            const res = await fetch(`https://localhost:7137/api/courses/${courseId}/lessons`);
            const data = await res.json();
            setLessons(data.lessons);
            setCourseTitle(data.title);
        } catch (err) {
            console.error('Ошибка при получении уроков курса:', err);
        }
    };

    const handleGoToLesson = (lessonId) => {
        navigate(`/lesson/${lessonId}`);
    };

    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = theme === 'dark' ? 'light' : 'primary';

    return (
        <div className="container mt-4">
            <h2 className="mb-4">📘 {courseTitle}</h2>

            <Row>
                {lessons.map((lesson) => (
                    <Col xs={12} md={6} key={lesson.id} className="mb-4">
                        <Card className={`${cardBg} shadow-sm h-100`}>
                            <Card.Body>
                                <Card.Title className="d-flex justify-content-between align-items-center">
                                    {lesson.title}
                                    {lesson.isPassed ? (
                                        <CheckCircleFill color="green" size={24} />
                                    ) : (
                                        <XCircleFill color="red" size={24} />
                                    )}
                                </Card.Title>
                                <Card.Text>{lesson.description}</Card.Text>
                                <Button
                                    variant={buttonVariant}
                                    onClick={() => handleGoToLesson(lesson.id)}
                                >
                                    {lesson.isPassed ? 'Повторить' : 'Начать'}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default CoursePage;
