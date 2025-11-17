import { GameState } from '../types/game.types';

interface ScoreDisplayProps {
  gameState: GameState;
  currentBPM: number;
}

export function ScoreDisplay({ gameState, currentBPM }: ScoreDisplayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '25px',
        borderRadius: '15px',
        color: 'white',
        minWidth: '240px',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* 점수 */}
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '15px',
        color: '#ffd700',
        textShadow: '0 2px 10px rgba(255, 215, 0, 0.5)'
      }}>
        {gameState.score.toLocaleString()}
      </div>
      
      {/* 콤보 */}
      <div style={{ 
        fontSize: '22px', 
        marginBottom: '10px',
        color: '#00d4ff'
      }}>
        Combo: <span style={{ fontWeight: 'bold' }}>{gameState.combo}x</span>
      </div>
      
      {/* 최대 콤보 */}
      <div style={{ 
        fontSize: '14px', 
        marginBottom: '15px',
        color: '#aaa'
      }}>
        Max: {gameState.maxCombo}x
      </div>
      
      {/* 정확도 */}
      <div style={{ 
        fontSize: '18px', 
        marginBottom: '10px',
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px'
      }}>
        Accuracy: <span style={{ 
          fontWeight: 'bold',
          color: gameState.accuracy >= 95 ? '#2ed573' : 
                gameState.accuracy >= 85 ? '#ffa502' : '#ff4757'
        }}>
          {gameState.accuracy.toFixed(1)}%
        </span>
      </div>

      {/* 평균 정확도 (ms) */}
      <div style={{ 
        fontSize: '18px', 
        marginBottom: '15px',
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>
          평균 정확도
        </div>
        <span style={{ 
          fontWeight: 'bold',
          fontSize: '24px',
          color: Math.abs(gameState.averageOffset) <= 20 ? '#2ed573' : '#ffa502'
        }}>
          {gameState.averageOffset > 0 ? '+' : ''}
          {gameState.averageOffset.toFixed(1)}ms
        </span>
      </div>

      {/* 현재 BPM */}
      <div style={{
        fontSize: '16px',
        marginBottom: '15px',
        padding: '8px',
        background: 'rgba(100, 200, 255, 0.1)',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        🎵 {currentBPM} BPM
      </div>
      
      {/* 판정 통계 */}
      <div style={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '15px',
        fontSize: '14px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <span style={{ color: '#ffd700' }}>Perfect:</span>
          <span style={{ fontWeight: 'bold' }}>
            {gameState.judgmentCounts.perfect}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <span style={{ color: '#2ed573' }}>Good:</span>
          <span style={{ fontWeight: 'bold' }}>
            {gameState.judgmentCounts.good}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <span style={{ color: '#ffa502' }}>Bad:</span>
          <span style={{ fontWeight: 'bold' }}>
            {gameState.judgmentCounts.bad}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <span style={{ color: '#ff4757' }}>Miss:</span>
          <span style={{ fontWeight: 'bold' }}>
            {gameState.judgmentCounts.miss}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#aaa',
          fontSize: '12px'
        }}>
          <span>Total:</span>
          <span>{gameState.totalNotes}</span>
        </div>
      </div>
    </div>
  );
}