import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { FaCog, FaWallet, FaBell, FaMoon, FaSun } from 'react-icons/fa';
import ProfileIcon from './ProfileIcon';
import './Header.css';

const Header = ({ xp, theme, toggleTheme, avatar, wallet, toggleNotifications, notificationsEnabled }) => {
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    return (
        <nav className={`navbar fixed-top p-2 ${isDark ? 'navbar-dark' : 'navbar-light'}`}>
            <div className="container-fluid justify-content-end">
                <Dropdown align="end">
                    <Dropdown.Toggle
                        as="div"
                        id="profile-dropdown"
                        className={`profile-button ${isDark ? 'profile-dark' : 'profile-light'}`}
                    >
                        <ProfileIcon xp={xp} theme={theme} avatarUrl={avatar} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                        className={`shadow dropdown-menu-custom ${isDark ? 'dropdown-dark' : 'dropdown-light'}`}
                    >
                        <Dropdown.Item className="dropdown-item-custom" onClick={() => navigate('/purchase-wallet')}>
                            <FaWallet className="me-2" /> Баланс: {wallet}
                        </Dropdown.Item>
                        <Dropdown.Item className="dropdown-item-custom" onClick={() => navigate('/profile')}>
                            <FaCog className="me-2" /> Профиль
                        </Dropdown.Item>
                        <Dropdown.Item className="dropdown-item-custom" onClick={toggleNotifications}>
                            <FaBell className="me-2" />
                            Уведомления {notificationsEnabled ? 'вкл' : 'выкл'}
                        </Dropdown.Item>
                        <Dropdown.Item className="dropdown-item-custom" onClick={toggleTheme}>
                            {isDark ? <FaSun className="me-2" /> : <FaMoon className="me-2" />}
                            {isDark ? 'Светлая тема' : 'Тёмная тема'}
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </nav>
    );
};

export default Header;