import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAccess } from "../util/fetchUtil";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

interface UserInfo {
  username: string;
  nickname: string;
  email: string;
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
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error("유저 정보 불러오기 실패");

        const data: UserInfo = await res.json();
        setUserInfo(data);
      } catch (err) {
        setError("유저 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>내 정보</h1>

        {error && <div style={styles.error}>{error}</div>}

        {userInfo && (
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>아이디</span>
              <span style={styles.infoValue}>{userInfo.username}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>닉네임</span>
              <span style={styles.infoValue}>{userInfo.nickname}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>이메일</span>
              <span style={styles.infoValue}>{userInfo.email}</span>
            </div>
          </div>
        )}

        <button onClick={() => navigate('/main')} style={styles.backButton}>
          ← 메인으로 돌아가기
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
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    maxWidth: '500px',
    width: '90%',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
    textAlign: 'center',
  },
  error: {
    padding: '12px',
    background: '#ffe0e0',
    color: '#ff4757',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '12px',
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  loading: {
    fontSize: '24px',
    color: 'white',
  },
  backButton: {
    width: '100%',
    marginTop: '30px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
  },
};

export default UserPage;