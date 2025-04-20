import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaHome, FaInfoCircle } from 'react-icons/fa';

const Footer = ({ theme }) => {
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const navClass = `d-flex justify-content-around p-2 ${isDark ? 'bg-dark text-light' : 'bg-light text-dark'} border-top`;

    return (
        <footer className={navClass} style={{ position: 'fixed', bottom: 0, width: '100%' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                <FaHome size={20} />
            </span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/courses')}>
                <FaBook size={20} />
            </span>
            <span style={{ cursor: 'pointer' }} onClick={() => window.open('https://bars.group', '_blank')}>
                <FaInfoCircle size={20} />
            </span>
        </footer>
    );
};

export default Footer;
