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
import GachaPage from './pages/GachaPage.tsx'
import StroopPage from './pages/StroopPage';
import NBackPage from './pages/NBackPage';
import SnapIv from './pages/SnapIv';
import Asrs from './pages/Asrs';
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
                <Route path="/gacha" element={<GachaPage/>}></Route>
                <Route path="/stroop" element={<StroopPage />} />
                <Route path="/nback" element={<NBackPage />} />
                <Route path="/snapiv" element={<SnapIv />} />
                <Route path="/asrs" element={<Asrs />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
