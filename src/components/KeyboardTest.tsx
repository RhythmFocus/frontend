import React, { useState, useEffect } from 'react';

interface KeyboardTestProps {
    onReady: (isReady: boolean) => void;
}

const KeyboardTest: React.FC<KeyboardTestProps> = ({ onReady }) => {
    const [keyPressed, setKeyPressed] = useState(false);
    const [pressCount, setPressCount] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 일단 스페이스바 입력만 허용
            if (e.code === 'Space') {
                setKeyPressed(true);
                setPressCount(prev => {
                    const newCount = prev + 1;
                    // 일정 횟수만큼 사용자가 입력이 되는지 테스트 하고 넘어가도록
                    if (newCount >= 3) onReady(true);
                    return newCount;
                });

                // 시각적 피드백 리셋
                setTimeout(() => setKeyPressed(false), 100);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onReady]);

    return (
        <div style={styles.container}>
            <h3 style={{ color: '#333' }}>키보드 입력 테스트 ⌨️</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                스페이스바(Space)를 눌러보세요
            </p>

            {/* 키 입력 시각화 박스 */}
            <div style={{
                ...styles.keyBox,
                transform: keyPressed ? 'scale(0.95)' : 'scale(1)',
                backgroundColor: keyPressed ? '#4ECDC4' : '#eee',
                boxShadow: keyPressed ? '0 0 15px #4ECDC4' : 'none'
            }}>
                SPACE BAR
            </div>

            <div style={{ marginTop: '20px', fontWeight: 'bold', color: pressCount >= 3 ? '#2ecc71' : '#95a5a6' }}>
                {pressCount >= 3 ? "키보드 정상 작동" : `입력 감지: ${pressCount}회`}
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyBox: {
        width: '150px',
        height: '150px',
        borderRadius: '20px',
        border: '4px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        transition: 'all 0.1s',
        cursor: 'pointer',
    }
};

export default KeyboardTest;