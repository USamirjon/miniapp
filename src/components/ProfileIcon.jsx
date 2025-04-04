import React, { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const ProfileIcon = ({ xp, theme }) => {
    const maxXp = 1000;
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const targetProgress = Math.min((xp / maxXp) * 100, 100);

    useEffect(() => {
        let start = animatedProgress;
        const step = () => {
            if (start < targetProgress) {
                start += 1;
                setAnimatedProgress(start);
                requestAnimationFrame(step);
            }
        };
        step();
    }, [xp]);

    return (
        <div
            className="position-relative d-flex align-items-center justify-content-center"
            style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: `conic-gradient(#0d6efd ${animatedProgress}%, #dee2e6 ${animatedProgress}%)`,
                padding: '2px',
                transition: 'background 0.3s ease',
            }}
        >
            <div
                className={`${theme === 'dark' ? 'bg-dark' : 'bg-light'} d-flex align-items-center justify-content-center`}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                }}
            >
                <FaUserCircle size={32} color={theme === 'dark' ? '#ced4da' : '#6c757d'} />
            </div>
        </div>
    );
};

export default ProfileIcon;
