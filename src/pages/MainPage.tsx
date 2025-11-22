import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAccess } from "../util/fetchUtil";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

interface UserInfo {
  username: string;
  nickname: string;
  email: string;
}

function MainPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetchWithAccess(`${BACKEND_API_BASE_URL}/user`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error("유저 정보 불러오기 실패");

        const data: UserInfo = await res.json();
        setUserInfo(data);
      } catch (err) {
        console.error(err);
        // 인증 실패 시 로그인 페이지로
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate('/');
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 왼쪽 사이드바 */}
      <div style={styles.sidebar}>
        <button
          onClick={() => navigate('/game')}
          style={styles.startButton}
        >
          <span style={{ fontSize: '24px' }}>▶</span>
          <span>게임 시작</span>
        </button>

        <div style={styles.menuGroup}>
          <button style={styles.menuButton}>나의 기록</button>
          <button style={styles.menuButton}>진단</button>
          <button style={styles.menuButton}>내 캐릭터</button>
          <button 
            onClick={() => navigate('/gacha')}
            style={styles.menuButton}>뽑기</button>
          <button style={styles.menuButton}>설정</button>
          <button style={styles.menuButton}>Language</button>
          <button
            onClick={() => navigate('/calibration')}
            style={styles.menuButton}
          >
            <span>Calibration</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            집중력 리듬게임
            <br />
            <span style={styles.titleAccent}>Rhythm Focus</span>
          </h1>
        </div>

        {/* 캐릭터 영역 */}
        <div style={styles.characterArea}>
          <img
            src="/character.gif"  
            alt="캐릭터"
            style={styles.character}
            onError={(e) => {
              // 이미지 로드 실패 시 대체 텍스트
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* 사용자 정보 & 통계 */}
        <div style={styles.statsContainer}>
          <div style={styles.userCard}>
            <div style={styles.username}>{userInfo?.username || '로딩 중...'}</div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>2주차</div>
              <div style={styles.statValue}>High Score</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>이번주 세션</div>
              <div style={styles.statValue}>97.2%</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>2회 남았어요!</div>
              <div style={styles.statValue}>Accuracy</div>
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button onClick={handleLogout} style={styles.logoutButton}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    background: '#b8e6e1',
  },
  sidebar: {
    width: '280px',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  startButton: {
    padding: '18px 24px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #ffd93d 0%, #ffb800 100%)',
    color: '#333',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 184, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
  },
  menuGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  menuButton: {
    padding: '14px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '12px',
    background: 'white',
    color: '#333',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
  },
  header: {
    position: 'absolute',
    top: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#333',
    lineHeight: '1.3',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
  },
  titleAccent: {
    fontSize: '42px',
    color: '#ff6b9d',
  },
  characterArea: {
    position: 'relative',
    width: '300px',
    height: '300px',
    marginBottom: '40px',
  },
  character: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  characterPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '20px',
  },
  characterIcon: {
    fontSize: '120px',
  },
  characterText: {
    fontSize: '18px',
    color: '#666',
    marginTop: '10px',
  },
  statsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '15px',
    position: 'absolute',
    bottom: '40px',
    right: '40px',
  },
  userCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '12px 24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  username: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  statBox: {
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '12px 20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    minWidth: '200px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  loading: {
    fontSize: '24px',
    color: '#666',
  },
  logoutButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    fontSize: '14px',
    border: '2px solid white',
    borderRadius: '8px',
    background: 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
};

export default MainPage;