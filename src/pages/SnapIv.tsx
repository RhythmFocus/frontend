import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// SNAP-IV 응답 점수 타입 정의 (0: 전혀 아니다 ~ 3: 매우 그렇다)
type ScoreValue = 0 | 1 | 2 | 3;

// SNAP-IV 문항 DSM 도메인 타입
type DsmDomain = 'inattention' | 'hyperactivity_impulsivity';

// SNAP-IV 문항 타입 정의
interface SnapIvQuestion {
    id: number;
    dsm_domain: DsmDomain;
    text: string;
}

// SNAP-IV 문항 데이터 (18개 문항)
const SNAP_IV_QUESTIONS: SnapIvQuestion[] = [
    // 부주의(inattention) 카테고리 - 1~9번
    { id: 1, dsm_domain: 'inattention', text: '종종 세부적인 것에 주의를 기울이지 못하거나 부주의한 실수를 한다.' },
    { id: 2, dsm_domain: 'inattention', text: '학교 과제나 작업을 지속적으로 집중하는 데 어려움이 있다.' },
    { id: 3, dsm_domain: 'inattention', text: '직접 이야기를 했을 때 듣지 않는 것처럼 보일 때가 있다.' },
    { id: 4, dsm_domain: 'inattention', text: '지시를 따르지 않아 과제나 일을 완성하지 못한다.' },
    { id: 5, dsm_domain: 'inattention', text: '과제나 활동을 조직하는 데 어려움이 있다.' },
    { id: 6, dsm_domain: 'inattention', text: '지속적인 정신적 노력이 필요한 일을 피하거나 싫어한다.' },
    { id: 7, dsm_domain: 'inattention', text: '과제나 활동에 필요한 물건을 자주 잃어버린다.' },
    { id: 8, dsm_domain: 'inattention', text: '외부 자극(소리, 움직임 등)에 쉽게 산만해진다.' },
    { id: 9, dsm_domain: 'inattention', text: '일상적인 활동을 자주 잊어버린다.' },
    
    // 과잉행동/충동성(hyperactivity_impulsivity) 카테고리 - 10~18번
    { id: 10, dsm_domain: 'hyperactivity_impulsivity', text: '손발을 가만히 두지 못하고 꼼지락거린다.' },
    { id: 11, dsm_domain: 'hyperactivity_impulsivity', text: '앉아 있어야 하는 상황에서 자리를 뜬다.' },
    { id: 12, dsm_domain: 'hyperactivity_impulsivity', text: '부적절한 상황에서도 과도하게 뛰어다니거나 기어오른다.' },
    { id: 13, dsm_domain: 'hyperactivity_impulsivity', text: '조용히 여가 활동을 하거나 놀지 못한다.' },
    { id: 14, dsm_domain: 'hyperactivity_impulsivity', text: '과도하게 말을 한다.' },
    { id: 15, dsm_domain: 'hyperactivity_impulsivity', text: '질문이 끝나기 전에 성급하게 대답한다.' },
    { id: 16, dsm_domain: 'hyperactivity_impulsivity', text: '자신의 차례를 기다리기 어려워한다.' },
    { id: 17, dsm_domain: 'hyperactivity_impulsivity', text: '다른 사람의 활동을 방해하거나 끼어든다.' },
    { id: 18, dsm_domain: 'hyperactivity_impulsivity', text: '타인의 말이나 행동을 방해하는 경우가 많다.' },
];

// 응답 선택지 라벨
const SCORE_LABELS: Record<ScoreValue, string> = {
    0: '전혀 아니다',
    1: '조금 그렇다',
    2: '상당히 그렇다',
    3: '매우 그렇다',
};

// 총점 구간별 결과 기준 (쉽게 수정 가능하도록 상수로 정의)
const SCORE_RANGES = [
    { min: 0, max: 18, label: '매우 낮은 수준' },
    { min: 19, max: 36, label: '낮은 수준' },
    { min: 37, max: 54, label: '중간 수준' },
    { min: 55, max: 72, label: '높음' },
    { min: 73, max: 90, label: '매우 높음' },
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
    inattention: number;              // 부주의 점수 (9문항 합계) - 계산용
    hyperactivity_impulsivity: number; // 과잉행동/충동성 점수 (9문항 합계) - 계산용
    total: number;                     // 전체 총점 (18문항 합계) - 최종 결과 기준
}

