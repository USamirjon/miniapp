import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaHome, FaInfoCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = ({ theme }) => {
    const navigate = useNavigate();
    const isDark = theme === 'dark';
    const footerRef = React.useRef(null);
    const fadeRef = React.useRef(null);

    // Track hover state for each button
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Высота градиента-затухания над футером (px) - увеличена в 1.5 раза
    const fadeHeight = 45; // Было 30, увеличено в 1.5 раза

    useEffect(() => {
        if (footerRef.current && fadeRef.current) {
            const footerHeight = footerRef.current.offsetHeight;
            const totalHeight = footerHeight + fadeHeight;

            // Добавляем padding-bottom к body для предотвращения перекрытия контента
            document.body.style.paddingBottom = `${totalHeight}px`;

            // Вычисляем позицию для fade-эффекта - исправляем позиционирование
            fadeRef.current.style.bottom = `${footerHeight}px`;

            // Очистка при размонтировании компонента
            return () => {
                document.body.style.paddingBottom = '0px';
            };
        }
    }, [fadeHeight]);

    // Определяем цвета в зависимости от темы
    const colors = {
        footerBg: isDark ? '#2A2D34' : '#F3F4F6',
        buttonBg: isDark ? '#3B3E46' : '#E9ECEF',
        buttonHoverBg: isDark ? '#484D59' : '#DEE2E6',
        buttonText: isDark ? '#E9ECEF' : '#495057',
        gradientFrom: isDark ? 'rgba(42, 45, 52, 0)' : 'rgba(243, 244, 246, 0)',
        gradientTo: isDark ? 'rgba(42, 45, 52, 1)' : 'rgba(243, 244, 246, 1)',
        border: isDark ? '#3F4149' : '#DFE2E6'
    };

    const getButtonStyle = (isHovered) => ({
        transition: 'all 0.2s ease-in-out',
        padding: '12px 20px',
        borderRadius: '12px',
        width: '100%',
        backgroundColor: isHovered ? colors.buttonHoverBg : colors.buttonBg,
        color: colors.buttonText,
        border: `1px solid ${colors.border}`,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        cursor: 'pointer',
    });

    const buttons = [
        {
            icon: <FaHome size={24} />,
            onClick: () => navigate('/')
        },
        {
            icon: <FaBook size={24} />,
            onClick: () => navigate('/courses')
        },
        {
            icon: <FaInfoCircle size={24} />,
            onClick: () => window.open('https://bars.group', '_blank')
        }
    ];

    return (
        <>
            {/* Градиент-затухание над футером */}
            <div
                ref={fadeRef}
                className="fixed-bottom w-100"
                style={{
                    height: `${fadeHeight}px`,
                    background: `linear-gradient(to bottom, ${colors.gradientFrom}, ${colors.gradientTo})`,
                    zIndex: 1029, // Чуть ниже, чем у футера
                    marginBottom: 0, // Убираем любой margin снизу
                }}
            />

            {/* Футер */}
            <footer
                ref={footerRef}
                className="fixed-bottom py-3"
                style={{
                    backgroundColor: colors.footerBg,
                    zIndex: 1030,
                    boxShadow: isDark ? '0px -2px 8px rgba(0, 0, 0, 0.2)' : '0px -2px 8px rgba(0, 0, 0, 0.1)',
                    position: 'fixed',
                    bottom: 0,
                    width: '100%'
                }}
            >
                <div className="container">
                    <div className="row justify-content-center mx-1">
                        {buttons.map((btn, idx) => (
                            <div className="col-4 d-flex justify-content-center px-1" key={idx}>
                                <div
                                    style={getButtonStyle(hoveredIndex === idx)}
                                    onClick={btn.onClick}
                                    onMouseEnter={() => setHoveredIndex(idx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className="d-flex justify-content-center align-items-center"
                                >
                                    <div className="text-center">{btn.icon}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;