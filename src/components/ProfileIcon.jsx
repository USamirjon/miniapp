import React from 'react';
import { Image } from 'react-bootstrap';

const ProfileIcon = ({ xp = 0, theme = 'light' }) => {
    const maxXp = 500;
    const progress = Math.min(100, Math.round((xp / maxXp) * 100));
    const avatarUrl = localStorage.getItem('avatar') || 'https://i.pravatar.cc/100?u=user';

    const circleSize = 40;
    const strokeWidth = 4;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: circleSize, height: circleSize }}>
            <svg width={circleSize} height={circleSize}>
                <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    stroke={theme === 'dark' ? '#444' : '#eee'}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    stroke="#28a745"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    fill="none"
                    strokeLinecap="round"
                    transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
                />
            </svg>
            <Image
                src={avatarUrl}
                roundedCircle
                style={{
                    position: 'absolute',
                    top: strokeWidth / 2,
                    left: strokeWidth / 2,
                    width: circleSize - strokeWidth,
                    height: circleSize - strokeWidth,
                    objectFit: 'cover'
                }}
            />
        </div>
    );
};

export default ProfileIcon;
