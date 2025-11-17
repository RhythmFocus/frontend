import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

function JoinPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState<null | boolean>(null);
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 4) {
        setIsUsernameValid(null);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_API_BASE_URL}/user/exist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username }),
        });

        const exists = await res.json();
        setIsUsernameValid(!exists);
      } catch {
        setIsUsernameValid(null);
      }
    };

    const delay = setTimeout(checkUsername, 300);
    return () => clearTimeout(delay);
  }, [username]);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (
      username.length < 4 ||
      password.length < 4 ||
      nickname.trim() === "" ||
      email.trim() === ""
    ) {
      setError("입력값을 다시 확인해주세요. (모든 항목은 필수이며, ID/비밀번호는 최소 4자)");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_API_BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password, nickname, email }),
      });

      if (!res.ok) throw new Error("회원가입 실패");
      navigate("/login");
    } catch {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>회원가입</h1>
        <p style={styles.subtitle}>새 계정을 만들어보세요</p>

        <form onSubmit={handleSignUp} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>아이디</label>
            <input
              type="text"
              placeholder="아이디 (4자 이상)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
              minLength={4}
            />
            {username.length >= 4 && isUsernameValid === false && (
              <span style={styles.validationError}>❌ 이미 사용 중인 아이디입니다</span>
            )}
            {username.length >= 4 && isUsernameValid === true && (
              <span style={styles.validationSuccess}>✅ 사용 가능한 아이디입니다</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호 (4자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              minLength={4}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>닉네임</label>
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={isUsernameValid !== true || isLoading}
            style={{
              ...styles.submitButton,
              opacity: isUsernameValid === true && !isLoading ? 1 : 0.6,
              cursor: isUsernameValid === true && !isLoading ? 'pointer' : 'not-allowed',
            }}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>이미 계정이 있으신가요? </span>
          <button onClick={() => navigate('/login')} style={styles.linkButton}>
            로그인
          </button>
        </div>

        <button onClick={() => navigate('/')} style={styles.backButton}>
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
    maxWidth: '420px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.3s',
  },
  validationError: {
    fontSize: '12px',
    color: '#ff4757',
  },
  validationSuccess: {
    fontSize: '12px',
    color: '#2ed573',
  },
  error: {
    padding: '12px',
    background: '#ffe0e0',
    color: '#ff4757',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
  },
  submitButton: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    transition: 'all 0.3s',
    marginTop: '10px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  backButton: {
    width: '100%',
    marginTop: '15px',
    padding: '10px',
    background: 'transparent',
    border: 'none',
    color: '#999',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default JoinPage;