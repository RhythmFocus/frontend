import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { fetchWithAccess } from '../util/fetchUtil';
import { StroopResult } from '../types/game.types';

const styles: Record<string, React.CSSProperties> = {
    pageBackground: {
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#d6f5f3', // 민트색 배경
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '"Pretendard", "Malgun Gothic", sans-serif',
    },

    // Layout
    mainCard: {
        display: 'flex',
        flexDirection: 'row',
        width: '90%',
        maxWidth: '1000px',
        height: '600px',
        backgroundColor: 'white',
        borderRadius: '30px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        margin: '0 20px 40px 20px',
    },
    leftPanel: {
        flex: 1.2,
        backgroundColor: '#ffffff',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightPanel: {
        flex: 0.8,
        backgroundColor: '#7b80c2', // N-Back의 보라색
        padding: '50px 40px',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
        boxSizing: 'border-box',
    },

    // Left Panel Elements
    gameContentWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    tagBadge: {
        position: 'absolute',
        top: '30px',
        left: '30px',
        backgroundColor: '#dae1e7',
        color: '#333',
        padding: '8px 20px',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '16px',
    },
    visualArea: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    stageLabel: {
        fontSize: '28px',
        fontWeight: 600,
        marginBottom: '10px',
        color: '#000',
    },
    bigWord: {
        fontSize: '100px',
        fontWeight: '800',
        lineHeight: 1.2,
    },
    tooltipBox: {
        marginTop: '20px',
        backgroundColor: '#d6f5f3',
        color: '#333',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '14px',
    },

    // Stroop Buttons Grid
    colorGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', // 3열 그리드
        gap: '15px',
        marginTop: '10px',
    },
    colorBtn: {
        width: '100px',
        height: '50px',
        borderRadius: '15px',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
        transition: 'all 0.1s',
    },
    colorBtnMock: { // 클릭 불가능한 데코레이션용
        width: '100px',
        height: '50px',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontWeight: 'bold',
        opacity: 0.8,
    },

    feedbackOverlay: {
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '100px',
        fontWeight: '900',
        pointerEvents: 'none',
        textShadow: '0 0 20px rgba(255,255,255,0.8)',
        zIndex: 10,
    },

    // Right Panel Elements
    sidebarTitle: {
        fontSize: '28px',
        fontWeight: '500',
        margin: 0,
        marginBottom: '10px',
    },
    divider: {
        width: '50px',
        height: '2px',
        backgroundColor: '#ffffff',
        margin: '10px 0 20px 0',
    },
    sidebarSubtitle: {
        fontSize: '18px',
        marginBottom: '30px',
        fontWeight: 300,
        opacity: 0.9,
    },
    sidebarDesc: {
        fontSize: '18px',
        lineHeight: 1.6,
    },
    instructionList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        fontSize: '15px',
        lineHeight: 1.5,
        opacity: 0.95,
        marginBottom: '30px',
    },
    instructionItem: {
        paddingLeft: '5px',
    },
    nextButton: {
        padding: '12px 24px',
        borderRadius: '25px',
        border: '1px solid white',
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        alignSelf: 'flex-start',
    },
};

type Phase = 'intro' | 'practice' | 'practiceComplete' | 'main' | 'summary';

const QUESTION_TIME_LIMIT = 3000; // 3초 제한

// 색상 옵션 (버튼용)
const COLOR_OPTIONS = [
    { id: 'red', label: '빨강', css: '#e53935' },
    { id: 'blue', label: '파랑', css: '#1e88e5' },
    { id: 'green', label: '초록', css: '#43a047' },
    { id: 'yellow', label: '노랑', css: '#fdd835' },
    { id: 'purple', label: '보라', css: '#8e24aa' },
    { id: 'orange', label: '주황', css: '#fb8c00' },
];

interface Stimulus {
    text: string;
    colorId: string;
}

// 연습 문제 (3개)
const PRACTICE_STIMULI: Stimulus[] = [
    { text: '파랑', colorId: 'red' },    // 글자는 파랑, 색은 빨강 -> 정답: 빨강
    { text: '초록', colorId: 'blue' },   // 정답: 파랑
    { text: '빨강', colorId: 'green' },  // 정답: 초록
];

