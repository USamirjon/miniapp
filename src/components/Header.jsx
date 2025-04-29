import { useNavigate } from 'react-router-dom';
import { Dropdown, Image } from 'react-bootstrap';
import { FaCog, FaWallet, FaMoon, FaSun } from 'react-icons/fa';
import './Header.css';

const Header = ({ theme, toggleTheme, avatar, wallet }) => {
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    // Размер аватара
    const iconSize = 48;


    return (
        <nav className="navbar fixed-top p-2 bg-transparent shadow-none">
            <div className="container-fluid justify-content-end">
                <Dropdown>
                    <Dropdown.Toggle
                        as="div"
                        id="profile-dropdown"
                        className="avatar-toggle p-0"
                    >
                        <Image
                            src={avatar}
                            roundedCircle
                            style={{
                                width: iconSize,
                                height: iconSize,
                                objectFit: 'cover',
                                cursor: 'pointer'
                            }}
                        />
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                        className={isDark ? 'dropdown-menu-dark' : 'dropdown-menu-light'}
                    >
                        <Dropdown.Item onClick={() => navigate('/purchase-wallet')}>
                            Баланс: {wallet}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate('/profile')}>
                             Профиль
                        </Dropdown.Item>
                        <Dropdown.Item onClick={toggleTheme}>
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


