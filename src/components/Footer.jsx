import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaHome, FaInfoCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = ({ theme }) => {
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    // Track hover state for each button
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const getButtonStyle = (isHovered) => ({
        transition: 'all 0.2s ease-in-out',
        padding: '12px 20px',
        borderRadius: '12px',
        width: '100%',
        backgroundColor: isDark ? (isHovered ? '#495057' : '#343a40') : (isHovered ? '#e2e6ea' : '#f0f0f0'),
        color: isDark ? '#f8f9fa' : '#343a40',
        border: `1px solid ${isDark ? '#555' : '#ccc'}`,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        cursor: isHovered ? 'pointer' : 'default',
    });

    const buttons = [
        {
            icon: <FaHome size={28} />,
            onClick: () => navigate('/')
        },
        {
            icon: <FaBook size={28} />,
            onClick: () => navigate('/courses')
        },
        {
            icon: <FaInfoCircle size={28} />,
            onClick: () => window.open('https://bars.group', '_blank')
        }
    ];

    return (
        <footer
            className="fixed-bottom py-3"
            style={{ backgroundColor: 'transparent', borderTop: 'none' }}
        >
            <div className="container">
                <div className="row justify-content-center"
                     style={{
                         backgroundColor: isDark ? 'rgba(33, 37, 41, 0.85)' : 'rgba(240, 240, 240, 0.85)',
                         borderRadius: '16px',
                         padding: '10px 5px',
                     }}>
                    {buttons.map((btn, idx) => (
                        <div className="col-4 d-flex justify-content-center px-0" key={idx}>
                            <div
                                style={getButtonStyle(hoveredIndex === idx)}
                                onClick={btn.onClick}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="text-center">{btn.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;