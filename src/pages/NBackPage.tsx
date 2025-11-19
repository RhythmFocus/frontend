import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const UI_TEXT = {
  appTitle: '인지 검사 ― N-back',
  title: 'N-back 테스트',
  shortDescription: '주어진 항목(글자/숫자/위치)이 N개 전의 항목과 같으면 "일치"로 응답하세요.',
  instructionsHeader: '사용 방법',
  instructionsList: [
    '먼저 N값(예: 1-back, 2-back, 3-back)을 선택하세요.',
    '항목이 하나씩 화면에 나타납니다. 현재 항목이 N칸 전 항목과 같으면 "일치" 버튼을 누르세요.',
    "같지 않으면 아무 것도 누르지 않습니다(또는 '비일치' 버튼을 누르세요).",
    '응답은 정확도와 반응시간으로 평가됩니다.',
  ],
  practiceNote: '연습 세트를 통해 규칙을 익히세요.',
  matchBtn: '일치',
  noMatchBtn: '비일치',
  chooseNLabel: 'N 값 선택',
  nOptions: ['1-back', '2-back', '3-back'] as Mode[],
  prompt: '현재 항목을 확인하세요. N-back 규칙에 따라 응답하세요.',
  correctMsg: '정답',
  wrongMsg: '오답',
  lateMsg: '응답이 늦었습니다',
  summaryTitle: 'N-back 검사 결과',
  summaryText: '정확도: {accuracy}% | 타임아웃: {timeouts}회 | 평균 반응시간: {avgRT} ms',
  practiceBtn: '연습 시작',
  beginMainBtn: '본 검사 시작',
  retryBtn: '다시하기',
  finishBtn: '완료',
  backBtn: '뒤로',
  cancelBtn: '취소',
  ariaItem: '현재 항목',
  ariaMatchBtn: '일치 버튼',
};

const ITEM_DURATION = 4000;

const MODE_DATA: Record<Mode, ModeConfig> = {
  '1-back': {
    practice: {
      items: ['A', 'B', 'B', 'C', 'D'],
    },
    main: {
      items: ['A', 'B', 'B', 'C', 'D', 'D', 'A', 'A'],
    },
  },
  '2-back': {
    practice: {
      items: ['C', 'A', 'C', 'B', 'A', 'B'],
    },
    main: {
      items: ['3', '7', '3', '8', '7', '2', '2', '8'],
    },
  },
  '3-back': {
    practice: {
      items: ['1', '4', '9', '1', '4', '9'],
    },
    main: {
      items: ['1', '4', '9', '1', '4', '9', '7', '9'],
    },
  },
};

const initialStats = {
  total: 0,
  correct: 0,
  timeouts: 0,
  rtSum: 0,
  rtCount: 0,
};

