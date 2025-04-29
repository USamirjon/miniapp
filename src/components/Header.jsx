import { useNavigate, useLocation } from 'react-router-dom';
import { Dropdown, Image, Button } from 'react-bootstrap';
import { FaCog, FaWallet, FaMoon, FaSun, FaArrowLeft } from 'react-icons/fa';
import './Header.css';

const Header = ({ theme, toggleTheme, avatar, wallet, showWelcome }) => {
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const location = useLocation();

    // Список путей где скрываем кнопку "Назад"
    const hideBackPaths = ['/', '/welcome'];

    // Показывать кнопку только если:
    // 1. Не показан WelcomeScreen
    // 2. Текущий путь не в списке исключений
    const shouldShowBack = !showWelcome && !hideBackPaths.includes(location.pathname);

    const handleGoBack = () => {
        navigate(-1);
    };

    const iconSize = 48;

    return (
        <nav className="navbar fixed-top p-2 bg-transparent shadow-none">
            <div className={`container-fluid ${shouldShowBack ? 'justify-content-between' : 'justify-content-end'} align-items-center`}>
                {shouldShowBack && (
                    <Button
                        variant="link"
                        onClick={handleGoBack}
                        className={`p-0 me-3 ${isDark ? 'text-light' : 'text-dark'}`}
                        aria-label="Назад"
                    >
                        <FaArrowLeft size={24} />
                    </Button>
                )}

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
                            alt="Аватар"
                        />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className={isDark ? 'dropdown-menu-dark' : 'dropdown-menu-light'}>
                        <Dropdown.Item onClick={() => navigate('/purchase-wallet')}>
                            <FaWallet className="me-2" /> Баланс: {wallet}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate('/profile')}>
                            <FaCog className="me-2" /> Профиль
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