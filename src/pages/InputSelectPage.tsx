import React from 'react';
import { useNavigate } from 'react-router-dom';

function InputSelectPage() {
    const navigate = useNavigate();

    // 모드 선택 시 캘리브레이션 페이지로 이동하며 상태 전달
    const handleSelectMode = (mode: 'motion' | 'keyboard') => {
        navigate('/calibration/process', { state: { selectedMode: mode } });
    };

    return (
        <div style={styles.container}>
            <div style={styles.homeIcon} onClick={() => navigate('/main')}>
                🏠
            </div>

            <div style={styles.card}>
                <h1 style={styles.title}>리듬 입력 방식을 선택해주세요!</h1>

                <div style={styles.buttonContainer}>
                    <div
                        style={styles.selectionBox}
                        onClick={() => handleSelectMode('motion')}
                    >
                        <div style={styles.iconWrapper}>
                            <span style={{ fontSize: '80px' }}>👏</span>
                        </div>
                        <button style={styles.actionButton}>손뼉</button>
                    </div>

                    <div
                        style={styles.selectionBox}
                        onClick={() => handleSelectMode('keyboard')}
                    >
                        <div style={styles.iconWrapper}>
                            <span style={{ fontSize: '80px' }}>⌨️</span>
                        </div>
                        <button style={styles.actionButton}>키보드</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#d0f4f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
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
        backgroundColor: 'white',
        padding: '60px 80px',
        borderRadius: '30px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '800px',
        width: '90%',
    },
    title: {
        fontSize: '28px',
        color: '#555',
        marginBottom: '60px',
        fontWeight: 'bold',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '80px',
        flexWrap: 'wrap',
    },
    selectionBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    iconWrapper: {
        marginBottom: '20px',
        // 실제 이미지 사용 시 사이즈 조절
        width: '150px',
        height: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButton: {
        padding: '12px 60px',
        fontSize: '18px',
        backgroundColor: '#7d86bf',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 10px rgba(125, 134, 191, 0.4)',
    }
};

export default InputSelectPage;