import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { fetchWithAccess } from '../util/fetchUtil';
import { NBackResult } from '../types/game.types';

type Phase = 'intro' | 'practice' | 'practiceComplete' | 'main' | 'summary';
type Mode = '1-back' | '2-back' | '3-back';

interface SequenceSet {
    items: string[];
}

interface ModeConfig {
    practice: SequenceSet;
    main: SequenceSet;
}

interface FeedbackState {
    message: string;
    tone?: 'success' | 'error' | 'info';
}

const ITEM_DURATION = 3000; // 3초 간격

const MODE_DATA: Record<Mode, ModeConfig> = {
    '1-back': {
        practice: { items: ['5', '3', '3', '8', '2'] },
        main: { items: ['5', '1', '1', '4', '8', '8', '2', '5'] },
    },
    '2-back': {
        practice: { items: ['5', '3', '5', '1', '3', '1'] },
        main: { items: ['3', '7', '3', '8', '7', '2', '2', '8'] },
    },
    '3-back': {
        practice: { items: ['1', '4', '9', '1', '4', '9'] },
        main: { items: ['1', '4', '9', '1', '4', '9', '7', '9'] },
    },
};

const UI_TEXT = {
    appTitle: 'N-back Test',
    introTitle: '2. 방법',
    introSubtitle: 'N-Back 부터 시작해볼까요?',
    instructions: [
        '화면에 숫자가 하나씩 제시됩니다.',
        '현재 제시된 숫자가 N번째 전에 제시',
        '되었던 숫자와 같은지 확인합니다.',
        '일치할 때는 O 키(버튼)를,',
        '일치하지 않을 때는 - 키(버튼)를',
        '빠르게 누릅니다.',
    ],
    nSelectorTitle: 'N 값 선택',
};

