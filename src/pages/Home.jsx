import React, { useEffect, useState } from 'react';
import {
    Button, Card, Row, Col,
    Collapse, Form, ButtonGroup, Badge
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
    const [topics, setTopics] = useState([]);
    const [priceFilter, setPriceFilter] = useState(null);
    const [dateOrder, setDateOrder] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [filtersOpen, setFiltersOpen] = useState(false);

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
            setTopics([...new Set(data.map(c => c.topic))]);

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

    const toggleTopic = (topic) => {
        setSelectedTopics(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    const applyFilters = () => {
        let result = [...courses];

        if (priceFilter === 'free') result = result.filter(c => c.price === 0);
        else if (priceFilter === 'paid') result = result.filter(c => c.price > 0);

        if (selectedTopics.length) {
            result = result.filter(c => selectedTopics.includes(c.topic));
        }

        if (dateOrder === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (dateOrder === 'oldest') {
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        setFilteredCourses(result);
    };

    useEffect(() => {
        applyFilters();
    }, [priceFilter, selectedTopics, dateOrder, courses]);

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

    return (
        <div className="container mt-4">
            <h2 className="mb-2">📚 Доступные курсы</h2>

            <div className="mb-3 text-center">
                <Button
                    variant="primary"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="rounded-pill px-4"
                >
                    {filtersOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
                </Button>
            </div>

            <Collapse in={filtersOpen}>
                <div className="mb-4">
                    <div className="d-flex flex-column gap-3">
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            <strong>Цена:</strong>
                            <ButtonGroup>
                                <Button variant={priceFilter === 'free' ? 'secondary' : 'outline-secondary'} onClick={() => setPriceFilter('free')}>Бесплатные</Button>
                                <Button variant={priceFilter === 'paid' ? 'secondary' : 'outline-secondary'} onClick={() => setPriceFilter('paid')}>Платные</Button>
                                <Button variant={!priceFilter ? 'secondary' : 'outline-secondary'} onClick={() => setPriceFilter(null)}>Все</Button>
                            </ButtonGroup>
                        </div>

                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            <strong>Дата:</strong>
                            <ButtonGroup>
                                <Button variant={dateOrder === 'newest' ? 'secondary' : 'outline-secondary'} onClick={() => setDateOrder('newest')}>Новые</Button>
                                <Button variant={dateOrder === 'oldest' ? 'secondary' : 'outline-secondary'} onClick={() => setDateOrder('oldest')}>Старые</Button>
                                <Button variant={!dateOrder ? 'secondary' : 'outline-secondary'} onClick={() => setDateOrder(null)}>Без сорт.</Button>
                            </ButtonGroup>
                        </div>

                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            <strong>Темы:</strong>
                            {topics.map((topic, idx) => (
                                <Form.Check
                                    inline
                                    key={idx}
                                    label={topic}
                                    type="checkbox"
                                    checked={selectedTopics.includes(topic)}
                                    onChange={() => toggleTopic(topic)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </Collapse>

            <Row>
                {filteredCourses.map(course => {
                    const discountPercentage = calculateDiscountPercentage(course.price, course.priceWithDiscount);

                    return (
                        <Col key={course.id} md={6} lg={4} className="mb-4 position-relative">
                            <Col key={course.id} md={6} lg={4} className="mb-4 position-relative">
                                <Card
                                    className={`${cardBg} shadow`}
                                    onClick={() => handleCourseClick(course.id)}
                                    style={{ cursor: 'pointer' }}  // Добавляем стиль курсора, чтобы было понятно, что карточка кликабельна
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
                                        <Card.Title>{course.title}</Card.Title>
                                        <Card.Text>{course.description}</Card.Text>
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
                                                    e.stopPropagation(); // Предотвращаем всплытие события, чтобы клик по кнопке не активировал карточку
                                                    handleCourseClick(course.id);
                                                }}
                                            >
                                                {getButtonText(course)}
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default Home;
