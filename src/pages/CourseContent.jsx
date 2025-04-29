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
                    const buttonText = isActive ? 'Перейти к блоку' : 'Повторить';


                    return (
                        <div className="col-md-6 mb-4" key={block.id}>
                            <Link
                                to={`/block/${block.id}`}
                                state={{ blockTitle: block.title }}
                                style={{ textDecoration: 'none' }}
                            >
                                <Card
                                    className={`${cardBg} shadow-sm`}
                                    style={{
                                        minHeight: '120px',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
                                    }}
                                >
                                    <Card.Body className="d-flex flex-column justify-content-between">
                                        <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="flex-grow-1">{block.title}</span>
                                            <span style={{ flexShrink: 0, marginLeft: '10px' }}>{isActive === false ? (
                                                <CheckCircleFill color="green" size={22}/>
                                            ) : (
                                                <XCircleFill color="red" size={22}/>
                                            )}</span>
                                        </Card.Title>
                                        <Button
                                            variant={buttonVariant}
                                            className="align-self-start"
                                            onClick={(e) => {
                                                // Предотвращаем всплытие, чтобы не конфликтовало с кликом по карточке
                                                e.stopPropagation();
                                            }}
                                        >
                                            {buttonText}
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default CourseContent;

