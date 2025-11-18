import { GameState } from '../types/game.types';

interface ScoreDisplayProps {
  gameState: GameState;
  currentBPM: number;
  bpmChange?: 'up' | 'down' | null;
}

export function ScoreDisplay({ gameState, currentBPM, bpmChange }: ScoreDisplayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '15px',
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* BPM 표시 */}
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>🎵 BPM: {currentBPM}</span>
        {/* BPM 변화 표시 */}
        {bpmChange === 'up' && (
          <span
            style={{
              fontSize: '14px',
              color: '#ff4444',
              animation: 'fadeOut 2s ease-out',
            }}
          >
            ⬆️ +10
          </span>
        )}
        {bpmChange === 'down' && (
          <span
            style={{
              fontSize: '14px',
              color: '#4444ff',
              animation: 'fadeOut 2s ease-out',
            }}
          >
            ⬇️ -10
          </span>
        )}
      </div>

      {/* 점수 */}
      <div
        style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '8px',
        }}
      >
        점수: <span style={{ fontWeight: 'bold', color: '#333' }}>{gameState.score}</span>
      </div>

      {/* 콤보 */}
      <div
        style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '8px',
        }}
      >
        콤보: <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>{gameState.combo}x</span>
        {gameState.maxCombo > 0 && (
          <span style={{ fontSize: '12px', color: '#999', marginLeft: '5px' }}>
            (최고: {gameState.maxCombo})
          </span>
        )}
      </div>

      {/* 정확도 */}
      <div
        style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '8px',
        }}
      >
        정확도:{' '}
        <span
          style={{
            fontWeight: 'bold',
            color: gameState.accuracy >= 90 ? '#4caf50' : gameState.accuracy >= 70 ? '#ff9800' : '#f44336',
          }}
        >
          {gameState.accuracy.toFixed(1)}%
        </span>
      </div>

      {/* 판정 */}
      <div
        style={{
          borderTop: '1px solid #eee',
          paddingTop: '10px',
          marginTop: '10px',
          fontSize: '12px',
          color: '#666',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>PERFECT:</span>
          <span style={{ fontWeight: 'bold', color: '#4caf50' }}>{gameState.judgmentCounts.perfect}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>GOOD:</span>
          <span style={{ fontWeight: 'bold', color: '#2196f3' }}>{gameState.judgmentCounts.good}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>BAD:</span>
          <span style={{ fontWeight: 'bold', color: '#ff9800' }}>{gameState.judgmentCounts.bad}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>MISS:</span>
          <span style={{ fontWeight: 'bold', color: '#f44336' }}>{gameState.judgmentCounts.miss}</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}