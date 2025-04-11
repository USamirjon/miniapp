import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LessonsPage from './pages/LessonsPage';
import Lesson from './pages/Lesson';
import Test from './pages/Test';
import Profile from './pages/Profile';
import Header from './components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";


function App() {
    const [xp, setXp] = useState(200);
    const [xpDelta, setXpDelta] = useState(null);
    const [theme, setTheme] = useState('light');
    const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || 'https://i.pravatar.cc/100?u=user1');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        applyTheme(savedTheme);

        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
        }
    }, []);

    const updateAvatar = (newAvatar) => {
        setAvatar(newAvatar);
        localStorage.setItem('avatar', newAvatar);
    };
    const applyTheme = (theme) => {
        document.body.className = '';
        document.body.classList.add(`bg-${theme}`);
        document.body.classList.add(`text-${theme === 'dark' ? 'light' : 'dark'}`);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    const gainXp = (amount) => {
        setXp((prev) => prev + amount);
        setXpDelta(`+${amount} XP`);
        setTimeout(() => setXpDelta(null), 2000);
    };

    return (
        <div className="container p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Header xp={xp} xpDelta={xpDelta} theme={theme} toggleTheme={toggleTheme} avatar={avatar}/>
            <Routes>
                <Route path="/" element={<Home theme={theme} />} />
                <Route path="/courses" element={<Courses theme={theme}/>} />
                <Route path="/course/:id/details" element={<CourseDetails theme={theme} />} />
                <Route path="/course/:id/lessons" element={<LessonsPage theme={theme} />} />
                <Route path="/lesson/:id" element={<Lesson onFinish={gainXp} theme={theme} />} />
                <Route path="/test/:id" element={<Test theme={theme} />} />
                <Route path="/profile" element={<Profile theme={theme} avatar={avatar} setAvatar={setAvatar} />} />
            </Routes>
        </div>
    );
}

export default App;
