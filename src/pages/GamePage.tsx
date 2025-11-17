import { useNavigate, useLocation } from 'react-router-dom';
import { GameScreen } from '../components/GameScreen';
import { Difficulty } from '../types/game.types';

function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const difficulty = (location.state?.difficulty as Difficulty) || 'normal';

  const exitGame = () => {
    navigate('/');
  };

  return <GameScreen difficulty={difficulty} onExit={exitGame} />;
}

export default GamePage;