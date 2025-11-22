import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAccess } from '../util/fetchUtil';
import { GachaRequest, GachaResponse } from '../types/gacha.types';
import GachaAnimation from '../components/GachaAnimation';

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

function GachaPage() {
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // 뽑기 애니메이션 상태
  const [isAnimating, setIsAnimating] = useState(false);
  const [gachaResult, setGachaResult] = useState<string[]>([]);

  // 티켓 수 가져오기
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetchWithAccess(`${BACKEND_API_BASE_URL}/user`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('티켓 정보 불러오기 실패');

        const data = await res.json();
        setTickets(data.tickets || 0);
      } catch (err) {
        setError('티켓 정보를 불러올 수 없습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // 뽑기 실행
  const handleGacha = async (count: number) => {
    if (tickets < count) {
      setError(`티켓이 부족합니다! (보유: ${tickets}개, 필요: ${count}개)`);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const requestBody: GachaRequest = { count };

      const res = await fetchWithAccess(`${BACKEND_API_BASE_URL}/gacha`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error('뽑기 실패');

      const data: GachaResponse = await res.json();
      
      // 티켓 수 업데이트
      setTickets(data.remainingTickets);
      
      // 애니메이션 시작
      setGachaResult(data.items);
      setIsAnimating(true);
      
    } catch (err) {
      setError('뽑기 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 애니메이션 완료 후
  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setGachaResult([]);
  };

  if (isLoading && tickets === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 홈 버튼 */}
      <button 
        onClick={() => navigate('/main')} 
        style={styles.homeButton}
      >
        <img 
          src="/home-button.png" 
          alt="홈" 
          style={styles.buttonImage}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </button>

      {/* 티켓 표시 */}
      <div style={styles.ticketDisplay}>
        <img 
          src="/ticket.png" 
          alt="티켓" 
          style={styles.ticketIcon}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span style={styles.ticketCount}>{tickets}</span>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={styles.mainContent}>
        <h1 style={styles.title}>우왕이 먹이 뽑기</h1>
        
        {/* 뽑기 기계 */}
        <div style={styles.gachaMachine}>
          <img 
            src="/gacha-machine.png" 
            alt="뽑기 기계" 
            style={styles.machineImage}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={styles.errorMessage}>{error}</div>
        )}

        {/* 뽑기 버튼들 */}
        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleGacha(1)}
            disabled={isLoading || tickets < 1}
            style={{
              ...styles.gachaButton,
              opacity: isLoading || tickets < 1 ? 0.5 : 1,
            }}
          >
            <div style={styles.buttonContent}>
              <img 
                src="/ticket.png" 
                alt="티켓" 
                style={styles.buttonTicketIcon}
              />
              <span style={styles.buttonMultiply}>×</span>
              <span style={styles.buttonCount}>1</span>
            </div>
            <div style={styles.buttonLabel}>1회 뽑기</div>
          </button>

          <button
            onClick={() => handleGacha(5)}
            disabled={isLoading || tickets < 5}
            style={{
              ...styles.gachaButton,
              ...styles.gachaButton5x,
              opacity: isLoading || tickets < 5 ? 0.5 : 1,
            }}
          >
            <div style={styles.buttonContent}>
              <img 
                src="/ticket.png" 
                alt="티켓" 
                style={styles.buttonTicketIcon}
              />
              <span style={styles.buttonMultiply}>×</span>
              <span style={styles.buttonCount}>5</span>
            </div>
            <div style={styles.buttonLabel}>5회 뽑기</div>
          </button>
        </div>

        {/* 안내 텍스트 */}
        <p style={styles.infoText}>
          뽑기를 통해 우왕이에게 먹이를 줄 수 있어요!
        </p>
      </div>

      {/* 뽑기 애니메이션 */}
      {isAnimating && gachaResult.length > 0 && (
        <GachaAnimation 
          items={gachaResult} 
          onComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#d0f4f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  homeButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '60px',
    height: '60px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 100,
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  ticketDisplay: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'white',
    padding: '12px 20px',
    borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    zIndex: 100,
  },
  ticketIcon: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  ticketCount: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    width: '100%',
    maxWidth: '600px',
    padding: '20px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
  },
  gachaMachine: {
    width: '300px',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  machineImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  errorMessage: {
    backgroundColor: '#ffe0e0',
    color: '#ff4757',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    gap: '20px',
    width: '100%',
    justifyContent: 'center',
  },
  gachaButton: {
    backgroundColor: 'white',
    border: '3px solid #7d86bf',
    borderRadius: '20px',
    padding: '20px 30px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(125, 134, 191, 0.3)',
    minWidth: '180px',
  },
  gachaButton5x: {
    border: '3px solid #6c5ce7',
    boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  buttonTicketIcon: {
    width: '30px',
    height: '30px',
    objectFit: 'contain',
  },
  buttonMultiply: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#666',
  },
  buttonCount: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  buttonLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  infoText: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    marginTop: '10px',
  },
  loading: {
    fontSize: '24px',
    color: '#333',
    fontWeight: 'bold',
  },
};

export default GachaPage;