import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import JoinPage from './pages/JoinPage';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage'; 
import UserPage from './pages/UserPage';
import CalibrationPage from './pages/CalibrationPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/main" element={<MainPage />} /> 
        <Route path="/game" element={<GamePage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/calibration" element={<CalibrationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
