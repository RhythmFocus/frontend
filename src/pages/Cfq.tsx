import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// CFQ 응답 점수 타입 정의 (0: 전혀 아니다 ~ 4: 매우 자주 그렇다)
type ScoreValue = 0 | 1 | 2 | 3 | 4;

// CFQ 문항 타입 정의
interface CfqQuestion {
    id: number;
    text: string;
}

// CFQ 문항 데이터 (25개 문항)
const CFQ_QUESTIONS: CfqQuestion[] = [
    { id: 1, text: '종종 물건을 놓아둔 장소를 잊는다.' },
    { id: 2, text: '실수로 약속 시간이나 날짜를 잊는다.' },
    { id: 3, text: '대화 중에 한쪽의 말을 놓치는 일이 있다.' },
    { id: 4, text: '길을 가다가 목적지를 지나칠 때가 있다.' },
    { id: 5, text: '쉬운 계산에서 실수를 한다.' },
    { id: 6, text: '뭔가를 읽고 나서 \'지금 무엇을 읽었지?\' 하고 잊어버린다.' },
    { id: 7, text: '생각 없이 뭔가를 부딪히거나 넘어질 때가 있다.' },
    { id: 8, text: '가벼운 일상 작업(예: 전등 끄기)을 잊는다.' },
    { id: 9, text: '전화번호를 한동안 기억하지 못할 때가 있다.' },
    { id: 10, text: '물건을 잘못 놓아 찾느라 시간을 낭비한다.' },
    { id: 11, text: '자신이 하던 일을 잠깐 잊어버린다.' },
    { id: 12, text: '자신이 막 말하려고 했던 단어를 잊는다.' },
    { id: 13, text: '계산이나 수치 입력에서 잘못 입력한다.' },
    { id: 14, text: '누군가가 건네준 물건을 놓고 잊어버린다.' },
    { id: 15, text: '가끔 해야 할 일을 빼먹는다.' },
    { id: 16, text: '말하려던 내용을 잊어버려 머뭇거린다.' },
    { id: 17, text: '길을 가다가 무언가를 찾느라 멈춘다.' },
    { id: 18, text: '문을 닫았는지 잊어버린다.' },
    { id: 19, text: '물건을 찾느라 잠시 집중을 잃는다.' },
    { id: 20, text: '대화에서 맥락을 놓쳐 당황할 때가 있다.' },
    { id: 21, text: '쉽고 반복적인 업무에서 실수를 한다.' },
    { id: 22, text: '약속 장소를 헷갈려 잘못 갈 때가 있다.' },
    { id: 23, text: '실수로 잘못된 버튼(예: 리모컨)을 누른다.' },
    { id: 24, text: '물건을 잘못 정리해 같은 것이 여러 개 있다.' },
    { id: 25, text: '일상에서 작은 실수를 반복하는 편이다.' },
];

// 응답 선택지 라벨
const SCORE_LABELS: Record<ScoreValue, string> = {
    0: '전혀 아니다',
    1: '거의 아니다',
    2: '가끔 그렇다',
    3: '자주 그렇다',
    4: '매우 자주 그렇다',
};

// 총점 구간별 결과 기준 (쉽게 수정 가능하도록 상수로 정의)
const SCORE_RANGES = [
    { min: 0, max: 10, label: '매우 낮음' },
    { min: 11, max: 25, label: '낮음' },
    { min: 26, max: 50, label: '중간' },
    { min: 51, max: 75, label: '높음' },
    { min: 76, max: 100, label: '매우 높음' },
] as const;

/**
 * 총점에 따른 구간별 결과를 반환하는 함수
 * @param totalScore 전체 총점
 * @returns 구간별 결과 라벨
 */
const getScoreRangeLabel = (totalScore: number): string => {
    const range = SCORE_RANGES.find(r => totalScore >= r.min && totalScore <= r.max);
    return range ? range.label : '알 수 없음';
};

/**
 * 총점에 따른 결과 설명 문장을 반환하는 함수
 * @param totalScore 전체 총점
 * @returns 결과 설명 문장
 */
