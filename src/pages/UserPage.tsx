import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAccess } from "../util/fetchUtil";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

interface UserInfo {
  username: string;
  nickname: string;
  email: string;
  level: number;
  tickets: number;
}

function UserPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetchWithAccess(`${BACKEND_API_BASE_URL}/user`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error("유저 정보 불러오기 실패");

        const data: UserInfo = await res.json();
        setUserInfo(data);
      } catch (err) {
        setError("유저 정보를 불러오지 못했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 먹이 보관함 (추후 구현)
  const handleOpenInventory = () => {
    // TODO: 먹이 아이템 조회 페이지로 이동
    alert('먹이 보관함 기능은 추후 구현 예정입니다.');
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

      {/* 먹이 보관함 버튼 (우측 상단) */}
      <button 
        onClick={handleOpenInventory} 
        style={styles.inventoryButton}
      >
        <img 
          src="/treasure-closed.png" 
          alt="먹이 보관함" 
          style={styles.treasureIcon}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span style={styles.inventoryText}>먹이 보관함</span>
      </button>

      {/* 메인 콘텐츠 */}
      <div style={styles.mainContent}>
        {error && <div style={styles.error}>{error}</div>}

        {userInfo && (
          <>
            {/* 캐릭터 영역 */}
            <div style={styles.characterContainer}>
              <div style={styles.characterCircle}>
                <img
                  src="/character-level1.png"
                  alt="우왕이"
                  style={styles.characterImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/character.gif';
                  }}
                />
              </div>

              {/* 장식 도형들 */}
              <div style={{...styles.floatingShape, ...styles.shape1}}>🔴</div>
              <div style={{...styles.floatingShape, ...styles.shape2}}>🟢</div>
              <div style={{...styles.floatingShape, ...styles.shape3}}>🟡</div>
              <div style={{...styles.floatingShape, ...styles.shape4}}>🔵</div>
              <div style={{...styles.floatingShape, ...styles.shape5}}>🔶</div>
              <div style={{...styles.floatingShape, ...styles.shape6}}>⚫</div>
            </div>

            {/* 사용자 정보 */}
            <div style={styles.userInfoBox}>
              <div style={styles.username}>{userInfo.username}</div>
            </div>

            <div style={styles.levelDisplay}>
              <span style={styles.levelText}>LV. {userInfo.level}</span>
            </div>

            {/* 사운드 웨이브 장식 (좌우) */}
            <div style={styles.soundWaveLeft}>
              <div style={styles.waveBar1}></div>
              <div style={styles.waveBar2}></div>
              <div style={styles.waveBar3}></div>
              <div style={styles.waveBar4}></div>
              <div style={styles.waveBar5}></div>
            </div>

            <div style={styles.soundWaveRight}>
              <div style={styles.waveBar1}></div>
              <div style={styles.waveBar2}></div>
              <div style={styles.waveBar3}></div>
              <div style={styles.waveBar4}></div>
              <div style={styles.waveBar5}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#c7f8f5',
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
  inventoryButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'white',
    padding: '12px 20px',
    borderRadius: '15px',
    border: '3px solid #7d86bf',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(125, 134, 191, 0.3)',
    transition: 'all 0.3s',
    zIndex: 100,
  },
  treasureIcon: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  inventoryText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    position: 'relative',
  },
  error: {
    padding: '12px 20px',
    background: '#ffe0e0',
    color: '#ff4757',
    borderRadius: '10px',
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  characterContainer: {
    position: 'relative',
    width: '400px',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCircle: {
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    backgroundColor: 'white',
    border: '8px solid #FFD700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10,
  },
  characterImage: {
    width: '80%',
    height: '80%',
    objectFit: 'contain',
  },
  floatingShape: {
    position: 'absolute',
    fontSize: '30px',
    animation: 'float 3s ease-in-out infinite',
  },
  shape1: {
    top: '10%',
    left: '5%',
    animationDelay: '0s',
  },
  shape2: {
    top: '15%',
    right: '10%',
    animationDelay: '0.5s',
  },
  shape3: {
    top: '50%',
    left: '0%',
    animationDelay: '1s',
  },
  shape4: {
    top: '60%',
    right: '5%',
    animationDelay: '1.5s',
  },
  shape5: {
    bottom: '20%',
    left: '15%',
    animationDelay: '2s',
  },
  shape6: {
    top: '30%',
    left: '10%',
    animationDelay: '2.5s',
  },
  userInfoBox: {
    backgroundColor: 'white',
    padding: '12px 40px',
    borderRadius: '25px',
    border: '3px solid #333',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    marginTop: '10px',
  },
  username: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  levelDisplay: {
    marginTop: '10px',
  },
  levelText: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
  },
  loading: {
    fontSize: '24px',
    color: '#333',
    fontWeight: 'bold',
  },
  soundWaveLeft: {
    position: 'absolute',
    left: '-100px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  soundWaveRight: {
    position: 'absolute',
    right: '-100px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  waveBar1: {
    width: '6px',
    height: '20px',
    backgroundColor: '#FF6B6B',
    borderRadius: '3px',
    animation: 'wave 1s ease-in-out infinite',
    animationDelay: '0s',
  },
  waveBar2: {
    width: '6px',
    height: '35px',
    backgroundColor: '#4ECDC4',
    borderRadius: '3px',
    animation: 'wave 1s ease-in-out infinite',
    animationDelay: '0.1s',
  },
  waveBar3: {
    width: '6px',
    height: '50px',
    backgroundColor: '#95E1D3',
    borderRadius: '3px',
    animation: 'wave 1s ease-in-out infinite',
    animationDelay: '0.2s',
  },
  waveBar4: {
    width: '6px',
    height: '35px',
    backgroundColor: '#F38181',
    borderRadius: '3px',
    animation: 'wave 1s ease-in-out infinite',
    animationDelay: '0.3s',
  },
  waveBar5: {
    width: '6px',
    height: '20px',
    backgroundColor: '#AA96DA',
    borderRadius: '3px',
    animation: 'wave 1s ease-in-out infinite',
    animationDelay: '0.4s',
  },
};

// 글로벌 스타일에 애니메이션 추가
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  @keyframes wave {
    0%, 100% {
      transform: scaleY(1);
    }
    50% {
      transform: scaleY(1.5);
    }
  }
`;
document.head.appendChild(styleSheet);

export default UserPage;