export default function NBackPage() {
    const navigate = useNavigate();

    // State
    const [phase, setPhase] = useState<Phase>('intro');
    const [mode, setMode] = useState<Mode>('2-back'); // 기본값 2-back
    const [practiceIndex, setPracticeIndex] = useState(0);
    const [mainIndex, setMainIndex] = useState(0);

    const [stimulusStart, setStimulusStart] = useState(0);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [hasResponded, setHasResponded] = useState(false);

    const [stats, setStats] = useState({
        total: 0,
        correct: 0,
        timeouts: 0,
        rtSum: 0,
        rtCount: 0,
    });

    // Refs
    const timeoutRef = useRef<number | undefined>(undefined);
    const advanceRef = useRef<number | undefined>(undefined);
    const hasRespondedRef = useRef(false);

    // Derived Logic
    const modeConfig = MODE_DATA[mode];
    const backCount = parseInt(mode, 10) || 1;
    const activeSet = phase === 'practice' ? modeConfig.practice : phase === 'main' ? modeConfig.main : null;
    const activeIndex = phase === 'practice' ? practiceIndex : phase === 'main' ? mainIndex : 0;

    const currentItem = activeSet ? activeSet.items[activeIndex] : null;
    const previousItem = activeSet && activeIndex >= backCount ? activeSet.items[activeIndex - backCount] : null;
    const expectsMatch = activeSet && activeIndex >= backCount && currentItem === previousItem;

    const currentStage = activeIndex + 1; // 1부터 시작하는 스테이지 번호

    // Cleanup
    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
            clearTimeout(advanceRef.current);
        };
    }, []);

    // Game Loop
    useEffect(() => {
        if (!activeSet || !currentItem || (phase !== 'practice' && phase !== 'main')) return;

        setHasResponded(false);
        hasRespondedRef.current = false;
        setFeedback(null);
        setStimulusStart(performance.now());

        timeoutRef.current = window.setTimeout(() => {
            handleTimeout(expectsMatch);
        }, ITEM_DURATION);

        return () => clearTimeout(timeoutRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, practiceIndex, mainIndex, mode]);

    const handleTimeout = (expected: boolean | null) => {
        if (hasRespondedRef.current) return;
        hasRespondedRef.current = true;
        setHasResponded(true);

        if (phase === 'main') {
            // 본 검사: 응답 없음 처리 (매치인데 안눌렀으면 오답/타임아웃)
            const isMissed = expected === true;
            recordMainResult(!isMissed, ITEM_DURATION, isMissed);
        }

        if (expected) {
            setFeedback({ message: '놓쳤습니다!', tone: 'error' });
        }

        scheduleAdvance();
    };

    const scheduleAdvance = () => {
        advanceRef.current = window.setTimeout(() => {
            if (phase === 'practice') {
                if (practiceIndex < modeConfig.practice.items.length - 1) {
                    setPracticeIndex((p) => p + 1);
                } else {
                    setPhase('practiceComplete');
                }
            } else if (phase === 'main') {
                if (mainIndex < modeConfig.main.items.length - 1) {
                    setMainIndex((p) => p + 1);
                } else {
                    setPhase('summary');
                }
            }
        }, 500);
    };

    const handleResponse = (userSaidMatch: boolean) => {
        if (hasRespondedRef.current) return;

        // 워밍업 단계 클릭 방지
        if (activeIndex < backCount) return;

        clearTimeout(timeoutRef.current);
        hasRespondedRef.current = true;
        setHasResponded(true);

        const isCorrect = userSaidMatch === expectsMatch;
        const rt = performance.now() - stimulusStart;

        if (phase === 'main') {
            recordMainResult(isCorrect, rt, false);
        }

        setFeedback({
            message: isCorrect ? 'O' : 'X',
            tone: isCorrect ? 'success' : 'error',
        });

        scheduleAdvance();
    };

    const recordMainResult = (isCorrect: boolean, rt: number, isTimeout: boolean) => {
        setStats(prev => ({
            total: prev.total + 1,
            correct: prev.correct + (isCorrect ? 1 : 0),
            timeouts: prev.timeouts + (isTimeout ? 1 : 0),
            rtSum: prev.rtSum + rt,
            rtCount: prev.rtCount + 1
        }));
    };

    const handleSubmitGameResult = async () => {
        const userId = localStorage.getItem("userId") || "anonymous";
        const timestamp = new Date().toISOString();

        const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
        const avgRT = stats.rtCount ? Math.round(stats.rtSum / stats.rtCount) : 0;

        const nBackResult: NBackResult = {
            gameType: 'N_BACK',
            userId: userId,
            timestamp: timestamp,
            mode: mode,
            accuracy: accuracy,
            timeouts: stats.timeouts,
            avgRT: avgRT,
        };

        try {
            const response = await fetchWithAccess(`/api/game/nback/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nBackResult),
            });
            const resultData = await response.json();
            navigate('/diagnosis/result', { state: { gameType: 'N_BACK', result: resultData } });
        } catch (error) {
            console.error("Failed to submit:", error);
            alert("결과 제출 실패");
        }
    };

    const renderLeftPanel = () => {
        if (phase === 'intro') {
            return (
                <div style={styles.gameContentWrapper}>
                    <div style={styles.tagBadge}>{mode}</div>
                    <div style={styles.visualArea}>
                        <div style={styles.stageLabel}>3 Stage</div>
                        <div style={styles.bigNumber}>5</div>
                        <div style={styles.tooltipBox}>
                            {backCount} Stage 전과 비교하여 같으면 O 누르기!
                        </div>
                    </div>
                    <div style={styles.buttonGroup}>
                        <div style={{...styles.gameBtn, ...styles.btnMatch}}>O</div>
                        <div style={{...styles.gameBtn, ...styles.btnNoMatch}}>-</div>
                    </div>
                </div>
            );
        }

        if (phase === 'summary' || phase === 'practiceComplete') {
            return (
                <div style={styles.gameContentWrapper}>
                    <div style={styles.bigNumber}>
                        {phase === 'summary' ? 'Finish' : 'Done'}
                    </div>
                    <p style={{fontSize:'20px', color: '#666', marginTop:'20px'}}>
                        {phase === 'summary' ? '검사가 완료되었습니다.' : '연습이 끝났습니다.'}
                    </p>
                </div>
            );
        }

        return (
            <div style={styles.gameContentWrapper}>
                <div style={styles.tagBadge}>{mode}</div>

                <div style={styles.visualArea}>
                    <div style={styles.stageLabel}>{currentStage} Stage</div>
                    <div style={styles.bigNumber}>{currentItem}</div>
                </div>

                {feedback && (
                    <div style={{
                        ...styles.feedbackOverlay,
                        color: feedback.tone === 'error' ? '#e52e71' : '#4caf50'
                    }}>
                        {feedback.message}
                    </div>
                )}

                <div style={styles.buttonGroup}>
                    <button
                        style={{...styles.gameBtn, ...styles.btnMatch}}
                        onClick={() => handleResponse(true)}
                        disabled={activeIndex < backCount}
                    >
                        O
                    </button>
                    <button
                        style={{...styles.gameBtn, ...styles.btnNoMatch}}
                        onClick={() => handleResponse(false)}
                        disabled={activeIndex < backCount}
                    >
                        -
                    </button>
                </div>
                {activeIndex < backCount && (
                    <div style={styles.warmupText}>초기 항목 기억 단계</div>
                )}
            </div>
        );
    };

    const renderRightPanel = () => {
        // Intro & Selection
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

                    <div style={styles.nSelectorContainer}>
                        {(['1-back', '2-back', '3-back'] as Mode[]).map(m => (
                            <button
                                key={m}
                                style={{
                                    ...styles.nBtn,
                                    backgroundColor: mode === m ? 'white' : 'transparent',
                                    color: mode === m ? '#7b80c2' : 'white',
                                    fontWeight: mode === m ? 'bold' : 'normal'
                                }}
                                onClick={() => setMode(m)}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <div style={styles.actionRow}>
                        <button style={styles.nextButton} onClick={() => {
                            setPhase('practice');
                            setPracticeIndex(0);
                        }}>
                            연습 시작 &gt;
                        </button>
                    </div>
                </div>
            );
        }

        // Practice Running
        if (phase === 'practice') {
            return (
                <div style={styles.sidebarContent}>
                    <h2 style={styles.sidebarTitle}>연습 모드</h2>
                    <div style={styles.divider}></div>
                    <p style={styles.sidebarDesc}>
                        규칙을 익히는 단계입니다.<br/>
                        현재 숫자가 {backCount}번째 전 숫자와<br/>
                        같으면 O, 다르면 -를 누르세요.
                    </p>
                    <div style={{flex:1}}></div>
                    <button style={{...styles.nextButton, borderColor: '#ffffff80'}} onClick={() => setPhase('intro')}>
                        취소
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
                        준비가 되면 시작 버튼을 누르세요.
                    </p>
                    <div style={{flex:1}}></div>
                    <button style={styles.nextButton} onClick={() => {
                        setPhase('main');
                        setMainIndex(0);
                        setStats({total:0, correct:0, timeouts:0, rtSum:0, rtCount:0});
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
                        집중해서 진행해주세요.<br/><br/>
                        남은 문항: {modeConfig.main.items.length - mainIndex}
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
                        모든 검사가 끝났습니다.<br/>
                        결과를 제출합니다.
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
                {/* Left Side: Game Visuals */}
                <div style={styles.leftPanel}>
                    {renderLeftPanel()}
                </div>

                {/* Right Side: Controls */}
                <div style={styles.rightPanel}>
                    {renderRightPanel()}
                </div>
            </div>
        </div>
    );
}

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

    // Card Layout
    mainCard: {
        display: 'flex',
        flexDirection: 'row', // 가로 분할
        width: '90%',
        maxWidth: '1000px',
        height: '600px', // 고정 높이
        backgroundColor: 'white',
        borderRadius: '30px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        margin: '0 20px 40px 20px',
    },
    leftPanel: {
        flex: 1.2, // 왼쪽이 조금 더 넓음
        backgroundColor: '#ffffff',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightPanel: {
        flex: 0.8,
        backgroundColor: '#7b80c2', // 디자인의 보라색
        padding: '50px 40px',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
        boxSizing: 'border-box',
    },

    // Left Panel Inner
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
        backgroundColor: '#dae1e7', // 연한 회색 뱃지
        color: '#333',
        padding: '8px 20px',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
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
    bigNumber: {
        fontSize: '120px',
        fontWeight: '500',
        color: '#000',
        lineHeight: 1,
    },
    tooltipBox: {
        marginTop: '20px',
        backgroundColor: '#d6f5f3', // 말풍선 색상
        color: '#333',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '14px',
        position: 'relative',
        fontWeight: 600,
    },
    buttonGroup: {
        display: 'flex',
        gap: '40px',
        marginTop: '20px',
    },
    gameBtn: {
        width: '120px',
        height: '80px',
        borderRadius: '15px',
        fontSize: '40px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 6px 0 rgba(0,0,0,0.1)', // 입체감
        transition: 'transform 0.1s',
    },
    btnMatch: {
        backgroundColor: '#6c72e2', // 보라/파랑 (O)
        color: 'white',
    },
    btnNoMatch: {
        backgroundColor: '#8d92a8', // 회색 (-)
        color: 'white',
    },
    feedbackOverlay: {
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '80px',
        fontWeight: 'bold',
        pointerEvents: 'none',
        textShadow: '0 2px 10px rgba(0,0,0,0.2)',
    },
    warmupText: {
        marginTop: '20px',
        color: '#999',
        fontSize: '14px',
    },

    // Right Panel Inner
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
    nSelectorContainer: {
        display: 'flex',
        gap: '10px',
        marginTop: 'auto',
        marginBottom: '20px',
    },
    nBtn: {
        padding: '8px 16px',
        borderRadius: '20px',
        border: '1px solid white',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s',
    },
    actionRow: {
        display: 'flex',
        justifyContent: 'flex-start',
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
        transition: 'background 0.2s',
    },
};