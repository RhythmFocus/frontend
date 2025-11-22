import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ASRS 응답 점수 타입 정의 (0: 전혀 없다 ~ 4: 매우 자주 있다)
type ScoreValue = 0 | 1 | 2 | 3 | 4;

// ASRS 문항 Part 타입
type Part = 'A' | 'B';

// ASRS 문항 타입 정의
interface AsrsQuestion {
    id: number;
    part: Part;
    text: string;
}

// ASRS 문항 데이터 (18개 문항)
const ASRS_QUESTIONS: AsrsQuestion[] = [
    // Part A - 6문항 (1~6번)
    { id: 1, part: 'A', text: '세부적인 일을 할 때 부주의한 실수를 저지르는 일이 얼마나 자주 있습니까?' },
    { id: 2, part: 'A', text: '지루하거나 반복적인 일을 할 때 집중하기 어려운 일이 얼마나 자주 있습니까?' },
    { id: 3, part: 'A', text: '일을 끝까지 완수하는 데 어려움을 겪는 일이 얼마나 자주 있습니까?' },
    { id: 4, part: 'A', text: '일을 정리하거나 체계화하는 데 어려움이 얼마나 자주 있습니까?' },
    { id: 5, part: 'A', text: '약속이나 의무를 잊어버리는 일이 얼마나 자주 있습니까?' },
    { id: 6, part: 'A', text: '격렬한 활동이 필요한 일에 몰입하거나 집중하기 어려운 일이 얼마나 자주 있습니까?' },
    
    // Part B - 12문항 (7~18번)
    { id: 7, part: 'B', text: '과제나 일을 할 때 필요한 물건을 자주 잃어버리는 일이 있습니까?' },
    { id: 8, part: 'B', text: '외부 자극으로 인해 쉽게 산만해지는 일이 있습니까?' },
    { id: 9, part: 'B', text: '집이나 직장에서 무엇을 해야 하는지 기억하는 데 어려움이 있습니까?' },
    { id: 10, part: 'B', text: '앉아 있어야 할 때 몸을 움직이고 싶은 충동을 얼마나 자주 느낍니까?' },
    { id: 11, part: 'B', text: '한참 앉아 있으면 자리를 뜨고 싶은 충동이 얼마나 자주 듭니까?' },
    { id: 12, part: 'B', text: '과도하게 말을 많이 하는 편입니까?' },
    { id: 13, part: 'B', text: '다른 사람이 말하는 것을 끊고 대신 말하는 일이 얼마나 자주 있습니까?' },
    { id: 14, part: 'B', text: '순서를 기다리는 것이 얼마나 어렵습니까?' },
    { id: 15, part: 'B', text: '다른 사람의 일이나 활동에 끼어드는 경우가 얼마나 자주 있습니까?' },
    { id: 16, part: 'B', text: '하려던 일을 미루는 경우가 얼마나 자주 있습니까?' },
    { id: 17, part: 'B', text: '해야 할 일보다 즉흥적인 행동을 먼저 하는 일이 얼마나 자주 있습니까?' },
    { id: 18, part: 'B', text: '한 가지 일에 집중해야 할 상황에서도 다른 일을 먼저 시작하는 일이 얼마나 자주 있습니까?' },
];

// 응답 선택지 라벨
const SCORE_LABELS: Record<ScoreValue, string> = {
    0: '전혀 없다',
    1: '가끔 있다',
    2: '종종 있다',
    3: '자주 있다',
    4: '매우 자주 있다',
};

