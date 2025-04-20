import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import ProfileIcon from './ProfileIcon';

const Header = ({ xp, xpDelta, theme, toggleTheme, avatar, wallet }) => {
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    return (
        <nav className={`navbar navbar-expand-lg ${isDark ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} mb-4 rounded`}>
            <div className="container-fluid justify-content-between">
                <div>
                    <Link className="navbar-brand" to="/">🧠 Обучение</Link>
                    <Link className="nav-link d-inline" to="/courses">📚 Курсы</Link>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-warning" onClick={() => navigate('/purchase-wallet')}>
                        💰 {wallet}
                    </button>
                    <button className="btn btn-outline-secondary" onClick={toggleTheme}>
                        {isDark ? <FaSun /> : <FaMoon />}
                    </button>
                    <Link to="/profile">
                        <ProfileIcon xp={xp} theme={theme} avatarUrl={avatar} />
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Header;
