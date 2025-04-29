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
import CourseContent from "./pages/CourseContent";
import WelcomeScreen from './pages/WelcomeScreen'; // ⬅️ Импорт приветственного экрана

function App() {
    const [theme, setTheme] = useState('light');
    const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || 'https://i.pravatar.cc/100?u=user1');
    const [wallet, setWallet] = useState(0);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        applyTheme(savedTheme);

        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setShowWelcome(true);
        }

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

    const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    return (
        <div className="container">
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                avatar={avatar}
                wallet={wallet}
                showWelcome={showWelcome}
            />

            <Routes>
                {showWelcome ? (
                    <Route path="*" element={<WelcomeScreen />} />
                ) : (
                    <>
                        <Route path="/" element={<Home theme={theme} />} />
                        <Route path="/courses" element={<Courses theme={theme} />} />
                        <Route path="/course/:id/coursecontent" element={<CourseContent theme={theme} />} />
                        <Route path="/block/:id" element={<Block theme={theme} />} />
                        <Route path="/lesson/:id" element={<Lesson theme={theme} />} />
                        <Route path="/test/:id" element={<Test key={theme} theme={theme} />} />
                        <Route path="/profile" element={<Profile theme={theme} avatar={avatar} setAvatar={setAvatar} />} />
                        <Route path="/profile/edit" element={<ProfileEdit theme={theme} />} />
                        <Route path="/upload" element={<FileUploader />} />
                        <Route path="/purchase-wallet" element={<PurchaseWallet fetchWallet={fetchWallet} telegramId={telegramId} theme={theme} />} />
                        <Route path="/course/:id/details/*" element={<CourseDetails theme={theme} />} />
                    </>
                )}
            </Routes>

            <Footer theme={theme} />
        </div>
    );
}

export default App;