function SnapIv() {
    const navigate = useNavigate();
    
    // 각 문항별 응답 점수를 저장하는 state
    // key: 문항 ID, value: 선택한 점수 (0~3)
    const [responses, setResponses] = useState<Record<number, ScoreValue | null>>({});
    
    // 제출 완료 여부 (점수 결과 표시 여부)
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // 계산된 점수 결과
    const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

    /**
     * 문항별 응답 점수 변경 핸들러
     * @param questionId 문항 ID
     * @param score 선택한 점수 (0~3)
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
        return SNAP_IV_QUESTIONS.every(question => responses[question.id] !== null && responses[question.id] !== undefined);
    };

    /**
     * 점수 계산 함수
     * - 부주의(inattention) 카테고리 9문항 합계
     * - 과잉행동/충동성(hyperactivity_impulsivity) 카테고리 9문항 합계
     * - 전체 18문항 총점 (두 영역 점수 합)
     */
    const calculateScores = (): ScoreResult => {
        let inattentionScore = 0;
        let hyperactivityImpulsivityScore = 0;

        // 각 문항별 점수를 DSM 도메인별로 합산
        SNAP_IV_QUESTIONS.forEach(question => {
            const score = responses[question.id] ?? 0;
            
            if (question.dsm_domain === 'inattention') {
                inattentionScore += score;
            } else if (question.dsm_domain === 'hyperactivity_impulsivity') {
                hyperactivityImpulsivityScore += score;
            }
        });

        return {
            inattention: inattentionScore,
            hyperactivity_impulsivity: hyperactivityImpulsivityScore,
            total: inattentionScore + hyperactivityImpulsivityScore,
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
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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

    // 부주의 문항들 (1~9번)
    const inattentionQuestions = SNAP_IV_QUESTIONS.filter(q => q.dsm_domain === 'inattention');
    
    // 과잉행동/충동성 문항들 (10~18번)
    const hyperactivityQuestions = SNAP_IV_QUESTIONS.filter(q => q.dsm_domain === 'hyperactivity_impulsivity');

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                {/* 상단 헤더 영역 */}
                <div style={styles.header}>
                <div style={styles.homeIcon} onClick={() => navigate('/main')}>
                    🏠
                </div>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>SNAP-IV 설문조사</h1>
                    <p style={styles.subtitle}>주의력결핍 및 과잉행동/충동성 평가</p>
                </div>
            </div>

            {/* 안내 문구 */}
            {!isSubmitted && (
                <div style={styles.infoBox}>
                    <p style={styles.infoText}>
                        아래 18개의 문항에 대해 최근 6개월 동안의 행동을 기준으로 평가해주세요.
                    </p>
                    <p style={styles.infoText}>
                        각 문항에 대해 <strong>0점(전혀 아니다)</strong>부터 <strong>3점(매우 그렇다)</strong>까지 선택해주세요.
                    </p>
                </div>
            )}

            {/* 설문 문항 영역 */}
            {!isSubmitted && (
                <div style={styles.content}>
                    {/* 부주의 카테고리 */}
                    <div style={styles.categorySection}>
                        <h2 style={styles.categoryTitle}>
                            <span style={styles.categoryBadge}>부주의</span>
                            <span style={styles.categoryDesc}>(Inattention)</span>
                        </h2>
                        <div style={styles.questionsList}>
                            {inattentionQuestions.map((question) => (
                                <div key={question.id} style={styles.questionCard}>
                                    <div style={styles.questionHeader}>
                                        <span style={styles.questionNumber}>{question.id}.</span>
                                        <p style={styles.questionText}>{question.text}</p>
                                    </div>
                                    <div style={styles.scoreOptions}>
                                        {[0, 1, 2, 3].map((score) => {
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

                    {/* 과잉행동/충동성 카테고리 */}
                    <div style={styles.categorySection}>
                        <h2 style={styles.categoryTitle}>
                            <span style={styles.categoryBadge}>과잉행동/충동성</span>
                            <span style={styles.categoryDesc}>(Hyperactivity/Impulsivity)</span>
                        </h2>
                        <div style={styles.questionsList}>
                            {hyperactivityQuestions.map((question) => (
                                <div key={question.id} style={styles.questionCard}>
                                    <div style={styles.questionHeader}>
                                        <span style={styles.questionNumber}>{question.id}.</span>
                                        <p style={styles.questionText}>{question.text}</p>
                                    </div>
                                    <div style={styles.scoreOptions}>
                                        {[0, 1, 2, 3].map((score) => {
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
                <div style={styles.resultSection}>
                    <h2 style={styles.resultTitle}>평가 결과</h2>
                    
                    {/* 전체 총점 카드 */}
                    <div style={styles.resultCardMain}>
                        <div style={styles.resultCardHeader}>
                            <span style={styles.resultCardTitle}>전체 총점</span>
                            <span style={styles.resultCardSubtitle}>(Total Score)</span>
                        </div>
                        <div style={styles.resultCardScore}>{scoreResult.total}</div>
                        <div style={styles.resultCardMax}>/ 54점</div>
                        <div style={styles.resultCardDescription}>
                            18개 문항의 합계 (각 문항 최대 3점)
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
                            <li>총점 구간 기준: 0~18 (매우 낮은 수준), 19~36 (낮은 수준), 37~54 (중간 수준), 55~72 (높음), 73~90 (매우 높음)</li>
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
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        paddingLeft: '42px',
    },
    scoreOption: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: 'white',
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
        fontSize: '13px',
        color: '#64748b',
        textAlign: 'center',
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

export default SnapIv;
