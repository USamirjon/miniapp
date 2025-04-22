import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Block from './pages/Block';
import Lesson from './pages/Lesson';
import Test from './pages/Test';
import Profile from './pages/Profile';
import Header from './components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import FileUploader from "./pages/FileUploader";
import PurchaseWallet from "./pages/PurchaseWallet";
import axios from 'axios';
import { URL } from './domain.ts';
import Footer from './components/Footer';
import ProfileEdit from './pages/ProfileEdit';

function App() {
    const [xp, setXp] = useState(200);
    const [xpDelta, setXpDelta] = useState(null);
    const [theme, setTheme] = useState('light');
    const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || 'https://i.pravatar.cc/100?u=user1');
    const [wallet, setWallet] = useState(0);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const toggleNotifications = () => setNotificationsEnabled((prev) => !prev);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        applyTheme(savedTheme);

        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
        }

        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.id) {
            fetchWallet(tg.initDataUnsafe.user.id);
        }
    }, []);

    const fetchWallet = async (telegramId) => {
        try {
            const res = await axios.get(`${URL}/api/Transaction`, {
                params: { telegramId }
            });
            setWallet(res.data || 0);
        } catch (err) {
            console.error('Ошибка при загрузке баланса:', err);
            setWallet(0);
        }
    };

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

    const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    return (
        <div className="container" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Header
                xp={xp}
                xpDelta={xpDelta}
                theme={theme}
                toggleTheme={toggleTheme}
                avatar={avatar}
                wallet={wallet}
                notificationsEnabled={notificationsEnabled}
                toggleNotifications={toggleNotifications}
            />

            <Routes>
                <Route path="/" element={<Home theme={theme} />} />
                <Route path="/courses" element={<Courses theme={theme} />} />
                <Route path="/course/:id/block" element={<Block theme={theme} />} />
                <Route path="/course/:courseId/lesson/:id" element={<Lesson onFinish={gainXp} theme={theme} />} />
                <Route path="/test/:id" element={<Test key={theme} theme={theme} onFinish={gainXp} />} />
                <Route path="/profile" element={<Profile theme={theme} avatar={avatar} setAvatar={setAvatar} />} />
                <Route path="/profile/edit" element={<ProfileEdit theme={theme} />} />
                <Route path="/upload" element={<FileUploader />} />
                <Route path="/purchase-wallet" element={<PurchaseWallet fetchWallet={fetchWallet} telegramId={telegramId} theme={theme} />} />
                <Route path="/course/:id/details/*" element={<CourseDetails theme={theme} />} />
            </Routes>

            <Footer theme={theme} />
        </div>
    );
}

export default App;
