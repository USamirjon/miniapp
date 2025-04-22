import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const CourseContent = ({ theme }) => {
    const { id: courseId } = useParams();
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${URL}/api/Courses/blocks-by-course`, {
                    params: { courseId }
                });
                setBlocks(response.data);
            } catch (err) {
                console.error("Ошибка при получении блоков курса:", err);
                setError('Не удалось загрузить блоки курса.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchBlocks();
        }
    }, [courseId]);

    if (loading) {
        return <div className="container mt-4 text-center"><h5>Загрузка...</h5></div>;
    }

    if (error) {
        return (
            <div className="container mt-4 text-center">
                <h4>Ошибка</h4>
                <p>{error}</p>
                <Link to="/courses">
                    <Button variant={buttonVariant}>Назад</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-4">📦 Содержание курса</h3>
            <div className="row">
                {blocks.map((block) => (
                    <div className="col-md-6 mb-4" key={block.id}>
                        <Card className={`${cardBg} shadow-sm`}>
                            <Card.Body>
                                <Card.Title>{block.title}</Card.Title>
                                <Link to={`/block/${block.id}`} state={{ blockTitle: block.title }}>
                                    <Button variant={buttonVariant}>Перейти к блоку</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseContent;
