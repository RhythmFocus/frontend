import React from 'react';
import {DiagnosisItem} from '../types/diagnosis.types';

interface DiagnosisCardProps {
    item: DiagnosisItem;
    onClick: (item: DiagnosisItem) => void;
}

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({item, onClick}) => {
    const isCompleted = item.status === 'COMPLETED';

    const getBadgeStyle = (grade: string | null) => {
        switch (grade) {
            case 'PERFECT':
                return {bg: '#48dbfb', color: 'white'};
            case 'GOOD':
                return {bg: '#badc58', color: 'white'};
            default:
                return {bg: '#ddd', color: '#666'};
        }
    };

    const badgeStyle = getBadgeStyle(item.grade);

    return (
        <div style={styles.card}>
            <div style={styles.ribbon}>
                {isCompleted && (
                    <span style={styles.checkMark}>✓</span>
                )}
            </div>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{item.title}</h3>
                    {item.grade && (
                        <span style={{
                            ...styles.badge,
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.color
                        }}>
              {item.grade}
            </span>
                    )}
                </div>

                <div style={styles.categoryRow}>
                    <div style={{...styles.categoryDot, backgroundColor: item.categoryColor}}/>
                    <span style={styles.categoryText}>{item.category}</span>
                </div>

                <div style={styles.inputMethod}>
                    {item.inputMethod === 'MOUSE' ? '🖱️' : '⌨️'} {item.description}
                </div>
            </div>

            <button
                style={styles.actionButton}
                onClick={() => onClick(item)}
            >
        <span style={{marginRight: '5px'}}>
          {isCompleted ? '↺' : '▶'}
        </span>
                {isCompleted ? '다시 하기' : '시작 하기'}
            </button>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '300px',
        height: '230px',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        border: '1px solid #eee',
    },
    ribbon: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        backgroundColor: '#7d86bf',

        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 57% 43%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
    },
    checkMark: {
        color: 'white',
        fontSize: '30px',
        fontWeight: 'bold',
        position: 'absolute',
        top: '7px',
        right: '18px',

    },
    content: {
        padding: '25px 20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 5,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '15px',
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    badge: {
        fontSize: '10px',
        padding: '3px 6px',
        borderRadius: '4px',
        fontWeight: 'bold',
    },
    categoryRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: 'auto',
    },
    categoryDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
    },
    categoryText: {
        fontSize: '14px',
        color: '#666',
    },
    inputMethod: {
        fontSize: '13px',
        color: '#999',
        marginTop: '15px',
    },
    actionButton: {
        height: '50px',
        border: 'none',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
        color: '#555',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
    }
};

export default DiagnosisCard;