const getScoreDescription = (totalScore: number): string => {
    const range = SCORE_RANGES.find(r => totalScore >= r.min && totalScore <= r.max);
    if (!range) return '알 수 없는 결과입니다.';
    
    switch (range.label) {
        case '매우 낮음':
            return '인지적 실수 수준이 매우 낮은 편입니다. 일상적인 인지 기능이 잘 유지되고 있는 것으로 보입니다.';
        case '낮음':
            return '인지적 실수 수준이 낮은 편입니다. 대체로 정상적인 인지 기능을 보이고 있습니다.';
        case '중간':
            return '인지적 실수 수준이 중간 정도입니다. 일상 생활에 큰 지장은 없으나 주의가 필요할 수 있습니다.';
        case '높음':
            return '인지적 실수 수준이 높은 편입니다. 전문의와 상담하여 정확한 평가를 받는 것을 권장합니다.';
        case '매우 높음':
            return '인지적 실수 수준이 매우 높은 편입니다. 전문의와의 상담을 통해 정확한 진단과 적절한 조치를 받으시기 바랍니다.';
        default:
            return '알 수 없는 결과입니다.';
    }
};

// 점수 결과 타입
interface ScoreResult {
    total: number; // 전체 총점 (25문항 합계) - 최종 결과 기준
}

