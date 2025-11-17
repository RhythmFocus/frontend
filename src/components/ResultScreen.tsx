import { GameState } from '../types/game.types';

interface ResultScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onHome: () => void;
}

export function ResultScreen({ gameState, onRestart, onHome }: ResultScreenProps) {
  const totalNotes =
    gameState.judgmentCounts.perfect +
    gameState.judgmentCounts.good +
    gameState.judgmentCounts.bad +
    gameState.judgmentCounts.miss;

  const earnedTickets = Math.floor(gameState.accuracy / 10);

  const getRank = () => {
    if (gameState.accuracy >= 95) return { rank: 'S', color: '#ffd700' };
    if (gameState.accuracy >= 90) return { rank: 'A', color: '#2ed573' };
    if (gameState.accuracy >= 80) return { rank: 'B', color: '#ffa502' };
    if (gameState.accuracy >= 70) return { rank: 'C', color: '#ff6348' };
    return { rank: 'D', color: '#ff4757' };
  };

  const { rank, color } = getRank();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          padding: '50px',
          borderRadius: '25px',
          color: 'white',
          maxWidth: '600px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ 
          fontSize: '80px', 
          fontWeight: 'bold',
          color: color,
          textShadow: `0 0 30px ${color}`,
          marginBottom: '20px'
        }}>
          {rank}
        </div>

        <h1 style={{ fontSize: '42px', marginBottom: '30px' }}>
          게임 종료!
        </h1>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '15px' }}>
            Score: <strong style={{ color: '#ffd700' }}>
              {gameState.score.toLocaleString()}
            </strong>
          </div>
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>
            Accuracy: <strong style={{ color: color }}>
              {gameState.accuracy.toFixed(1)}%
            </strong>
          </div>
          <div style={{ fontSize: '20px' }}>
            Max Combo: <strong style={{ color: '#00d4ff' }}>
              {gameState.maxCombo}x
            </strong>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '25px',
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '15px', opacity: 0.9 }}>
            판정 통계
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            fontSize: '16px'
          }}>
            <div style={{ 
              background: 'rgba(255, 215, 0, 0.2)',
              padding: '10px',
              borderRadius: '8px'
            }}>
              <div style={{ color: '#ffd700' }}>Perfect</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {gameState.judgmentCounts.perfect}
              </div>
            </div>
            <div style={{ 
              background: 'rgba(46, 213, 115, 0.2)',
              padding: '10px',
              borderRadius: '8px'
            }}>
              <div style={{ color: '#2ed573' }}>Good</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {gameState.judgmentCounts.good}
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255, 165, 2, 0.2)',
              padding: '10px',
              borderRadius: '8px'
            }}>
              <div style={{ color: '#ffa502' }}>Bad</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {gameState.judgmentCounts.bad}
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255, 71, 87, 0.2)',
              padding: '10px',
              borderRadius: '8px'
            }}>
              <div style={{ color: '#ff4757' }}>Miss</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {gameState.judgmentCounts.miss}
              </div>
            </div>
          </div>
          <div style={{ 
            marginTop: '15px', 
            fontSize: '14px', 
            opacity: 0.7
          }}>
            Total Notes: {totalNotes}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255, 215, 0, 0.2)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '35px',
            fontSize: '22px',
            border: '2px solid rgba(255, 215, 0, 0.3)'
          }}
        >
          🎫 획득 티켓: <strong style={{ color: '#ffd700' }}>
            {earnedTickets}개
          </strong>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center' 
        }}>
          <button
            onClick={onRestart}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #2ed573 0%, #26d07c 100%)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(46, 213, 115, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(46, 213, 115, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(46, 213, 115, 0.4)';
            }}
          >
            다시 하기
          </button>
          <button
            onClick={onHome}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(0, 212, 255, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 212, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 212, 255, 0.4)';
            }}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}