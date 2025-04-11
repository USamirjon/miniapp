import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

const CourseDetails = ({ theme }) => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [courseTitle, setCourseTitle] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        // Заглушка:
        setLessons([
            {
                id: 101,
                title: 'Введение в курс',
                description: 'Основы, структура и цели курса',
                isPassed: true,
            },
            {
                id: 102,
                title: 'JSX и компоненты',
                description: 'Как писать JSX и создавать компоненты',
                isPassed: false,
            }
        ]);
        setCourseTitle('Демо-курс React');

        // Когда будет API:
        // fetchCourseLessons();
    }, [courseId]);

    // const fetchCourseLessons = async () => {
    //     try {
    //         const res = await fetch(`https://localhost:7137/api/courses/${courseId}/lessons`);
    //         const data = await res.json();
    //         setLessons(data.lessons);
    //         setCourseTitle(data.title);
    //     } catch (err) {
    //         console.error('Ошибка при получении уроков курса:', err);
    //     }
    // };

    const handleGoToLesson = (lessonId) => {
        navigate(`/lesson/${lessonId}`);
    };

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📘 {courseTitle}</h2>

            <Row>
                {lessons.map((lesson) => (
                    <Col xs={12} md={6} key={lesson.id} className="mb-4">
                        <Card className={`${cardBg} shadow-sm h-100`}>
                            <Card.Body>
                                <Card.Title className="d-flex justify-content-between align-items-center">
                                    {lesson.title}
                                    {lesson.isPassed ? (
                                        <CheckCircleFill color="limegreen" size={24} />
                                    ) : (
                                        <XCircleFill color="tomato" size={24} />
                                    )}
                                </Card.Title>
                                <Card.Text>{lesson.description}</Card.Text>
                                <div className="d-grid">
                                    <Button
                                        variant={buttonVariant}
                                        onClick={() => handleGoToLesson(lesson.id)}
                                    >
                                        {lesson.isPassed ? 'Повторить' : 'Начать'}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default CourseDetails;
