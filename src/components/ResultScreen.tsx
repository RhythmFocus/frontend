import { useState } from 'react';
import { GameState } from '../types/game.types';
import { useNavigate } from 'react-router-dom';

interface ResultScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onHome: () => void;
}

function renderSessionComplete(
  gameState: GameState,
  onNext: () => void
) {
  const totalNotes =
    gameState.judgmentCounts.perfect +
    gameState.judgmentCounts.good +
    gameState.judgmentCounts.bad +
    gameState.judgmentCounts.miss;

  const clearRhythm = gameState.judgmentCounts.perfect + gameState.judgmentCounts.good;

  return (
    <>
      <h2 style={styles.congratsTitle}>오늘의 세션을 성공적으로 끝마치셨네요!</h2>
      
      <div style={styles.infoBox}>
        <p style={styles.todayText}>오늘은</p>
        <p style={styles.highlightText}>
          <span style={styles.greenNumber}>{totalNotes}</span>개의 리듬 중{' '}
          <span style={styles.greenNumber}>{clearRhythm}</span>개의 리듬을 틀리지 않고 수행했고
        </p>
        <p style={styles.highlightText}>
          {gameState.averageOffset >= 0 
            ? `전체적인 리듬 타이밍이 ${Math.abs(gameState.averageOffset).toFixed(1)}ms 정도 지연되었네요.`
            : `전체적인 리듬 타이밍이 ${Math.abs(gameState.averageOffset).toFixed(1)}ms 정도 빨랐어요!`
          }
        </p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Clear 리듬:</div>
          <div style={styles.statValue}>{clearRhythm}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>리듬 정확도:</div>
          <div style={styles.statValue}>{gameState.accuracy.toFixed(1)}%</div>
        </div>
      </div>

      <div style={styles.additionalStats}>
        <span>Score: {gameState.score.toLocaleString()} | </span>
        <span>Max Combo: {gameState.maxCombo}x</span>
      </div>

      <button style={styles.nextButton} onClick={onNext}>
        다음
      </button>
    </>
  );
}

function renderTicketReward(
  gameState: GameState,
  onNext: () => void
) {
  const earnedTickets = Math.floor(gameState.accuracy / 10);

  return (
    <>
      <div style={styles.rewardTitle}>
        <p>보상으로</p>
        <p>캐릭터를 키울 수 있는 음식을 뽑을 수 있는</p>
        <p style={styles.ticketHighlight}>뽑기권을</p>
        <p>{earnedTickets}개 드리겠습니다!</p>
      </div>

      <p style={styles.rewardSubtitle}>
        뽑기에서 맛있는 음식을 뽑아 우왕이를 성장시켜보세요!
      </p>

      <div style={styles.ticketDisplay}>
        <img 
          src="/ticket.png" 
          alt="뽑기권" 
          style={styles.ticketImage}
        />
        <img 
          src="/multiply.png" 
          alt="x" 
          style={styles.multiplyIcon}
        />
        <span style={styles.ticketCount}>{earnedTickets}</span>
      </div>

      <button style={styles.nextButton} onClick={onNext}>
        다음
      </button>
    </>
  );
}

function renderDiagnosisGuide(
  onRestart: () => void,
  navigate: ReturnType<typeof useNavigate>
) {
  const handleDiagnosisClick = () => {
    // TODO: 진단 페이지 구현하기
    navigate('/diagnosis');
  };

  return (
    <>
      <p style={styles.diagnosisText}>
        오늘의 세션으로 자신의 변화를 더 알아보고 싶다면
        <br />
        진단 탭에서 언제든지
        <br />
        자가진단 및 집중력 테스트를 진행하실 수 있습니다!
        <br />
        진단을 진행하시면 주 1회에 한정하여
        <br />
        <span style={styles.ticketHighlight}>뽑기권을 5개 드립니다!</span>
      </p>

      <div style={styles.ticketDisplay}>
        <img 
          src="/ticket.png" 
          alt="뽑기권" 
          style={styles.ticketImage}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <img 
          src="/multiply.png" 
          alt="x" 
          style={styles.multiplyIcon}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const span = document.createElement('span');
            span.textContent = '×';
            span.style.fontSize = '50px';
            span.style.fontWeight = 'bold';
            img.parentNode?.replaceChild(span, img);
          }}
        />
        <span style={styles.ticketCount}>5</span>
      </div>

      <button style={styles.diagnosisButton} onClick={handleDiagnosisClick}>
        진단하러 가기
      </button>

      <div style={styles.buttonRow}>
        <button style={styles.secondaryButton} onClick={onRestart}>
          다시 하기
        </button>
      </div>
    </>
  );
}

// 메인 ResultScreen 컴포넌트
export function ResultScreen({ gameState, onRestart, onHome }: ResultScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const navigate = useNavigate();

  const handleNextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3);
  };

  return (
    <div style={styles.overlay}>
      <button onClick={onHome} style={styles.homeButtonImage}>
        <img src="/home-button.png" alt="홈" style={styles.buttonImage} />
      </button>

      <div style={styles.card}>
        {step === 1 && renderSessionComplete(gameState, handleNextStep)}
        {step === 2 && renderTicketReward(gameState, handleNextStep)}
        {step === 3 && renderDiagnosisGuide(onRestart, navigate)}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#d0f4f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-out',
  },
  homeButtonImage: {
    position: 'absolute' as const,
    top: '20px',
    left: '20px',
    width: '60px',
    height: '60px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 100,
    transition: 'transform 0.2s ease',
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
  },
  card: {
    background: 'white',
    padding: '60px 50px',
    borderRadius: '30px',
    maxWidth: '700px',
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  congratsTitle: {
    fontSize: '24px',
    color: '#6c5ce7',
    marginBottom: '30px',
    fontWeight: 'bold',
  },
  infoBox: {
    background: '#f0f8ff',
    padding: '30px',
    borderRadius: '20px',
    marginBottom: '20px',
  },
  todayText: {
    fontSize: '20px',
    color: '#6c5ce7',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  highlightText: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '10px',
  },
  greenNumber: {
    fontSize: '24px',
    color: '#4caf50',
    fontWeight: 'bold',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '15px',
  },
  statBox: {
    background: '#f0f8ff',
    padding: '20px 30px',
    borderRadius: '15px',
    minWidth: '200px',
  },
  statLabel: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#4caf50',
  },
  additionalStats: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '30px',
  },
  nextButton: {
    padding: '15px 80px',
    fontSize: '20px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '30px',
    background: '#7d86bf',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(125, 134, 191, 0.4)',
    transition: 'all 0.3s ease',
  },
  rewardTitle: {
    fontWeight: 'bold',
    fontSize: '20px',
    color: '#555',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  ticketHighlight: {
    color: '#6c5ce7',
    fontWeight: 'bold',
  },
  rewardSubtitle: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '40px',
  },
  ticketDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '40px',
  },
  ticketImage: {
    width: '100px',
    height: 'auto',
  },
  multiplyIcon: {
    width: '50px',
    height: 'auto',
  },
  ticketCount: {
    fontSize: '100px',
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  diagnosisText: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#555',
    lineHeight: '1.8',
    marginBottom: '40px',
  },
  diagnosisButton: {
    padding: '15px 60px',
    fontSize: '20px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '30px',
    background: '#6c5ce7',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(125, 134, 191, 0.4)',
    marginBottom: '30px',
    transition: 'all 0.3s ease',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  secondaryButton: {
    padding: '12px 40px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: '2px solid #6c5ce7',
    borderRadius: '25px',
    background: 'white',
    color: '#6c5ce7',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};