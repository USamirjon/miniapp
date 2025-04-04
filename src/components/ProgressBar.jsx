import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar as BootstrapBar } from 'react-bootstrap';


const getLevelData = (xp) => {
    // Простая формула уровней
    let level = 1;
    let nextXp = 100;
    while (xp >= nextXp) {
        level++;
        xp -= nextXp;
        nextXp += 100; // увеличиваем требуемый опыт
    }

    const progress = Math.floor((xp / nextXp) * 100);

    return { level, progress, xpCurrent: xp, xpNext: nextXp };
};

const ProgressBar = ({ xp }) => {
    const { level, progress, xpCurrent, xpNext } = getLevelData(xp);

    return (
        <div className="mb-4">
            <h5>Уровень {level}</h5>
            <BootstrapBar now={progress} label={`${progress}%`} />
            <small>{xpCurrent} / {xpNext} XP</small>
        </div>
    );
};

export default ProgressBar;
