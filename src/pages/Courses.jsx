import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const Courses = ({ theme }) => {
    const [myCourses, setMyCourses] = useState([]);
    const [passedLessons, setPassedLessons] = useState([]);
    const [userId, setUserId] = useState(null);

    const navigate = useNavigate();

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.expand();
        const user = tg.initDataUnsafe?.user;
        if (user) {
            setUserId(user.id);
            fetchMyCourses(user.id);
            fetchPassedLessons(user.id);
        }
    }, []);

    const fetchPassedLessons = async (telegramId) => {
        try {
            const { data } = await axios.get(`${URL}/api/Courses/lessons-sucsess`, {
                params: { telegramId }
            });
            const passed = data.map((entry) => entry.lessonId);
            setPassedLessons(passed);
        } catch (err) {
            console.error('❌ Ошибка при получении пройденных уроков:', err);
        }
    };

    const fetchMyCourses = async (telegramId) => {
        try {
            const { data: subscriptions } = await axios.get(`${URL}/api/Users/list-subscription-courses`, {
                params: { telegramId }
            });

            if (!subscriptions || subscriptions.length === 0) {
                setMyCourses([]);
                return;
            }

            const courseRequests = subscriptions.map(async (sub) => {
                try {
                    const courseId = sub.courseId || sub.id || sub;
                    const { data } = await axios.get(`${URL}/api/Courses`, {
                        params: { courseid: courseId }
                    });

                    // Fetch course blocks
                    const blocksResponse = await axios.get(`${URL}/api/Courses/blocks-by-course`, {
                        params: { courseId }
                    });
                    const blocks = blocksResponse.data;

                    // Fetch lessons for each block
                    const lessonRequests = blocks.map(async (block) => {
                        const lessonsResponse = await axios.get(`${URL}/api/Courses/lessons`, {
                            params: { blockId: block.id }
                        });
                        const lessons = lessonsResponse.data;

                        // Check if each lesson is completed
                        const lessonsWithStatus = await Promise.all(
                            lessons.map(async (lesson) => {
                                const successResponse = await axios.get(`${URL}/api/Courses/lesson-sucsess`, {
                                    params: { telegramId, lessonId: lesson.id }
                                });
                                return { ...lesson, isCompleted: successResponse.data };
                            })
                        );

                        return { block, lessons: lessonsWithStatus };
                    });

                    const blocksWithLessons = await Promise.all(lessonRequests);
                    return { ...data, blocks: blocksWithLessons };
                } catch (err) {
                    console.warn(`❌ Ошибка при получении курса ${sub.courseId || sub.id || sub}:`, err.message);
                    return null;
                }
            });

            const results = await Promise.all(courseRequests);
            const filtered = results.filter(course => course !== null);
            setMyCourses(filtered);
        } catch (err) {
            console.error('Ошибка при получении курсов пользователя:', err);
        }
    };

    const handleGoToCourse = (courseId) => {
        navigate(`/course/${courseId}/coursecontent`);
    };

    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📘 Мои курсы</h2>
            <Row>
                {myCourses.length === 0 && (
                    <Col>
                        <p>У вас пока нет активных курсов.</p>
                    </Col>
                )}
                {myCourses.map((course) => {
                    const totalLessons = course.blocks?.reduce((acc, block) => acc + block.lessons.length, 0) || 0;
                    const passedInThisCourse = course.blocks?.reduce((acc, block) => {
                        const passedLessonsInBlock = block.lessons.filter(lesson => lesson.isCompleted);
                        return acc + passedLessonsInBlock.length;
                    }, 0) || 0;

                    const progressPercent = totalLessons > 0
                        ? Math.round((passedInThisCourse / totalLessons) * 100)
                        : 0;

                    return (
                        <Col key={course.id} xs={12} md={6} lg={4} className="mb-4">
                            <Card className={`${cardBg} shadow-sm h-100`}>
                                <Card.Body>
                                    <Card.Title>{course.title}</Card.Title>
                                    <Card.Subtitle className="mb-2">
                                        {course.briefDescription}
                                    </Card.Subtitle>
                                    <Card.Text>
                                        <strong>Прогресс:</strong> {passedInThisCourse}/{totalLessons}
                                    </Card.Text>

                                    <ProgressBar
                                        now={progressPercent}
                                        label={`${progressPercent}%`}
                                        className="mb-3"
                                        variant={isDark ? 'info' : 'primary'}
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
