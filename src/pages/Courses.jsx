import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const Courses = ({ theme }) => {
    const [myCourses, setMyCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
            loadUserCoursesData(user.id);
        }
    }, []);

    // Combined function to fetch all necessary data in parallel
    const loadUserCoursesData = async (telegramId) => {
        try {
            setIsLoading(true);

            // Get subscriptions first
            const { data: subscriptions } = await axios.get(
                `${URL}/api/Users/list-subscription-courses`,
                { params: { telegramId } }
            );

            if (!subscriptions || subscriptions.length === 0) {
                setMyCourses([]);
                setIsLoading(false);
                return;
            }

            // Fetch all courses in parallel
            const courseIds = subscriptions.map(sub => sub.courseId || sub.id || sub);

            const coursesPromises = courseIds.map(courseId =>
                axios.get(`${URL}/api/Courses`, { params: { courseid: courseId } })
            );

            const blocksPromises = courseIds.map(courseId =>
                axios.get(`${URL}/api/Courses/blocks-by-course`, { params: { courseId } })
            );

            // Execute all those requests in parallel
            const [coursesResponses, blocksResponses] = await Promise.all([
                Promise.all(coursesPromises),
                Promise.all(blocksPromises)
            ]);

            // Process courses with their blocks and lessons
            const processedCourses = await Promise.all(coursesResponses.map(async (courseResponse, index) => {
                const course = courseResponse.data;
                const blocks = blocksResponses[index].data;

                // Check block completion status for each block
                const blockCompletionPromises = blocks.map(block =>
                    axios.get(`${URL}/api/Users/is-active-block-course`, {
                        params: { telegramId, blockId: block.id }
                    })
                );

                const blockCompletionResponses = await Promise.all(blockCompletionPromises);

                // Map blocks with their completion status
                // Note: is-active-block-course returns true when the block is NOT completed
                const blocksWithStatus = blocks.map((block, blockIndex) => ({
                    ...block,
                    isCompleted: !blockCompletionResponses[blockIndex].data // Invert the value
                }));

                return { ...course, blocks: blocksWithStatus };
            }));

            setMyCourses(processedCourses.filter(course => course !== null));
        } catch (err) {
            console.error('Error loading user courses data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToCourse = (courseId) => {
        navigate(`/course/${courseId}/coursecontent`);
    };

    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📘 Мои курсы</h2>

            {isLoading ? (
                <div className="text-center">Загрузка курсов...</div>
            ) : (
                <Row>
                    {myCourses.length === 0 && (
                        <Col>
                            <p>У вас пока нет активных курсов.</p>
                        </Col>
                    )}
                    {myCourses.map((course) => {
                        const totalBlocks = course.blocks?.length || 0;
                        const completedBlocks = course.blocks?.filter(block => block.isCompleted).length || 0;
                        const progressPercent = totalBlocks > 0
                            ? Math.round((completedBlocks / totalBlocks) * 100)
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
                                            <strong>Прогресс:</strong> {completedBlocks}/{totalBlocks} блоков
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
            )}
        </div>
    );
};

export default Courses;