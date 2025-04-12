import React, { useEffect, useState } from 'react';
import {
    Button, Card, Row, Col,
    Collapse, Form, ButtonGroup
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {URL} from '../domain.ts'

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
            fetchCourses();
            fetchPurchasedCourses(user.id);
        }
    }, []);



    const fetchCourses = async () => {
        try {
            const res = await fetch(URL+'/api/Course/all');
            const data = await res.json();
            setCourses(data);
            setFilteredCourses(data);
            setTopics([...new Set(data.map(c => c.topic))]);
        } catch (err) {
            console.error("Failed to fetch courses:", err);
        }


        // Заглушка
        /*const data = [
            { id: 1, title: 'JS', topic: 'Frontend', price: 0, description: 'Learn JS', createdAt: '2025-01-01' },
            { id: 2, title: 'UX', topic: 'Design', price: 300, description: 'UX course', createdAt: '2025-02-01' },
            { id: 3, title: 'оX', topic: 'Design', price: 300, description: 'UX course', createdAt: '2025-02-01' },
        ];
        setCourses(data);
        setFilteredCourses(data);
        setTopics([...new Set(data.map(c => c.topic))]);*/

    };

    const fetchPurchasedCourses = async (telegramId) => {
        /*try {
            const res = await fetch(`https://localhost:7137/api/users/${telegramId}/courses`);
            const data = await res.json();
            setPurchasedCourses(data.map(c => c.id));
        } catch (err) {
            console.error("Failed to fetch user courses:", err);
        }*/

         setPurchasedCourses([1]); // Заглушка
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
            navigate(`/course/${id}`);
        } else {
            navigate(`/course/${id}/details`);
        }
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
                        {/* Цена */}
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            <strong>Цена:</strong>
                            <ButtonGroup>
                                <Button variant={priceFilter === 'free' ? 'secondary' : 'outline-secondary'} onClick={() => setPriceFilter('free')}>Бесплатные</Button>
                                <Button variant={priceFilter === 'paid' ? 'secondary' : 'outline-secondary'} onClick={() => setPriceFilter('paid')}>Платные</Button>
                                <Button variant={!priceFilter ? 'secondary' : 'outline-secondary'} onClick={() => setPriceFilter(null)}>Все</Button>
                            </ButtonGroup>
                        </div>

                        {/* Дата */}
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            <strong>Дата:</strong>
                            <ButtonGroup>
                                <Button variant={dateOrder === 'newest' ? 'secondary' : 'outline-secondary'} onClick={() => setDateOrder('newest')}>Новые</Button>
                                <Button variant={dateOrder === 'oldest' ? 'secondary' : 'outline-secondary'} onClick={() => setDateOrder('oldest')}>Старые</Button>
                                <Button variant={!dateOrder ? 'secondary' : 'outline-secondary'} onClick={() => setDateOrder(null)}>Без сорт.</Button>
                            </ButtonGroup>
                        </div>

                        {/* Темы */}
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
                {filteredCourses.map(course => (
                    <Col key={course.id} md={6} lg={4} className="mb-4">
                        <Card className={`${cardBg} shadow`}>
                            <Card.Body>
                                <Card.Title>{course.title}</Card.Title>
                                <Card.Text>{course.description}</Card.Text>
                                <Card.Text><strong>Тема:</strong> {course.topic}</Card.Text>
                                <Card.Text><strong>Цена:</strong> {course.price}₽</Card.Text>
                                <Button
                                    variant={purchasedCourses.includes(course.id) ? 'success' : 'primary'}
                                    onClick={() => handleCourseClick(course.id)}
                                >
                                    {purchasedCourses.includes(course.id) ? 'Перейти к курсу' : 'Подробнее'}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Home;
