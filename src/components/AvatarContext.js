import React, { createContext, useState, useContext } from 'react';

// Создаем контекст
const AvatarContext = createContext();

// Провайдер для аватара
export const AvatarProvider = ({ children }) => {
    const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || 'https://i.pravatar.cc/100?u=user1');

    const updateAvatar = (newAvatar) => {
        setAvatar(newAvatar);
        localStorage.setItem('avatar', newAvatar); // Сохраняем новый аватар в localStorage
    };

    return (
        <AvatarContext.Provider value={{ avatar, updateAvatar }}>
            {children}
        </AvatarContext.Provider>
    );
};

// Хук для использования аватара в компонентах
export const useAvatar = () => {
    return useContext(AvatarContext);
};