// 본 검사 문제 (예시 10개)
const MAIN_STIMULI: Stimulus[] = [
    { text: '노랑', colorId: 'red' },
    { text: '보라', colorId: 'blue' },
    { text: '파랑', colorId: 'green' },
    { text: '초록', colorId: 'yellow' },
    { text: '빨강', colorId: 'purple' },
    { text: '주황', colorId: 'blue' },
    { text: '파랑', colorId: 'red' },
    { text: '보라', colorId: 'green' },
    { text: '초록', colorId: 'orange' },
    { text: '빨강', colorId: 'blue' },
];

interface ResponseLog {
    isCorrect: boolean;
    reactionTime: number;
}

const UI_TEXT = {
    appTitle: 'Stroop Test',
    introTitle: '2. 방법',
    introSubtitle: '글자색 판단하기',
    instructions: [
        '화면에 단어가 나타납니다.',
        '단어의 "의미"가 아니라 "글자색"을 판단하세요.',
        '예: 파란색으로 쓰인 "빨강" 글자가 나오면,',
        '정답은 "파랑"입니다.',
        '화면 아래의 색상 버튼을 빠르게 누르세요.',
    ],
};

export default function StroopPage() {
    const navigate = useNavigate();

    // State
    const [phase, setPhase] = useState<Phase>('intro');
    const [practiceIndex, setPracticeIndex] = useState(0);
    const [mainIndex, setMainIndex] = useState(0);

    const [responses, setResponses] = useState<ResponseLog[]>([]);
    const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
    const [stimulusStart, setStimulusStart] = useState<number>(0);
    const [hasResponded, setHasResponded] = useState(false);

    // Refs
    const timeoutRef = useRef<number | undefined>(undefined);
    const advanceRef = useRef<number | undefined>(undefined);
    const hasRespondedRef = useRef(false);

    // Derived Logic
    const currentList = phase === 'practice' ? PRACTICE_STIMULI : MAIN_STIMULI;
    const currentIndex = phase === 'practice' ? practiceIndex : mainIndex;
    const currentStimulus = (phase === 'practice' || phase === 'main') ? currentList[currentIndex] : null;
    const currentStage = currentIndex + 1;

    // Cleanup
    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
            clearTimeout(advanceRef.current);
        };
    }, []);

    // Game Loop
    useEffect(() => {
        if (!currentStimulus) return;

        setHasResponded(false);
        hasRespondedRef.current = false;
        setFeedback(null);
        setStimulusStart(performance.now());

        // Time Limit
        timeoutRef.current = window.setTimeout(() => {
            handleTimeout();
        }, QUESTION_TIME_LIMIT);

        return () => clearTimeout(timeoutRef.current);
    }, [phase, practiceIndex, mainIndex]);

    const handleTimeout = () => {
        if (hasRespondedRef.current) return;
        hasRespondedRef.current = true;
        setHasResponded(true);

        if (phase === 'main') {
            // 타임아웃은 오답 처리 + 최대 시간 기록
            setResponses(prev => [...prev, { isCorrect: false, reactionTime: QUESTION_TIME_LIMIT }]);
        }

        setFeedback({ message: '시간 초과!', tone: 'error' });
        scheduleAdvance();
    };

    const handleResponse = (selectedColorId: string) => {
        if (hasRespondedRef.current || !currentStimulus) return;

        clearTimeout(timeoutRef.current);
        hasRespondedRef.current = true;
        setHasResponded(true);

        const reactionTime = performance.now() - stimulusStart;
        const isCorrect = selectedColorId === currentStimulus.colorId;

        if (phase === 'main') {
            setResponses(prev => [...prev, { isCorrect, reactionTime }]);
        }

        setFeedback({
            message: isCorrect ? 'O' : 'X',
            tone: isCorrect ? 'success' : 'error',
        });

        scheduleAdvance();
    };

    const scheduleAdvance = () => {
        advanceRef.current = window.setTimeout(() => {
            if (phase === 'practice') {
                if (practiceIndex < PRACTICE_STIMULI.length - 1) {
                    setPracticeIndex(prev => prev + 1);
                } else {
                    setPhase('practiceComplete');
                }
            } else if (phase === 'main') {
                if (mainIndex < MAIN_STIMULI.length - 1) {
                    setMainIndex(prev => prev + 1);
                } else {
                    setPhase('summary');
                }
            }
        }, 500); // 0.5초 딜레이
    };

    const handleSubmitGameResult = async () => {
        const userId = localStorage.getItem("userId") || "anonymous";
        const timestamp = new Date().toISOString();

        const correctCount = responses.filter(r => r.isCorrect).length;
        const accuracy = responses.length > 0 ? Math.round((correctCount / responses.length) * 100) : 0;
        const avgRT = responses.length > 0
            ? Math.round(responses.reduce((acc, cur) => acc + cur.reactionTime, 0) / responses.length)
            : 0;

        const stroopResult: StroopResult = {
            gameType: 'STROOP',
            userId: userId,
            timestamp: timestamp,
            accuracy: accuracy,
            avgRT: avgRT,
        };

        try {
            const response = await fetchWithAccess(`/api/game/stroop/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stroopResult),
            });
            const resultData = await response.json();
            navigate('/diagnosis/result', { state: { gameType: 'STROOP', result: resultData } });
        } catch (error) {
            console.error("Failed to submit:", error);
            alert("결과 제출 실패");
        }
    };

    // 좌측: 게임 화면 (흰색 배경)
    const renderLeftPanel = () => {
        if (phase === 'intro') {
            return (
                <div style={styles.gameContentWrapper}>
                    <div style={styles.tagBadge}>예시</div>
                    <div style={styles.visualArea}>
                        <div style={styles.stageLabel}>Example</div>
                        {/* 예시: 글자는 '빨강'인데 색은 파란색 */}
                        <div style={{...styles.bigWord, color: '#1e88e5'}}>빨강</div>
                        <div style={styles.tooltipBox}>
                            글자색인 <strong>'파랑'</strong> 버튼을 눌러야 정답!
                        </div>
                    </div>
                    {/* 장식용 버튼들 */}
                    <div style={styles.colorGrid}>
                        {COLOR_OPTIONS.slice(0,3).map(opt => (
                            <div key={opt.id} style={{...styles.colorBtnMock, backgroundColor: opt.css}}>{opt.label}</div>
                        ))}
                    </div>
                </div>
            );
        }

        if (phase === 'summary' || phase === 'practiceComplete') {
            return (
                <div style={styles.gameContentWrapper}>
                    <div style={{...styles.bigWord, color: '#333', fontSize: '80px'}}>
                        {phase === 'summary' ? 'Finish' : 'Done'}
                    </div>
                    <p style={{fontSize:'20px', color: '#666', marginTop:'20px'}}>
                        {phase === 'summary' ? '검사가 완료되었습니다.' : '연습이 끝났습니다.'}
                    </p>
                </div>
            );
        }

        // 실제 게임 화면
        if (!currentStimulus) return null;

        // 현재 단어의 표시 색상 (CSS)
        const displayColorCss = COLOR_OPTIONS.find(c => c.id === currentStimulus.colorId)?.css || '#000';

        return (
            <div style={styles.gameContentWrapper}>
                <div style={styles.tagBadge}>
                    {phase === 'practice' ? '연습' : '본 검사'}
                </div>

                <div style={styles.visualArea}>
                    <div style={styles.stageLabel}>
                        {phase === 'practice' ? `Practice ${currentStage}` : `Question ${currentStage}`}
                    </div>
                    <div style={{...styles.bigWord, color: displayColorCss}}>
                        {currentStimulus.text}
                    </div>
                </div>

                {/* 정답/오답 오버레이 */}
                {feedback && (
                    <div style={{
                        ...styles.feedbackOverlay,
                        color: feedback.tone === 'error' ? '#e52e71' : '#4caf50'
                    }}>
                        {feedback.message}
                    </div>
                )}

                {/* 색상 선택 버튼 그리드 */}
                <div style={styles.colorGrid}>
                    {COLOR_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            style={{
                                ...styles.colorBtn,
                                backgroundColor: option.css,
                                opacity: hasResponded ? 0.5 : 1,
                                transform: hasResponded ? 'scale(0.95)' : 'scale(1)',
                            }}
                            onClick={() => handleResponse(option.id)}
                            disabled={hasResponded}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // 우측: 설명 및 컨트롤 (보라색 배경)
    const renderRightPanel = () => {
        // Intro
        if (phase === 'intro') {
            return (
                <div style={styles.sidebarContent}>
                    <h2 style={styles.sidebarTitle}>{UI_TEXT.introTitle}</h2>
                    <div style={styles.divider}></div>
                    <p style={styles.sidebarSubtitle}>{UI_TEXT.introSubtitle}</p>

                    <div style={styles.instructionList}>
                        {UI_TEXT.instructions.map((text, i) => (
                            <div key={i} style={styles.instructionItem}>
                                {i+1}. {text}
                            </div>
                        ))}
                    </div>

                    <div style={{flex:1}}></div>

                    <button style={styles.nextButton} onClick={() => {
                        setPhase('practice');
                        setPracticeIndex(0);
                    }}>
                        연습 시작 &gt;
                    </button>
                </div>
            );
        }

        // Practice
        if (phase === 'practice') {
            return (
                <div style={styles.sidebarContent}>
                    <h2 style={styles.sidebarTitle}>연습 중</h2>
                    <div style={styles.divider}></div>
                    <p style={styles.sidebarDesc}>
                        글자의 의미에 속지 말고<br/>
                        <strong>글자색</strong>을 선택하세요.
                    </p>
                    <div style={{flex:1}}></div>
                    <button style={{...styles.nextButton, borderColor: '#ffffff80'}} onClick={() => setPhase('intro')}>
                        그만하기
                    </button>
                </div>
            );
        }

        // Practice Complete
        if (phase === 'practiceComplete') {
            return (
                <div style={styles.sidebarContent}>
                    <h2 style={styles.sidebarTitle}>연습 완료</h2>
                    <div style={styles.divider}></div>
                    <p style={styles.sidebarDesc}>
                        이제 본 검사를 시작합니다.<br/>
                        총 {MAIN_STIMULI.length}문항입니다.
                    </p>
                    <div style={{flex:1}}></div>
                    <button style={styles.nextButton} onClick={() => {
                        setPhase('main');
                        setMainIndex(0);
                        setResponses([]);
                    }}>
                        본 검사 시작 &gt;
                    </button>
                </div>
            );
        }

        // Main Game
        if (phase === 'main') {
            return (
                <div style={styles.sidebarContent}>
                    <h2 style={styles.sidebarTitle}>본 검사</h2>
                    <div style={styles.divider}></div>
                    <p style={styles.sidebarDesc}>
                        빠르고 정확하게 응답하세요.<br/><br/>
                        진행: {currentStage} / {MAIN_STIMULI.length}
                    </p>
                </div>
            );
        }

        // Summary
        if (phase === 'summary') {
            return (
                <div style={styles.sidebarContent}>
                    <h2 style={styles.sidebarTitle}>검사 완료</h2>
                    <div style={styles.divider}></div>
                    <p style={styles.sidebarDesc}>
                        수고하셨습니다.<br/>
                        결과를 확인하러 가볼까요?
                    </p>
                    <div style={{flex:1}}></div>
                    <button style={styles.nextButton} onClick={handleSubmitGameResult}>
                        결과 보기 &gt;
                    </button>
                </div>
            );
        }
    };

    return (
        <div style={styles.pageBackground}>
            <PageHeader
                title={UI_TEXT.appTitle}
                backPath="/diagnosis"
            />

            <div style={styles.mainCard}>
                {/* Left Panel */}
                <div style={styles.leftPanel}>
                    {renderLeftPanel()}
                </div>

                {/* Right Panel */}
                <div style={styles.rightPanel}>
                    {renderRightPanel()}
                </div>
            </div>
        </div>
    );
}