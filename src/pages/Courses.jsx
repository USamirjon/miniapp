import React from 'react';
import { Card, Button } from 'react-bootstrap';

const CoursePage = ({ theme }) => {
    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';
    const buttonVariant = isDark ? 'light' : 'primary';

    // Заглушка курса:
    const course = {
        id: 1,
        title: 'Frontend на React',
        description: 'Научись создавать современные интерфейсы на React: от основ до продвинутых фреймворков.',
        whyTake: 'React — один из самых востребованных фреймворков в 2024 году. После прохождения курса ты сможешь собрать полноценное приложение и подготовиться к собеседованию.',
        isFree: true // если false — будет кнопка "Купить"
    };

    const handleStartCourse = () => {
        // переход к урокам
        window.location.href = `/course/${course.id}/coursePage`;
    };

    const handlePurchaseCourse = () => {
        // здесь потом добавишь интеграцию с покупкой
        alert('Оформление покупки пока недоступно');
    };

    return (
        <div className={`container mt-4 ${isDark ? 'text-light' : 'text-dark'}`}>
            <h2 className="mb-4">📘 {course.title}</h2>

            <Card className={`${cardBg} shadow-sm`}>
                <Card.Body>
                    <Card.Title>О курсе</Card.Title>
                    <Card.Text>{course.description}</Card.Text>

                    <Card.Title className="mt-4">Почему стоит пройти?</Card.Title>
                    <Card.Text>{course.whyTake}</Card.Text>

                    <div className="mt-4 d-grid">
                        {course.isFree ? (
                            <Button variant={buttonVariant} size="lg" onClick={handleStartCourse}>
                                Начать курс бесплатно
                            </Button>
                        ) : (
                            <Button variant="success" size="lg" onClick={handlePurchaseCourse}>
                                Купить курс
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CoursePage;
