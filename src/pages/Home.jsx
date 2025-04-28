import React, { useEffect, useState } from 'react';
import {
    Button, Card, Row, Col,
    Form, Badge
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';
import limit from 'p-limit';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [purchasedCourses, setPurchasedCourses] = useState([]);
    const [userId, setUserId] = useState(null);
    const [showFreeOnly, setShowFreeOnly] = useState(false);

    const navigate = useNavigate();
    const theme = localStorage.getItem('theme') || 'light';
    const cardBg = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.expand();
        const user = tg.initDataUnsafe?.user;

        if (user) {
            setUserId(user.id);
            fetchCourses(user.id);
        }
    }, []);

    const fetchCourses = async (telegramId) => {
        try {
            const res = await axios.get(URL + '/api/Courses/all');
            const data = res.data;
            setCourses(data);
            setFilteredCourses(data);

            const limiter = limit(5);

            const checkSubscriptions = data.map(course =>
                limiter(async () => {
                    try {
                        const response = await axios.get(URL + '/api/Courses/is-subscribe', {
                            params: {
                                telegramId,
                                courseId: course.id
                            }
                        });
                        return response.data ? course.id : null;
                    } catch (error) {
                        console.error(`Ошибка при проверке подписки на курс ${course.id}`, error);
                        return null;
                    }
                })
            );

            const subscriptions = await Promise.all(checkSubscriptions);
            setPurchasedCourses(subscriptions.filter(Boolean));
        } catch (err) {
            console.error("Не удалось получить курсы:", err);
        }
    };

    useEffect(() => {
        if (courses.length) {
            if (showFreeOnly) {
                setFilteredCourses(courses.filter(c => c.price === 0));
            } else {
                setFilteredCourses(courses);
            }
        }
    }, [showFreeOnly, courses]);

    const handleCourseClick = (id) => {
        if (purchasedCourses.includes(id)) {
            navigate(`/course/${id}/coursecontent`);
        } else {
            navigate(`/course/${id}/details`);
        }
    };

    const getButtonText = (course) => {
        if (purchasedCourses.includes(course.id)) {
            return 'Перейти к курсу';
        }
        return course.price > 0 ? 'Купить' : 'Подписаться';
    };

    const getButtonVariant = (course) => {
        if (purchasedCourses.includes(course.id)) {
            return 'success';
        }
        return course.price > 0 ? 'primary' : 'info';
    };

    const calculateDiscountPercentage = (price, priceWithDiscount) => {
        if (price > 0 && priceWithDiscount && priceWithDiscount < price) {
            const discount = ((price - priceWithDiscount) / price) * 100;
            return Math.round(discount);
        }
        return 0;
    };

    // Переключатель для фильтра Free
    const toggleFreeOnly = () => {
        setShowFreeOnly(!showFreeOnly);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-3">📚 Доступные курсы</h2>

            <div className="d-flex justify-content-end mb-4">
                <div className="d-flex align-items-center">
                    <span className="fw-bold me-2" style={{ fontSize: '1.1rem' }}>Free</span>
                    <div
                        className="form-check form-switch"
                        onClick={toggleFreeOnly}
                        style={{ cursor: 'pointer' }}
                    >
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="free-toggle"
                            checked={showFreeOnly}
                            onChange={() => {}} // Добавлен пустой обработчик для избежания предупреждений
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                </div>
            </div>

            <Row>
                {filteredCourses.map(course => {
                    const discountPercentage = calculateDiscountPercentage(course.price, course.priceWithDiscount);

                    return (
                        <Col key={course.id} md={6} lg={4} className="mb-4 position-relative">
                            <Card
                                className={`${cardBg} shadow`}
                                onClick={() => handleCourseClick(course.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {course.discount && course.priceWithDiscount && (
                                    <Badge
                                        bg="danger"
                                        className="position-absolute top-0 end-0 m-2 rounded-pill"
                                        style={{ zIndex: 1 }}
                                    >
                                        -{discountPercentage}%
                                    </Badge>
                                )}

                                <Card.Body>
                                    <Card.Title className="pe-3">{course.title}</Card.Title>
                                    <Card.Text>{course.briefDescription}</Card.Text>
                                    <Card.Text><strong>Тема:</strong> {course.topic}</Card.Text>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            {course.discount && course.priceWithDiscount ? (
                                                <>
                                                    <del>{course.price}₽</del>{' '}
                                                    <span className="text-success fw-bold">{course.priceWithDiscount}₽</span>
                                                </>
                                            ) : (
                                                <span>{course.price === 0 ? 'Бесплатно' : `${course.price}₽`}</span>
                                            )}
                                        </div>
                                        <Button
                                            variant={getButtonVariant(course)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCourseClick(course.id);
                                            }}
                                        >
                                            {getButtonText(course)}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default Home;