import React from 'react';
import { useNavigate } from 'react-router-dom';

function GuidePage() {
    const navigate = useNavigate();

    const handleStart = () => {
        // TODO: 진단 페이지 구현하기
        navigate('/diagnosis');
    };

    return (
        <div style={styles.container}>
            {/* 홈 아이콘 */}
            <div style={styles.homeIcon} onClick={() => navigate('/main')}>
                🏠
            </div>

            <div style={styles.card}>
                {/* 메인 페이지 타이틀 스타일과 유사하게 적용 */}
                <h1 style={styles.title}>
                    집중력 리듬 게임에 오신 것을 환영합니다!
                </h1>

                <p style={styles.description}>
                    본 게임은 <span style={styles.highlight}>ADHD, 우울증</span>을 진단하고<br />
                    이를 돕기 위해 <span style={styles.highlight}>집중력 증진 치료</span>를 제공하고 있습니다!
                </p>

                <p style={styles.subDescription}>
                    우선 <span style={styles.highlight}>자가 진단</span> 및 <span style={styles.highlight}>집중력 테스트</span>를 진행해보시겠습니까?
                </p>

                <button onClick={handleStart} style={styles.actionButton}>
                    진단하러 가기
                </button>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#d0f4f0', // 민트색 배경 (메인 페이지와 톤 유사)
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '20px',
        boxSizing: 'border-box',
        // 메인 페이지처럼 별도의 폰트 패밀리 지정 없이 시스템 기본 폰트 사용
    },
    homeIcon: {
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontSize: '30px',
        cursor: 'pointer',
        color: '#00d2d3',
    },
    card: {
        width: 'min(90vw, 800px)',
        aspectRatio: '16 / 9',
        maxHeight: '70vh',
        backgroundColor: 'white',
        borderRadius: '30px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        boxSizing: 'border-box',
    },
    title: {
        // 메인 페이지의 Header Title 스타일 참고 (fontWeight: 'bold', 그림자 등)
        fontSize: 'min(3.5vw, 32px)',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '30px',
        lineHeight: '1.3',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)', // 메인 페이지의 텍스트 그림자 효과 적용
    },
    description: {
        fontSize: 'min(3vw, 20px)',
        color: '#333',
        marginBottom: '20px',
        lineHeight: '1.6',
        fontWeight: '500', // 가독성을 위해 약간 두께감 줌
    },
    subDescription: {
        fontSize: 'min(3vw, 20px)',
        color: '#333',
        marginBottom: '50px',
        lineHeight: '1.6',
        fontWeight: '500',
    },
    highlight: {
        color: '#6c5ce7', // 보라색 강조
        fontWeight: 'bold',
    },
    actionButton: {
        padding: '15px 50px',
        fontSize: '18px',
        backgroundColor: 'white',
        color: '#555',
        border: '2px solid #eee',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.2s',
    }
};

export default GuidePage;