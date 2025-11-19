import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import JoinPage from './pages/JoinPage';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage'; 
import UserPage from './pages/UserPage';
import StroopPage from './pages/StroopPage';
import NBackPage from './pages/NBackPage';
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
        <Route path="/stroop" element={<StroopPage />} />
        <Route path="/nback" element={<NBackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
