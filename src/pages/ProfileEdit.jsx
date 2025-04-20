import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = ({ onSave }) => {
    const navigate = useNavigate();

    const handleSave = () => {
        // Здесь должен быть код сохранения
        alert('Изменения успешно сохранены!');
        if (onSave) onSave();
        navigate('/profile');
    };

    return (
        <div className="container mt-4">
            <h3>Редактирование профиля</h3>
            {/* Вставить форму редактирования (имя, фамилия, email и т.д.) */}
            <Button onClick={handleSave} variant="success" className="me-2">
                Сохранить
            </Button>
            <Button onClick={() => navigate('/profile')} variant="secondary">
                Вернуться
            </Button>
        </div>
    );
};

export default ProfileEdit;
