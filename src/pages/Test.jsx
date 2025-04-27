import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Alert, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { URL } from '../domain.ts';

const Test = ({ theme }) => {
    const { id: testId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const testDataFromState = location.state?.testData;

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [resultSent, setResultSent] = useState(false);
    const [blockCompleted, setBlockCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [blockId, setBlockId] = useState(null);

    const isDark = theme === 'dark';
    const cardBg = isDark ? 'bg-dark text-light' : 'bg-light text-dark';

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const telegramUser = tg?.initDataUnsafe?.user;
        if (telegramUser?.id) {
            setUserId(telegramUser.id);
        }

        // Получаем blockId из sessionStorage, как это делается в компоненте Lesson
        const storedBlockId = sessionStorage.getItem('currentBlockId');
        if (storedBlockId) {
            setBlockId(storedBlockId);
        }
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);

                // If we have the test data from state, use it directly
                if (testDataFromState && testDataFromState.questions) {
                    console.log("Using test data from state:", testDataFromState);
                    setQuestions(testDataFromState.questions);

                    // Если у нас есть testDataFromState, то извлекаем blockId из него, если он доступен
                    if (testDataFromState.blockId) {
                        setBlockId(testDataFromState.blockId);
                    }

                    setLoading(false);
                    return;
                }

                // Otherwise fetch from API
                const { data } = await axios.get(`${URL}/api/Courses/test-block-id`, {
                    params: { testId },
                });

                if (data && data.questions) {
                    setQuestions(data.questions);

                    // Если в данных теста есть blockId, сохраняем его
                    if (data.blockId) {
                        setBlockId(data.blockId);
                    }
                } else {
                    console.error('Неожиданный формат данных:', data);
                }
            } catch (error) {
                console.error('Ошибка при загрузке теста:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [testId, testDataFromState]);

    // Функция для завершения блока
    const completeBlock = useCallback(async () => {
        if (!userId || !blockId || blockCompleted) return;

        try {
            console.log("Отправка запроса на завершение блока:", {
                blockId,
                telegramId: userId
            });

            const response = await axios.patch(`${URL}/api/Courses/block-finish`, null, {
                params: { blockId, telegramId: userId }
            });

            if (response.data?.isSuccess) {
                console.log("Блок успешно завершен");
                setBlockCompleted(true);
            }
        } catch (error) {
            console.error('Ошибка при завершении блока:', error);
        }
    }, [userId, blockId, blockCompleted]);

    const sendResult = useCallback(async (result, percentageCorrect) => {
        try {
            if (!userId || resultSent) return;

            console.log("Sending test result:", {
                telegramId: userId,
                testId,
                result,
                percentageIsTrue: percentageCorrect
            });

            // Using the correct endpoint and parameter names based on your API
            await axios.post(`${URL}/api/Courses/test-result`, {
                telegramId: userId,
                testId,
                result,
                percentageIsTrue: percentageCorrect
            });

            setResultSent(true);

            // Если тест пройден успешно, отправляем запрос на завершение блока
            if (result) {
                await completeBlock();
            }
        } catch (error) {
            console.error('Ошибка при отправке результата теста:', error);
        }
    }, [resultSent, testId, userId, completeBlock]);

    useEffect(() => {
        if (!finished || !questions.length) return;

        const percentageCorrect = Math.round((correctCount / questions.length) * 100);
        const passed = correctCount > questions.length / 2;

        sendResult(passed, percentageCorrect);
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

    if (loading) return <p className="text-center mt-4">Загрузка вопросов...</p>;

    if (!questions.length) return <p className="text-center mt-4">Нет доступных вопросов для этого теста.</p>;

    if (finished) {
        const passed = correctCount > questions.length / 2;
        const percentageCorrect = Math.round((correctCount / questions.length) * 100);

        return (
            <div className="container mt-4 text-center">
                <h2>{passed ? '🎉 Поздравляем!' : '🫶 Не расстраивайся!'}</h2>
                <p>Ты ответил правильно на {correctCount} из {questions.length} вопросов ({percentageCorrect}%).</p>

                {passed ? (
                    <Button variant="success" className="m-2" onClick={() => navigate(-1)}>
                        Вернуться к блоку
                    </Button>
                ) : (
                    <>
                        <Button variant="warning" className="m-2" onClick={handleRestart}>
                            Повторить тест
                        </Button>
                        <Button variant="secondary" className="m-2" onClick={() => navigate(-1)}>
                            Вернуться к блоку
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
                    <Card.Title>{currentQuestion?.title}</Card.Title>

                    <ProgressBar
                        now={(currentIndex / questions.length) * 100}
                        className="mb-3"
                    />

                    {currentQuestion?.answers?.map((ans) => (
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