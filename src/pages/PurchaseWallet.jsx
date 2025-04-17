import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

const PurchaseWallet = () => {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [balance, setBalance] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    useEffect(() => {
        if (tgUser?.id) {
            fetchBalance(tgUser.id);
        } else {
            setError('Пользователь Telegram не найден');
        }
    }, []);

    const fetchBalance = async (telegramId) => {
        try {
            const res = await axios.get(`${URL}/api/Transaction`, {
                params: { telegramId }
            });
            setBalance(res.data);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить текущий баланс');
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const handlePurchase = async () => {
        const numericAmount = parseInt(amount, 10);

        if (!numericAmount || numericAmount <= 0) {
            setError('Введите положительное число');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await axios.post(`${URL}/api/Transaction`, {
                telegramId: tgUser.id,
                type: true,
                total: numericAmount
            });

            const newBalance = balance + numericAmount;
            setBalance(newBalance);
            setMessage(`Баланс успешно пополнен на ${numericAmount} монет`);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Ошибка при пополнении баланса');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToProfile = () => {
        navigate('/profile');
    };

    return (
        <div className="container mt-5">
            <Card className="p-4 shadow-sm">
                <h4>Пополнить баланс</h4>

                {balance !== null && (
                    <p><strong>Текущий баланс:</strong> {balance} монет</p>
                )}

                <Form.Group controlId="formAmount">
                    <Form.Label>Сумма пополнения:</Form.Label>
                    <Form.Control
                        type="text"
                        value={amount}
                        onChange={handleChange}
                        placeholder="Например, 1000"
                        inputMode="numeric"
                        disabled={success}
                    />
                </Form.Group>

                {!success ? (
                    <Button
                        variant="success"
                        className="mt-3"
                        onClick={handlePurchase}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                /> Загрузка...
                            </>
                        ) : (
                            'Пополнить'
                        )}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        className="mt-3"
                        onClick={handleBackToProfile}
                    >
                        Вернуться в профиль
                    </Button>
                )}

                {message && <Alert variant="success" className="mt-3">{message}</Alert>}
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Card>
        </div>
    );
};

export default PurchaseWallet;
