import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          집중력 리듬게임
          <br />
          <span style={styles.titleAccent}>Rhythm Focus</span>
        </h1>
        
        <div style={styles.description}>
          리듬에 맞춰 집중력을 향상시키는 게임
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/login')}
            style={styles.primaryButton}
          >
            로그인
          </button>
          
          <button
            onClick={() => navigate('/join')}
            style={styles.secondaryButton}
          >
            회원가입
          </button>
        </div>

        <div style={styles.footer}>
          게임을 플레이하려면 로그인이 필요합니다
        </div>
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
    padding: '60px 50px',
    borderRadius: '30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
    maxWidth: '450px',
    width: '90%',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    lineHeight: '1.4',
  },
  titleAccent: {
    color: '#667eea',
    fontSize: '36px',
  },
  description: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '40px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  primaryButton: {
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  secondaryButton: {
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: '2px solid #667eea',
    borderRadius: '12px',
    background: 'white',
    color: '#667eea',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  footer: {
    marginTop: '30px',
    fontSize: '14px',
    color: '#999',
  },
};

export default HomePage;