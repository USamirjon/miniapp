import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { URL } from '../domain.ts';

const Test = ({ theme }) => {
    const { id: testId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [resultSent, setResultSent] = useState(false);

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data } = await axios.get(`${URL}/api/Course/questions`, {
                    params: { testId },
                });
                setQuestions(data);
            } catch (error) {
                console.error('Ошибка при загрузке теста:', error);
            }
        };

        fetchQuestions();
    }, [testId]);

    const sendResult = useCallback(async (result) => {
        try {
            const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            if (!telegramId || resultSent) return;

            await axios.post(`${URL}/api/Course/testResult`, {
                telegramId,
                testId,
                result,
            });

            setResultSent(true);
        } catch (error) {
            console.error('Ошибка при отправке результата теста:', error);
        }
    }, [resultSent, testId]);

    useEffect(() => {
        if (!finished) return;

        const passed = correctCount > questions.length / 2;
        sendResult(passed);
    }, [finished, correctCount, questions.length, sendResult]);

    const currentQuestion = questions[currentIndex];

    const handleAnswer = (answer) => {
        setSelectedAnswer(answer);
        setShowExplanation(true);

        if (answer.isCorrect) {
            setCorrectCount((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setShowExplanation(false);

        if (currentIndex + 1 >= questions.length) {
            setFinished(true);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setCorrectCount(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setFinished(false);
        setResultSent(false);
    };

    if (!questions.length) return <p className="text-center mt-4">Загрузка вопросов...</p>;

    if (finished) {
        const passed = correctCount > questions.length / 2;

        return (
            <div className="container mt-4 text-center">
                <h2>{passed ? '🎉 Поздравляем!' : '🫶 Не расстраивайся!'}</h2>
                <p>Ты ответил правильно на {correctCount} из {questions.length} вопросов.</p>

                {passed ? (
                    <Button variant="success" className="m-2" onClick={() => navigate(-1)}>
                        Вернуться к курсу
                    </Button>
                ) : (
                    <>
                        <Button variant="warning" className="m-2" onClick={handleRestart}>
                            Повторить тест
                        </Button>
                        <Button variant="secondary" className="m-2" onClick={() => navigate(-1)}>
                            Вернуться к курсу
                        </Button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <Card className={`${cardBg} shadow-sm`}>
                <Card.Body>
                    <Card.Title>{currentQuestion.title}</Card.Title>

                    <ProgressBar
                        now={(currentIndex / questions.length) * 100}
                        className="mb-3"
                    />

                    {currentQuestion.answers.map((ans) => (
                        <Button
                            key={ans.id}
                            variant={
                                !showExplanation
                                    ? 'outline-primary'
                                    : ans.id === selectedAnswer?.id
                                        ? ans.isCorrect
                                            ? 'success'
                                            : 'danger'
                                        : 'outline-secondary'
                            }
                            onClick={() => !showExplanation && handleAnswer(ans)}
                            className="d-block w-100 mb-2"
                            disabled={showExplanation}
                        >
                            {ans.title}
                        </Button>
                    ))}

                    {showExplanation && (
                        <>
                            <Alert
                                variant={selectedAnswer?.isCorrect ? 'success' : 'danger'}
                                className="mt-3"
                            >
                                <strong>
                                    {selectedAnswer?.isCorrect ? '✅ Верно!' : '❌ Неверно.'}
                                </strong>{' '}
                                {selectedAnswer?.explanation}
                            </Alert>

                            <Button
                                variant={isDark ? 'light' : 'primary'}
                                onClick={handleNext}
                                className="mt-3"
                            >
                                {currentIndex + 1 === questions.length
                                    ? 'Завершить'
                                    : 'Следующий вопрос'}
                            </Button>
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Test;
