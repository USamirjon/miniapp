// CourseContent.jsx
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CourseContent = ({ blocks = [], theme }) => {
    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    return (
        <div className="mt-4">
            <h3>Содержание курса</h3>
            {blocks.map((block) => (
                <div key={block.id} className="mb-4">
                    <h4>📦 {block.title}</h4>

                    {/* Уроки */}
                    {block.lessons?.length > 0 && (
                        <div className="row">
                            {block.lessons.map((lesson) => (
                                <div className="col-md-6 mb-3" key={lesson.id}>
                                    <Card className={`${cardBg} shadow-sm`}>
                                        <Card.Body>
                                            <Card.Title>{lesson.title}</Card.Title>
                                            <Card.Text>{lesson.description}</Card.Text>
                                            <Link to={`/lesson/${lesson.id}`}>
                                                <Button variant={buttonVariant}>Открыть урок</Button>
                                            </Link>
                                        </Card.Body>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Тесты */}
                    {block.tests?.length > 0 && (
                        <div className="row mt-2">
                            {block.tests.map((test) => (
                                <div className="col-md-6 mb-3" key={test.id}>
                                    <Card className={`${cardBg} shadow-sm`}>
                                        <Card.Body>
                                            <Card.Title>{test.title}</Card.Title>
                                            <Card.Text>{test.description}</Card.Text>
                                            <Link to={`/test/${test.id}`}>
                                                <Button variant={buttonVariant}>Пройти тест</Button>
                                            </Link>
                                        </Card.Body>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CourseContent;