export default function NBackPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [mode, setMode] = useState<Mode>('1-back');
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [mainIndex, setMainIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(ITEM_DURATION);
  const [stimulusStart, setStimulusStart] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [stats, setStats] = useState(initialStats);

  const tickRef = useRef<number>();
  const timeoutRef = useRef<number>();
  const advanceRef = useRef<number>();
  const hasRespondedRef = useRef(false);

  const modeConfig = MODE_DATA[mode];
  const backCount = parseInt(mode, 10) || 1;
  const practiceSet = modeConfig.practice;
  const mainSet = modeConfig.main;

  const isPracticeActive = phase === 'practice' && practiceIndex < practiceSet.items.length;
  const isMainActive = phase === 'main' && mainIndex < mainSet.items.length;

  const activeSet = phase === 'practice' ? practiceSet : phase === 'main' ? mainSet : null;
  const activeIndex = phase === 'practice' ? practiceIndex : phase === 'main' ? mainIndex : 0;
  const currentItem = activeSet ? activeSet.items[activeIndex] : null;
  const previousItem =
    activeSet && activeIndex >= backCount ? activeSet.items[activeIndex - backCount] : null;
  const expectsMatch =
    activeSet && activeIndex >= backCount && currentItem === previousItem;
  const isWarmupPhase =
    (phase === 'practice' || phase === 'main') && activeIndex < backCount;

  useEffect(() => {
    return () => {
      clearInterval(tickRef.current);
      clearTimeout(timeoutRef.current);
      clearTimeout(advanceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeSet || currentItem == null || !(isPracticeActive || isMainActive)) {
      return;
    }

    setHasResponded(false);
    hasRespondedRef.current = false;
    setFeedback(null);
    setStimulusStart(performance.now());
    setTimeRemaining(ITEM_DURATION);

    tickRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 100, 0));
    }, 100);

    timeoutRef.current = window.setTimeout(() => {
      handleTimeout(isWarmupPhase ? false : expectsMatch, isWarmupPhase);
    }, ITEM_DURATION);

    return () => {
      clearInterval(tickRef.current);
      clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, practiceIndex, mainIndex, mode]);

  const handleTimeout = (expectedMatch: boolean, warmup: boolean) => {
    if (hasRespondedRef.current) return;
    hasRespondedRef.current = true;
    setHasResponded(true);

    if (warmup) {
      setFeedback({
        message: '초기 항목을 관찰하는 단계입니다. 이후부터 응답하세요.',
        tone: 'info',
      });
      scheduleAdvance();
      return;
    }

    if (expectedMatch) {
      setFeedback({ message: UI_TEXT.lateMsg, tone: 'error' });
      if (phase === 'main') {
        recordMainResult(false, ITEM_DURATION, true);
      }
    } else {
      if (phase === 'practice') {
        setFeedback({ message: UI_TEXT.correctMsg, tone: 'success' });
      }
      if (phase === 'main') {
        recordMainResult(true);
      }
    }
    scheduleAdvance();
  };

  const recordMainResult = (isCorrect: boolean, reactionTime?: number, timedOut?: boolean) => {
    setStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      timeouts: prev.timeouts + (timedOut ? 1 : 0),
      rtSum: prev.rtSum + (reactionTime ?? 0),
      rtCount: prev.rtCount + (reactionTime ? 1 : 0),
    }));
  };

  const scheduleAdvance = () => {
    clearTimeout(advanceRef.current);
    advanceRef.current = window.setTimeout(() => {
      if (phase === 'practice') {
        if (practiceIndex < practiceSet.items.length - 1) {
          setPracticeIndex((prev) => prev + 1);
        } else {
          setPhase('practiceComplete');
        }
      } else if (phase === 'main') {
        if (mainIndex < mainSet.items.length - 1) {
          setMainIndex((prev) => prev + 1);
        } else {
          setPhase('summary');
        }
      }
    }, 700);
  };

  const handleResponse = (type: 'match' | 'noMatch') => {
    if (!activeSet || currentItem == null || hasRespondedRef.current) return;

    if (isWarmupPhase) {
      setFeedback({
        message: '아직 비교할 항목이 부족합니다. 다음 항목을 기다려주세요.',
        tone: 'info',
      });
      return;
    }

    clearTimeout(timeoutRef.current);
    hasRespondedRef.current = true;
    setHasResponded(true);

    const userSaysMatch = type === 'match';
    const isCorrect = userSaysMatch === expectsMatch;
    const reactionTime = performance.now() - stimulusStart;

    if (phase === 'practice') {
      setFeedback({
        message: isCorrect ? UI_TEXT.correctMsg : UI_TEXT.wrongMsg,
        tone: isCorrect ? 'success' : 'error',
      });
    } else if (phase === 'main') {
      recordMainResult(isCorrect, reactionTime, false);
      setFeedback({
        message: isCorrect ? UI_TEXT.correctMsg : UI_TEXT.wrongMsg,
        tone: isCorrect ? 'success' : 'error',
      });
    }

    scheduleAdvance();
  };

  const handleStartPractice = () => {
    setPhase('practice');
    setPracticeIndex(0);
    setMainIndex(0);
    setStats(initialStats);
  };

  const handleBeginMain = () => {
    setPhase('main');
    setMainIndex(0);
    setStats(initialStats);
  };

  const handleRetry = () => {
    setPhase('intro');
    setPracticeIndex(0);
    setMainIndex(0);
    setStats(initialStats);
    setFeedback(null);
  };

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  const avgRT = stats.rtCount ? Math.round(stats.rtSum / stats.rtCount) : 0;

  const renderActiveStage = () => {
    if (!activeSet || currentItem == null) return null;

    return (
      <div>
        <div style={styles.flowHeader}>
          <span style={styles.badge}>
            {phase === 'practice' ? '연습' : '본 검사'}{' '}
            {phase === 'practice' ? practiceIndex + 1 : mainIndex + 1}/{activeSet.items.length}
          </span>
          <span>{UI_TEXT.prompt}</span>
          <span style={styles.timer}>{(timeRemaining / 1000).toFixed(1)}s</span>
        </div>

        <div
          aria-label={UI_TEXT.ariaItem}
          style={styles.stimulus}
        >
          {currentItem}
        </div>

        {isWarmupPhase ? (
          <div style={styles.warmupNote}>
            선택한 N 값({mode})에 맞는 비교 기준을 확보하는 중입니다. 버튼은 다음 항목부터 활성화됩니다.
          </div>
        ) : (
          <div style={styles.buttonsRow}>
            <button
              aria-label={UI_TEXT.ariaMatchBtn}
              style={{ ...styles.actionButton, background: '#4caf50' }}
              onClick={() => handleResponse('match')}
              disabled={hasResponded}
            >
              {UI_TEXT.matchBtn}
            </button>
            <button
              style={{ ...styles.actionButton, background: '#f97316' }}
              onClick={() => handleResponse('noMatch')}
              disabled={hasResponded}
            >
              {UI_TEXT.noMatchBtn}
            </button>
          </div>
        )}

        {feedback && (
          <div
            style={{
              ...styles.feedback,
              color: feedback.tone === 'error' ? '#c62828' : '#0f766e',
            }}
            role="status"
          >
            {feedback.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>{UI_TEXT.appTitle}</h1>
        <div>
          <button style={styles.headerButton} onClick={() => navigate(-1)}>
            {UI_TEXT.backBtn}
          </button>
          <button style={styles.headerButton} onClick={() => navigate('/')}>
            {UI_TEXT.cancelBtn}
          </button>
        </div>
      </div>

      <div style={styles.card}>
        {phase === 'intro' && (
          <div>
            <h2>{UI_TEXT.title}</h2>
            <p style={styles.description}>{UI_TEXT.shortDescription}</p>
            <h3>{UI_TEXT.instructionsHeader}</h3>
            <ul>
              {UI_TEXT.instructionsList.map((item) => (
                <li key={item} style={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: '20px', fontWeight: 600 }}>{UI_TEXT.practiceNote}</p>

            <div style={{ marginTop: '30px' }}>
              <h4 style={{ marginBottom: '10px', color: '#111' }}>{UI_TEXT.chooseNLabel}</h4>
              <div style={styles.modeButtons}>
                {UI_TEXT.nOptions.map((option) => (
                  <button
                    key={option}
                    style={{
                      ...styles.modeButton,
                      borderColor: mode === option ? '#4c6ef5' : '#d7dbff',
                      background: mode === option ? '#eef2ff' : 'white',
                    }}
                    onClick={() => setMode(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.ctaRow}>
              <button style={styles.primaryButton} onClick={handleStartPractice}>
                {UI_TEXT.practiceBtn}
              </button>
              <button style={styles.outlineButton} onClick={handleBeginMain}>
                {UI_TEXT.beginMainBtn}
              </button>
            </div>
          </div>
        )}

        {(phase === 'practice' || phase === 'main') && renderActiveStage()}

        {phase === 'practiceComplete' && (
          <div style={styles.centered}>
            <p>연습이 완료되었습니다.</p>
            <p>선택한 N값으로 본 검사를 진행하세요.</p>
            <div style={styles.ctaRow}>
              <button style={styles.outlineButton} onClick={handleStartPractice}>
                {UI_TEXT.practiceBtn}
              </button>
              <button style={styles.primaryButton} onClick={handleBeginMain}>
                {UI_TEXT.beginMainBtn}
              </button>
            </div>
          </div>
        )}

        {phase === 'summary' && (
          <div style={styles.centered}>
            <h2>{UI_TEXT.summaryTitle}</h2>
            <p style={styles.summaryText}>
              {UI_TEXT.summaryText
                .replace('{accuracy}', accuracy.toString())
                .replace('{timeouts}', stats.timeouts.toString())
                .replace('{avgRT}', avgRT.toString())}
            </p>
            <div style={styles.ctaRow}>
              <button style={styles.outlineButton} onClick={handleRetry}>
                {UI_TEXT.retryBtn}
              </button>
              <button style={styles.primaryButton} onClick={() => navigate('/')}>
                {UI_TEXT.finishBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  description: {
    margin: '10px 0 20px',
    lineHeight: 1.5,
    color: '#555',
  },
  listItem: {
    marginBottom: '10px',
    color: '#444',
  },
  modeButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  modeButton: {
    padding: '12px 24px',
    borderRadius: '14px',
    border: '2px solid #d7dbff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  ctaRow: {
    marginTop: '30px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff8a00, #e52e71)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  outlineButton: {
    padding: '12px 22px',
    borderRadius: '12px',
    border: '2px solid #d0d7ff',
    background: 'white',
    color: '#3d4a80',
    fontWeight: 600,
    cursor: 'pointer',
  },
  headerButton: {
    padding: '12px 22px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.8)',
    background: 'transparent',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: '10px',
  },
  flowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    fontWeight: 600,
  },
  badge: {
    background: '#eef2ff',
    color: '#4c51bf',
    padding: '6px 14px',
    borderRadius: '999px',
  },
  timer: {
    fontVariantNumeric: 'tabular-nums',
    color: '#e52e71',
  },
  stimulus: {
    fontSize: '72px',
    fontWeight: 800,
    textAlign: 'center',
    margin: '40px 0',
    color: '#111',
  },
  buttonsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  actionButton: {
    padding: '18px 32px',
    borderRadius: '16px',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    fontWeight: 700,
    cursor: 'pointer',
    minWidth: '140px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
  },
  feedback: {
    marginTop: '20px',
    padding: '16px',
    borderRadius: '12px',
    background: '#f1f5f9',
    fontWeight: 600,
    textAlign: 'center',
  },
  centered: {
    textAlign: 'center',
    color: '#333',
  },
  summaryText: {
    marginTop: '10px',
    fontSize: '18px',
    fontWeight: 600,
  },
  warmupNote: {
    marginTop: '20px',
    padding: '18px',
    borderRadius: '14px',
    background: '#f5f7ff',
    color: '#3d4a80',
    fontWeight: 600,
    textAlign: 'center',
  },
};