function Cfq() {
    const navigate = useNavigate();
    
    // 각 문항별 응답 점수를 저장하는 state
    // key: 문항 ID, value: 선택한 점수 (0~4)
    const [responses, setResponses] = useState<Record<number, ScoreValue | null>>({});
    
    // 제출 완료 여부 (점수 결과 표시 여부)
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // 계산된 점수 결과
    const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

    /**
     * 문항별 응답 점수 변경 핸들러
     * @param questionId 문항 ID
     * @param score 선택한 점수 (0~4)
     */
    const handleScoreChange = (questionId: number, score: ScoreValue) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: score,
        }));
    };

    /**
     * 모든 문항에 응답했는지 확인
     * @returns 모든 문항에 응답했으면 true, 아니면 false
     */
    const isAllAnswered = (): boolean => {
        return CFQ_QUESTIONS.every(question => responses[question.id] !== null && responses[question.id] !== undefined);
    };

    /**
     * 점수 계산 함수
     * - 전체 25문항 총점 계산
     */
    const calculateScores = (): ScoreResult => {
        let totalScore = 0;

        // 각 문항별 점수를 합산
        CFQ_QUESTIONS.forEach(question => {
            const score = responses[question.id] ?? 0;
            totalScore += score;
        });

        return {
            total: totalScore,
        };
    };

    /**
     * 점수 계산하기 버튼 클릭 핸들러
     * 모든 문항에 응답했을 때만 점수를 계산하고 결과를 표시
     */
    const handleSubmit = () => {
        if (!isAllAnswered()) {
            alert('모든 문항에 응답해주세요.');
            return;
        }

        const scores = calculateScores();
        setScoreResult(scores);
        setIsSubmitted(true);
        
        // 결과 영역으로 스크롤
        setTimeout(() => {
            const resultSection = document.getElementById('cfq-result-section');
            if (resultSection) {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    /**
     * 다시 설문하기 버튼 클릭 핸들러
     * 모든 응답과 결과를 초기화
     */
    const handleReset = () => {
        setResponses({});
        setIsSubmitted(false);
        setScoreResult(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                {/* 상단 헤더 영역 */}
                <div style={styles.header}>
                    <div style={styles.homeIcon} onClick={() => navigate('/main')}>
                        🏠
                    </div>
                    <div style={styles.headerContent}>
                        <h1 style={styles.title}>CFQ 설문조사</h1>
                        <p style={styles.subtitle}>인지적 실수 질문지 (Cognitive Failures Questionnaire)</p>
                    </div>
                </div>

                {/* 안내 문구 */}
                {!isSubmitted && (
                    <div style={styles.infoBox}>
                        <p style={styles.infoText}>
                            아래 25개의 문항에 대해 최근 6개월 동안의 경험을 기준으로 평가해주세요.
                        </p>
                        <p style={styles.infoText}>
                            각 문항에 대해 <strong>0점(전혀 아니다)</strong>부터 <strong>4점(매우 자주 그렇다)</strong>까지 선택해주세요.
                        </p>
                    </div>
                )}

                {/* 설문 문항 영역 */}
                {!isSubmitted && (
                    <div style={styles.content}>
                        <div style={styles.questionsList}>
                            {CFQ_QUESTIONS.map((question) => (
                                <div key={question.id} style={styles.questionCard}>
                                    <div style={styles.questionHeader}>
                                        <span style={styles.questionNumber}>{question.id}.</span>
                                        <p style={styles.questionText}>{question.text}</p>
                                    </div>
                                    <div style={styles.scoreOptions}>
                                        {[0, 1, 2, 3, 4].map((score) => {
                                            const isSelected = responses[question.id] === score;
                                            return (
                                                <label
                                                    key={score}
                                                    style={{
                                                        ...styles.scoreOption,
                                                        ...(isSelected ? styles.scoreOptionSelected : styles.scoreOptionUnselected),
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${question.id}`}
                                                        value={score}
                                                        checked={isSelected}
                                                        onChange={() => handleScoreChange(question.id, score as ScoreValue)}
                                                        style={styles.radioInput}
                                                    />
                                                    <span style={styles.scoreLabel}>{score}</span>
                                                    <span style={styles.scoreDescription}>{SCORE_LABELS[score as ScoreValue]}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 점수 계산하기 버튼 */}
                        <div style={styles.submitSection}>
                            <button
                                onClick={handleSubmit}
                                disabled={!isAllAnswered()}
                                style={{
                                    ...styles.submitButton,
                                    ...(isAllAnswered() ? styles.submitButtonActive : styles.submitButtonDisabled),
                                }}
                            >
                                {isAllAnswered() ? '점수 계산하기' : `미응답 문항: ${25 - Object.keys(responses).filter(k => responses[Number(k)] !== null).length}개`}
                            </button>
                        </div>
                    </div>
                )}

                {/* 점수 결과 영역 - 전체 총점과 구간별 결과만 표시 */}
                {isSubmitted && scoreResult && (
                    <div id="cfq-result-section" style={styles.resultSection}>
                        <h2 style={styles.resultTitle}>평가 결과</h2>
                        
                        {/* 전체 총점 카드 */}
                        <div style={styles.resultCardMain}>
                            <div style={styles.resultCardHeader}>
                                <span style={styles.resultCardTitle}>전체 총점</span>
                                <span style={styles.resultCardSubtitle}>(Total Score)</span>
                            </div>
                            <div style={styles.resultCardScore}>{scoreResult.total}</div>
                            <div style={styles.resultCardMax}>/ 100점</div>
                            <div style={styles.resultCardDescription}>
                                25개 문항의 합계 (각 문항 최대 4점)
                            </div>
                        </div>

                        {/* 구간별 결과 */}
                        <div style={styles.rangeResultBox}>
                            <h3 style={styles.rangeResultTitle}>총점 구간별 결과</h3>
                            <div style={styles.rangeResultLabel}>
                                {getScoreRangeLabel(scoreResult.total)}
                            </div>
                            <div style={styles.rangeResultDescription}>
                                {getScoreDescription(scoreResult.total)}
                            </div>
                        </div>

                        {/* 점수 해석 안내 */}
                        <div style={styles.interpretationBox}>
                            <h3 style={styles.interpretationTitle}>점수 해석 안내</h3>
                            <ul style={styles.interpretationList}>
                                <li>이 설문은 참고용이며, 정확한 진단은 전문의와 상담하시기 바랍니다.</li>
                                <li>총점 구간 기준: 0~10 (매우 낮음), 11~25 (낮음), 26~50 (중간), 51~75 (높음), 76~100 (매우 높음)</li>
                            </ul>
                        </div>

                        {/* 액션 버튼들 */}
                        <div style={styles.actionButtons}>
                            <button onClick={handleReset} style={styles.resetButton}>
                                다시 설문하기
                            </button>
                            <button onClick={() => navigate('/diagnosis')} style={styles.backButton}>
                                진단 목록으로 돌아가기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 스타일 정의
const styles: { [key: string]: React.CSSProperties } = {
    wrapper: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#f0f9ff',
    },
    container: {
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#f0f9ff',
        paddingBottom: '40px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: '30px 50px 20px 50px',
        gap: '20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    homeIcon: {
        fontSize: '36px',
        cursor: 'pointer',
        color: '#00d2d3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1e293b',
        margin: 0,
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#64748b',
        margin: 0,
    },
    infoBox: {
        backgroundColor: '#e0f2fe',
        padding: '20px 50px',
        margin: '20px 50px',
        borderRadius: '12px',
        border: '2px solid #0ea5e9',
    },
    infoText: {
        fontSize: '15px',
        color: '#0c4a6e',
        margin: '8px 0',
        lineHeight: '1.6',
    },
    content: {
        padding: '30px 50px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    questionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    questionCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
    },
    questionHeader: {
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        alignItems: 'flex-start',
    },
    questionNumber: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#3b82f6',
        minWidth: '30px',
    },
    questionText: {
        fontSize: '16px',
        color: '#334155',
        margin: 0,
        lineHeight: '1.6',
        flex: 1,
    },
    scoreOptions: {
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        paddingLeft: '42px',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
    },
    scoreOption: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 10px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: 'white',
        flex: '1 1 0',
        minWidth: '140px',
        minHeight: '100px',
        justifyContent: 'center',
    },
    scoreOptionSelected: {
        border: '2px solid #3b82f6',
        backgroundColor: '#eff6ff',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
    },
    scoreOptionUnselected: {
        border: '2px solid #cbd5e1', // 선택되지 않은 옵션의 테두리 색상 명시
        backgroundColor: 'white',
    },
    radioInput: {
        display: 'none',
    },
    scoreLabel: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: '4px',
    },
    scoreDescription: {
        fontSize: '12px',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: '1.4',
        wordBreak: 'keep-all',
    },
    submitSection: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '40px',
        padding: '20px 0',
    },
    submitButton: {
        padding: '16px 48px',
        fontSize: '18px',
        fontWeight: 'bold',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    submitButtonActive: {
        backgroundColor: '#3b82f6',
        color: 'white',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    },
    submitButtonDisabled: {
        backgroundColor: '#cbd5e1',
        color: '#64748b',
        cursor: 'not-allowed',
    },
    resultSection: {
        padding: '40px 50px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    resultTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: '40px',
    },
    resultCardMain: {
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        textAlign: 'center',
        border: '2px solid #3b82f6',
        marginBottom: '32px',
        maxWidth: '600px',
        margin: '0 auto 32px auto',
    },
    resultCardHeader: {
        marginBottom: '24px',
    },
    resultCardTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1e293b',
        display: 'block',
        marginBottom: '8px',
    },
    resultCardSubtitle: {
        fontSize: '16px',
        color: '#64748b',
    },
    resultCardScore: {
        fontSize: '64px',
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: '12px',
    },
    resultCardMax: {
        fontSize: '20px',
        color: '#94a3b8',
        marginBottom: '16px',
    },
    resultCardDescription: {
        fontSize: '14px',
        color: '#64748b',
    },
    rangeResultBox: {
        backgroundColor: '#fef3c7',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '32px',
        border: '2px solid #fbbf24',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto 32px auto',
    },
    rangeResultTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#78350f',
        marginBottom: '16px',
    },
    rangeResultLabel: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: '12px',
    },
    rangeResultDescription: {
        fontSize: '16px',
        color: '#92400e',
        lineHeight: '1.6',
    },
    interpretationBox: {
        backgroundColor: '#f1f5f9',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '32px',
        border: '2px solid #cbd5e1',
    },
    interpretationTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '16px',
    },
    interpretationList: {
        fontSize: '15px',
        color: '#475569',
        lineHeight: '1.8',
        margin: 0,
        paddingLeft: '24px',
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
    },
    resetButton: {
        padding: '14px 32px',
        fontSize: '16px',
        fontWeight: 'bold',
        borderRadius: '10px',
        border: '2px solid #3b82f6',
        backgroundColor: 'white',
        color: '#3b82f6',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    backButton: {
        padding: '14px 32px',
        fontSize: '16px',
        fontWeight: 'bold',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#64748b',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
};

export default Cfq;

