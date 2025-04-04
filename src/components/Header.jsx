import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import ProfileIcon from './ProfileIcon';

const Header = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [xp, setXp] = useState(200); // Пока можно зафиксировать XP, потом связать с бэкендом

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setDarkMode(savedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = !darkMode ? 'dark' : 'light';
        setDarkMode(!darkMode);
        localStorage.setItem('theme', newTheme);

        document.body.className = ''; // очищаем классы
        document.body.classList.add(`bg-${newTheme}`);
        document.body.classList.add(`text-${newTheme === 'dark' ? 'light' : 'dark'}`);
    };

    return (
        <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} mb-4 rounded`}>
            <div className="container-fluid justify-content-between">
                <div>
                    <Link className="navbar-brand" to="/">🧠 Обучение</Link>
                    <Link className="nav-link d-inline" to="/lessons">📚 Уроки</Link>
                </div>
                <div className="d-flex align-items-center">
                    <button className="btn btn-outline-secondary me-2" onClick={toggleTheme}>
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>
                    <Link to="/profile">
                        <ProfileIcon xp={xp} theme={darkMode ? 'dark' : 'light'} />
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Header;