// 총점 구간별 결과 기준 (쉽게 수정 가능하도록 상수로 정의)
const SCORE_RANGES = [
    { min: 0, max: 20, label: '매우 낮은 수준' },
    { min: 21, max: 35, label: '낮은 수준' },
    { min: 36, max: 50, label: '중간 수준' },
    { min: 51, max: 65, label: '높음' },
    { min: 66, max: 72, label: '매우 높음' },
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

// 점수 결과 타입
interface ScoreResult {
    total: number; // 전체 총점 (18문항 합계) - 최종 결과 기준
}

function Asrs() {
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
        return ASRS_QUESTIONS.every(question => responses[question.id] !== null && responses[question.id] !== undefined);
    };

    /**
     * 점수 계산 함수
     * - Part A 6문항 + Part B 12문항 = 전체 18문항 총점
     */
    const calculateScores = (): ScoreResult => {
        let totalScore = 0;

        // 각 문항별 점수를 합산
        ASRS_QUESTIONS.forEach(question => {
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
            const resultSection = document.getElementById('asrs-result-section');
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

    // Part A 문항들 (1~6번)
    const partAQuestions = ASRS_QUESTIONS.filter(q => q.part === 'A');
    
    // Part B 문항들 (7~18번)
    const partBQuestions = ASRS_QUESTIONS.filter(q => q.part === 'B');

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                {/* 상단 헤더 영역 */}
                <div style={styles.header}>
                    <div style={styles.homeIcon} onClick={() => navigate('/main')}>
                        🏠
                    </div>
                    <div style={styles.headerContent}>
                        <h1 style={styles.title}>ASRS 설문조사</h1>
                        <p style={styles.subtitle}>성인 ADHD 자가보고 척도 (Adult ADHD Self-Report Scale)</p>
                    </div>
                </div>

                {/* 안내 문구 */}
                {!isSubmitted && (
                    <div style={styles.infoBox}>
                        <p style={styles.infoText}>
                            아래 18개의 문항에 대해 최근 6개월 동안의 행동을 기준으로 평가해주세요.
                        </p>
                        <p style={styles.infoText}>
                            각 문항에 대해 <strong>0점(전혀 없다)</strong>부터 <strong>4점(매우 자주 있다)</strong>까지 선택해주세요.
                        </p>
                    </div>
                )}

                {/* 설문 문항 영역 */}
                {!isSubmitted && (
                    <div style={styles.content}>
                        {/* Part A 카테고리 */}
                        <div style={styles.categorySection}>
                            <h2 style={styles.categoryTitle}>
                                <span style={styles.categoryBadge}>Part A</span>
                                <span style={styles.categoryDesc}>(6문항)</span>
                            </h2>
                            <div style={styles.questionsList}>
                                {partAQuestions.map((question) => (
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
                        </div>

                        {/* Part B 카테고리 */}
                        <div style={styles.categorySection}>
                            <h2 style={styles.categoryTitle}>
                                <span style={styles.categoryBadge}>Part B</span>
                                <span style={styles.categoryDesc}>(12문항)</span>
                            </h2>
                            <div style={styles.questionsList}>
                                {partBQuestions.map((question) => (
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
                                {isAllAnswered() ? '점수 계산하기' : `미응답 문항: ${18 - Object.keys(responses).filter(k => responses[Number(k)] !== null).length}개`}
                            </button>
                        </div>
                    </div>
                )}

                {/* 점수 결과 영역 - 전체 총점과 구간별 결과만 표시 */}
                {isSubmitted && scoreResult && (
                    <div id="asrs-result-section" style={styles.resultSection}>
                        <h2 style={styles.resultTitle}>평가 결과</h2>
                        
                        {/* 전체 총점 카드 */}
                        <div style={styles.resultCardMain}>
                            <div style={styles.resultCardHeader}>
                                <span style={styles.resultCardTitle}>전체 총점</span>
                                <span style={styles.resultCardSubtitle}>(Total Score)</span>
                            </div>
                            <div style={styles.resultCardScore}>{scoreResult.total}</div>
                            <div style={styles.resultCardMax}>/ 72점</div>
                            <div style={styles.resultCardDescription}>
                                18개 문항의 합계 (각 문항 최대 4점)
                            </div>
                        </div>

                        {/* 구간별 결과 */}
                        <div style={styles.rangeResultBox}>
                            <h3 style={styles.rangeResultTitle}>총점 구간별 결과</h3>
                            <div style={styles.rangeResultLabel}>
                                {getScoreRangeLabel(scoreResult.total)}
                            </div>
                            <div style={styles.rangeResultDescription}>
                                총점 {scoreResult.total}점은 "{getScoreRangeLabel(scoreResult.total)}" 범위에 해당합니다.
                            </div>
                        </div>

                        {/* 점수 해석 안내 */}
                        <div style={styles.interpretationBox}>
                            <h3 style={styles.interpretationTitle}>점수 해석 안내</h3>
                            <ul style={styles.interpretationList}>
                                <li>이 설문은 참고용이며, 정확한 진단은 전문의와 상담하시기 바랍니다.</li>
                                <li>총점 구간 기준: 0~20 (매우 낮은 수준), 21~35 (낮은 수준), 36~50 (중간 수준), 51~65 (높음), 66~72 (매우 높음)</li>
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
    categorySection: {
        marginBottom: '40px',
    },
    categoryTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    categoryBadge: {
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '18px',
    },
    categoryDesc: {
        fontSize: '16px',
        color: '#64748b',
        fontWeight: 'normal',
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

export default Asrs;

