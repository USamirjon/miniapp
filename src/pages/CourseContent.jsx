import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

const CourseContent = ({ theme }) => {
    const { id: courseId } = useParams();
    const [blocks, setBlocks] = useState([]);
    const [blockStatuses, setBlockStatuses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const telegramUser = tg?.initDataUnsafe?.user;

        const fetchBlocks = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${URL}/api/Courses/blocks-by-course`, {
                    params: { courseId }
                });

                const sortedBlocks = response.data.sort((a, b) => a.numberOfBLock - b.numberOfBLock);
                setBlocks(sortedBlocks);

                if (telegramUser?.id) {
                    const statuses = {};
                    await Promise.all(sortedBlocks.map(async (block) => {
                        try {
                            const statusRes = await axios.get(`${URL}/api/Users/is-active-block-course`, {
                                params: {
                                    telegramId: telegramUser.id,
                                    blockId: block.id
                                }
                            });
                            statuses[block.id] = statusRes.data;
                        } catch {
                            statuses[block.id] = true; // если ошибка — считаем активным
                        }
                    }));
                    setBlockStatuses(statuses);
                }
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
                {blocks.map((block) => {
                    const isActive = blockStatuses[block.id];
                    const title = `Блок ${block.numberOfBLock}. ${block.title}`;
                    const buttonText = isActive ? 'Перейти к блоку' : 'Повторить';

                    return (
                        <div className="col-md-6 mb-4" key={block.id}>
                            <Card className={`${cardBg} shadow-sm`}>
                                <Card.Body>
                                    <Card.Title className="d-flex justify-content-between align-items-center">
                                        {title}
                                        {isActive === false ? (
                                            <CheckCircleFill color="green" size={22} />
                                        ) : (
                                            <XCircleFill color="red" size={22} />
                                        )}
                                    </Card.Title>
                                    <Link to={`/block/${block.id}`} state={{ blockTitle: block.title }}>
                                        <Button variant={buttonVariant}>{buttonText}</Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CourseContent;
