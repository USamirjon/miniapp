import React, {useEffect, useState} from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import Lesson from './pages/Lesson';
import Test from './pages/Test';
import Profile from './pages/Profile';
import Header from './components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
    const [xp, setXp] = useState(200);
    const [xpDelta, setXpDelta] = useState(null);

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
        }

        // применим тему
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = '';
        document.body.classList.add(`bg-${savedTheme}`);
        document.body.classList.add(`text-${savedTheme === 'dark' ? 'light' : 'dark'}`);
    }, []);
    const gainXp = (amount) => {
        setXp((prev) => prev + amount);
        setXpDelta(`+${amount} XP`);

        setTimeout(() => setXpDelta(null), 2000); // Убираем через 2 сек
    };

    return (
        <div className="container p-3 rounded" style={{backgroundColor: 'rgba(255, 255, 255, 0.05)'}}>
            {/*<Header/>-->*/}
            <Header xp={xp} xpDelta={xpDelta} />
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/lessons" element={<Lessons/>}/>
                {/*<Route path="/lesson/:id" element={<Lesson/>}/>*/}
                <Route path="/lesson/:id" element={<Lesson onFinish={gainXp} />} />
                <Route path="/test/:id" element={<Test/>}/>
                <Route path="/profile" element={<Profile/>}/>
            </Routes>
        </div>
    );
}

export default App;
