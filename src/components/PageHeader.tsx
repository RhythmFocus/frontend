import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
    title: string;
    backPath?: string;
    onBackClick?: () => void;
    dotColor?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
                                                   title,
                                                   backPath,
                                                   onBackClick,
                                                   dotColor = '#ff8a80'  // 기본값 (기존 분홍색)
                                               }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBackClick) {
            onBackClick();
        } else if (backPath) {
            navigate(backPath);
        } else {
            navigate(-1);
        }
    };

    return (
        <div style={styles.headerContainer}>
            <div style={styles.headerContent}>
                <div style={styles.leftGroup}>
                    <span style={{ ...styles.dot, color: dotColor }}>●</span>
                    <span style={styles.title}>{title}</span>
                </div>

                <div style={styles.rightGroup} onClick={handleBack}>
                    &lt; 진단 선택 화면으로
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    headerContainer: {
        width: '100%',
        backgroundColor: 'white',
        padding: '15px 0',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'center',
    },
    headerContent: {
        width: '100%',
        maxWidth: '1000px', // 메인 카드와 너비 맞춤
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        boxSizing: 'border-box',
    },
    leftGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    dot: {
        color: '#ff8a80', // 디자인 포인트 컬러 (분홍)
        fontSize: '20px',
        lineHeight: 1,
    },
    title: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
    },
    rightGroup: {
        fontSize: '16px',
        color: '#666',
        cursor: 'pointer',
        textDecoration: 'underline', // 링크 느낌 강조
    }
};

export default PageHeader;