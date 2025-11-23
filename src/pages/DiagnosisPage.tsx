import React from 'react';
import { useNavigate } from 'react-router-dom';
import DiagnosisCard from '../components/DiagnosisCard';
import { DiagnosisItem } from '../types/diagnosis.types';

// 진단 리스트
const DIAGNOSIS_LIST: DiagnosisItem[] = [
    { id: '1', type: 'STROOP', title: 'Stroop Test', category: '집중력', categoryColor: '#ff6b6b', inputMethod: 'MOUSE', status: 'COMPLETED', grade: 'GOOD', description: '마우스 사용' },
    { id: '2', type: 'N_BACK', title: 'N-back Test', category: '집중력', categoryColor: '#ff6b6b', inputMethod: 'KEYBOARD', status: 'COMPLETED', grade: 'PERFECT', description: '키보드 사용' },
    { id: '3', type: 'SNAP_IV', title: 'SNAP_IV', category: 'ADHD', categoryColor: '#6ab04c', inputMethod: 'MOUSE', status: 'NOT_STARTED', grade: null, description: '마우스 사용' },
    // 집중력 테스트
    { id: '1', type: 'STROOP', title: 'Stroop Test', category: '집중력', categoryColor: '#ff6b6b', inputMethod: 'MOUSE', status: 'NOT_STARTED', grade: null, description: '마우스 사용' },
    { id: '2', type: 'N_BACK', title: 'N-back Test', category: '집중력', categoryColor: '#ff6b6b', inputMethod: 'KEYBOARD', status: 'NOT_STARTED', grade: null, description: '키보드 사용' },

    // ADHD 설문
    { id: '3', type: 'SNAP_IV', title: 'SNAP-IV', category: 'ADHD', categoryColor: '#6ab04c', inputMethod: 'MOUSE', status: 'NOT_STARTED', grade: null, description: '마우스 사용' },
    { id: '4', type: 'ASRS', title: 'ASRS', category: 'ADHD', categoryColor: '#6ab04c', inputMethod: 'MOUSE', status: 'NOT_STARTED', grade: null, description: '마우스 사용' },

    // 인지 기능 설문
    { id: '5', type: 'CFQ', title: 'CFQ', category: 'ADHD, 우울증', categoryColor: '#e1b12c', inputMethod: 'MOUSE', status: 'NOT_STARTED', grade: null, description: '마우스 사용' },
];

function DiagnosisPage() {
    const navigate = useNavigate();

    const handleCardClick = (item: DiagnosisItem) => {
        if (['ASRS', 'SNAP_IV'].includes(item.type)) {
            navigate('/survey', { state: { gameType: item.type } });
            return;
        }

        if (item.inputMethod === 'KEYBOARD') {
            navigate('/calibration', { state: { selectedMode: 'keyboard', gameType: item.type } });
        } else {
            navigate('/select-mode', { state: { gameType: item.type } });
        }
    };

    return (
        <div style={styles.container}>
            {/* 상단 영역 (홈 아이콘 + 헤더 텍스트) */}
            <div style={styles.topBar}>
                <div style={styles.homeIcon} onClick={() => navigate('/main')}>
                    🏠
                </div>

                <div style={styles.headerBox}>
                    <span style={styles.headerTitle}>진단 선택</span>
                    <span style={styles.divider}>|</span>
                    <span style={styles.headerDesc}>마우스 휠을 스크롤하여 진단 목록을 살펴보세요.</span>
                </div>
            </div>

            {/* 가로 스크롤 리스트 (2줄 그리드) */}
            <div style={styles.scrollContainer}>
                <div style={styles.gridContainer}>
                    {DIAGNOSIS_LIST.map((item) => (
                        <DiagnosisCard
                            key={item.id}
                            item={item}
                            onClick={handleCardClick}
                        />
                    ))}
                </div>
            </div>

            {/* 스크롤바 스타일 커스텀 */}
            <style>
                {`
          .scroll-hide::-webkit-scrollbar {
            height: 10px;
          }
          .scroll-hide::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.05);
            margin-left: 50px;
            margin-right: 50px;
            border-radius: 5px;
          }
          .scroll-hide::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.2);
            border-radius: 5px;
          }
          .scroll-hide::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.3);
          }
        `}
            </style>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#c7f8f5', // 민트색 배경
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden', // 전체 화면 스크롤 방지
    },

    topBar: {
        display: 'flex',
        alignItems: 'center',
        padding: '30px 50px 20px 50px',
        gap: '20px',
    },
    homeIcon: {
        fontSize: '36px',
        cursor: 'pointer',
        color: '#00d2d3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerBox: {
        backgroundColor: 'white',
        padding: '15px 30px',
        borderRadius: '15px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    headerTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        color: '#ddd',
        fontSize: '20px',
        paddingBottom: '4px',
    },
    headerDesc: {
        fontSize: '16px',
        color: '#666',
    },

    scrollContainer: {
        flex: 1,
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '20px 50px 20px 50px',
        display: 'flex',
        alignItems: 'flex-start',
    },
    gridContainer: {
        display: 'grid',
        gridTemplateRows: 'repeat(2, 200px)',
        gridAutoFlow: 'column',
        rowGap: '45px',
        columnGap: '15px',
    }
};

export default DiagnosisPage;