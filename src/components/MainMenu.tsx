import { Difficulty } from '../types/game.types';

interface MainMenuProps {
  onStartGame: (difficulty: Difficulty) => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '50px',
          borderRadius: '25px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '650px',
          width: '90%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1
            style={{
              fontSize: '56px',
              color: '#667eea',
              marginBottom: '15px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            🎵 Rhythm Focus
          </h1>
          <p style={{ fontSize: '20px', color: '#666', marginBottom: '10px' }}>
            집중력 향상 리듬 게임
          </p>
          <div style={{ fontSize: '100px', margin: '20px 0' }}>🐮</div>
          <p style={{ fontSize: '16px', color: '#888' }}>
            ADHD 및 우울증 진단 및 비약물적 치료 보조
          </p>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>
            난이도 선택
          </h2>

          <button
            onClick={() => onStartGame('easy')}
            style={{
              width: '100%',
              padding: '25px',
              marginBottom: '15px',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>😊</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Easy
            </div>
            <div style={{ fontSize: '16px', opacity: 0.8 }}>
              1초 간격 • 1분 • 3개 레인
            </div>
          </button>

          <button
            onClick={() => onStartGame('normal')}
            style={{
              width: '100%',
              padding: '25px',
              marginBottom: '15px',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ffd3a5 0%, #fd6585 100%)',
              transition: 'all 0.3s ease',
              color: 'white',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>🙂</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Normal
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              0.6초 간격 • 1분 30초 • 4개 레인
            </div>
          </button>

          <button
            onClick={() => onStartGame('hard')}
            style={{
              width: '100%',
              padding: '25px',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #c44569 100%)',
              transition: 'all 0.3s ease',
              color: 'white',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>😤</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Hard
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              0.4초 간격 • 2분 • 5개 레인
            </div>
          </button>
        </div>

        <div
          style={{
            background: '#f8f9fa',
            padding: '25px',
            borderRadius: '15px',
          }}
        >
          <h3 style={{ marginBottom: '15px', color: '#333' }}>게임 방법</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              '노트가 판정선(세로선)에 도달할 때 클릭',
              '정확한 타이밍일수록 높은 점수',
              'SPACE 키 또는 마우스 클릭으로 입력',
              'ESC 키로 일시정지',
            ].map((text, index) => (
              <li
                key={index}
                style={{
                  padding: '10px 0',
                  paddingLeft: '25px',
                  position: 'relative',
                  color: '#555',
                  fontSize: '15px',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: '0',
                    color: '#667eea',
                    fontWeight: 'bold',
                  }}
                >
                  ✓
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}