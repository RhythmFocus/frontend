import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import JoinPage from './pages/JoinPage';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import UserPage from './pages/UserPage';
import CalibrationPage from './pages/CalibrationPage';
import InputSelectPage from './pages/InputSelectPage';
import GuidePage from './pages/GuidePage.tsx';
import DiagnosisPage from './pages/DiagnosisPage';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/join" element={<JoinPage/>}/>
                <Route path="/main" element={<MainPage/>}/>
                <Route path="/game" element={<GamePage/>}/>
                <Route path="/user" element={<UserPage/>}/>
                <Route path="/calibration" element={<InputSelectPage/>}/>
                <Route path="/calibration/process" element={<CalibrationPage/>}/>
                <Route path="/guide" element={<GuidePage/>}/>
                <Route path="/diagnosis" element={<DiagnosisPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
