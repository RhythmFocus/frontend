import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Phase = 'intro' | 'practice' | 'practiceComplete' | 'main' | 'summary';

const UI_TEXT = {
  appTitle: '인지 검사 ― Stroop',
  startAllBtn: '검사 시작',
  cancelBtn: '취소',
  nextBtn: '다음',
  submitBtn: '제출',
  practiceBtn: '연습 시작',
  backBtn: '뒤로',
  retryBtn: '다시하기',
  finishBtn: '완료',
  loading: '불러오는 중...',
  errorGeneric: '오류가 발생했습니다. 다시 시도해주세요.',
  title: 'Stroop 테스트',
  shortDescription:
    "화면에 보이는 '글자색'을 가능한 한 빠르고 정확하게 선택하세요. 단어의 의미(문자)는 무시하세요.",
  instructionsHeader: '사용 방법',
  instructionsList: [
    '각 문제는 한 단어가 나타나고, 단어의 글자색이 실제 정답입니다.',
    '단어 자체(예: "빨강")가 아니라 글자색(예: 파란색)을 선택하세요.',
    'Shift/클릭으로 색을 선택하거나 화면 아래 버튼을 누르세요.',
    '응답 속도와 정확도를 측정합니다. 침착하게, 그러나 빠르게 답하세요.',
  ],
  practiceNote: '처음에는 연습 문제가 있습니다. 연습 후 본 검사를 시작합니다.',
  agreeBtn: '연습 문제 시작',
  beginMainBtn: '본 검사 시작',
  timeUpMsg: '시간 종료 — 다음으로 이동합니다.',
  prompt: "다음 글자의 '글자색'을 선택하세요.",
  correctMsg: '정답입니다!',
  wrongMsg: '오답입니다. 정답:',
  summaryTitle: 'Stroop 검사 결과',
  summaryText: '정확도: {accuracy}% | 평균 반응시간: {avgRT} ms',
  ariaStimulus: '자극 단어',
  ariaColorButton: '색 선택 버튼',
};

const QUESTION_TIME_LIMIT = 5000;

const COLOR_OPTIONS = [
  { id: 'red', label: '빨강', css: '#e53935' },
  { id: 'blue', label: '파랑', css: '#1e88e5' },
  { id: 'green', label: '초록', css: '#43a047' },
  { id: 'yellow', label: '노랑', css: '#fdd835' },
  { id: 'purple', label: '보라', css: '#8e24aa' },
  { id: 'orange', label: '주황', css: '#fb8c00' },
];

const COLOR_LABEL_MAP = COLOR_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.id] = option.label;
  return acc;
}, {});

interface Stimulus {
  text: string;
  colorId: string;
}

const STIMULI: Stimulus[] = [
  { text: '빨강', colorId: 'blue' },
  { text: '파랑', colorId: 'yellow' },
  { text: '초록', colorId: 'red' },
  { text: '노랑', colorId: 'green' },
  { text: '보라', colorId: 'orange' },
  { text: '빨강', colorId: 'red' },
  { text: '초록', colorId: 'green' },
];

const PRACTICE_STIMULI = STIMULI.slice(0, 3);
const MAIN_STIMULI = STIMULI;

interface ResponseLog {
  isCorrect: boolean;
  reactionTime: number;
}

export default function StroopPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [mainIndex, setMainIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseLog[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<{ message: string; isCorrect?: boolean } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_TIME_LIMIT);
  const [stimulusStart, setStimulusStart] = useState<number>(0);
  const [timeMessage, setTimeMessage] = useState<string | null>(null);

  const isPracticeActive = phase === 'practice' && practiceIndex < PRACTICE_STIMULI.length;
  const isMainActive = phase === 'main' && mainIndex < MAIN_STIMULI.length;
  const currentStimulus = phase === 'practice'
    ? PRACTICE_STIMULI[practiceIndex]
    : phase === 'main'
      ? MAIN_STIMULI[mainIndex]
      : null;

  useEffect(() => {
    if (!currentStimulus) return;

    setCurrentFeedback(null);
    setTimeMessage(null);
    setStimulusStart(performance.now());
    setTimeRemaining(QUESTION_TIME_LIMIT);

    const tick = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 100, 0));
    }, 100);

    const timeout = setTimeout(() => {
      setTimeMessage(UI_TEXT.timeUpMsg);
      if (!currentFeedback && phase === 'main') {
        recordResponse(false, QUESTION_TIME_LIMIT);
      }
      setCurrentFeedback({
        message: `${UI_TEXT.timeUpMsg} ${UI_TEXT.wrongMsg} ${COLOR_LABEL_MAP[currentStimulus.colorId]}`,
      });
    }, QUESTION_TIME_LIMIT);

    return () => {
      clearInterval(tick);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, practiceIndex, mainIndex]);

  const recordResponse = (isCorrect: boolean, reactionTime: number) => {
    setResponses((prev) => [...prev, { isCorrect, reactionTime }]);
  };

  const handleStartPractice = () => {
    setPhase('practice');
    setPracticeIndex(0);
    setMainIndex(0);
    setResponses([]);
  };

  const handleBeginMain = () => {
    setPhase('main');
    setMainIndex(0);
    setResponses([]);
  };

  const handleAnswer = (colorId: string) => {
    if (!currentStimulus || currentFeedback) return;
    const reactionTime = performance.now() - stimulusStart;
    const isCorrect = colorId === currentStimulus.colorId;

    if (phase === 'main') {
      recordResponse(isCorrect, reactionTime);
    }

    const message = isCorrect
      ? UI_TEXT.correctMsg
      : `${UI_TEXT.wrongMsg} ${COLOR_LABEL_MAP[currentStimulus.colorId]}`;

    setCurrentFeedback({ message, isCorrect });
  };

  const handleNext = () => {
    if (phase === 'practice') {
      if (practiceIndex < PRACTICE_STIMULI.length - 1) {
        setPracticeIndex((prev) => prev + 1);
      } else {
        setPhase('practiceComplete');
      }
    } else if (phase === 'main') {
      if (mainIndex < MAIN_STIMULI.length - 1) {
        setMainIndex((prev) => prev + 1);
      } else {
        setPhase('summary');
      }
    }
  };

  const handleRetry = () => {
    setPhase('practice');
    setPracticeIndex(0);
    setMainIndex(0);
    setResponses([]);
  };

  const summary = useMemo(() => {
    if (responses.length === 0) {
      return { accuracy: 0, avgRT: 0 };
    }
    const correctCount = responses.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correctCount / responses.length) * 100);
    const avgRT = Math.round(
      responses.reduce((acc, cur) => acc + cur.reactionTime, 0) / responses.length
    );
    return { accuracy, avgRT };
  }, [responses]);

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
            <div style={styles.ctaRow}>
              <button style={styles.primaryButton} onClick={handleStartPractice}>
                {UI_TEXT.agreeBtn}
              </button>
              <button style={styles.textButton} onClick={() => navigate('/')}>
                {UI_TEXT.startAllBtn}
              </button>
            </div>
          </div>
        )}

        {(phase === 'practice' || phase === 'main') && currentStimulus && (
          <div>
            <div style={styles.flowHeader}>
              <span style={styles.badge}>
                {phase === 'practice' ? '연습' : '본 검사'} {phase === 'practice' ? practiceIndex + 1 : mainIndex + 1}/
                {phase === 'practice' ? PRACTICE_STIMULI.length : MAIN_STIMULI.length}
              </span>
              <span>{UI_TEXT.prompt}</span>
              <span style={styles.timer}>{(timeRemaining / 1000).toFixed(1)}s</span>
            </div>
            <div
              aria-label={UI_TEXT.ariaStimulus}
              style={{
                ...styles.stimulus,
                color: COLOR_OPTIONS.find((c) => c.id === currentStimulus.colorId)?.css,
              }}
            >
              {currentStimulus.text}
            </div>
            <div style={styles.buttonsWrap}>
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  aria-label={`${UI_TEXT.ariaColorButton} ${option.label}`}
                  style={{
                    ...styles.colorButton,
                    backgroundColor: option.css,
                  }}
                  onClick={() => handleAnswer(option.id)}
                  disabled={!!currentFeedback}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {(currentFeedback || timeMessage) && (
              <div style={styles.feedback} role="status">
                {currentFeedback?.message ?? timeMessage}
              </div>
            )}
            <div style={styles.ctaRow}>
              <button style={styles.outlineButton} onClick={() => navigate('/')}>
                {UI_TEXT.cancelBtn}
              </button>
              <button
                style={{
                  ...styles.primaryButton,
                  opacity: currentFeedback ? 1 : 0.5,
                  pointerEvents: currentFeedback ? 'auto' : 'none',
                }}
                onClick={handleNext}
              >
                {phase === 'main' && mainIndex === MAIN_STIMULI.length - 1
                  ? UI_TEXT.submitBtn
                  : UI_TEXT.nextBtn}
              </button>
            </div>
          </div>
        )}

        {phase === 'practiceComplete' && (
          <div style={styles.centered}>
            <p>연습이 완료되었습니다.</p>
            <p>준비가 되셨다면 본 검사를 시작해주세요.</p>
            <div style={styles.ctaRow}>
              <button style={styles.outlineButton} onClick={handleRetry}>
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
                .replace('{accuracy}', summary.accuracy.toString())
                .replace('{avgRT}', summary.avgRT.toString())}
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
    flexGrow: 0,
  },
  headerButton: {
    padding: '12px 22px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.8)',
    background: 'transparent',
    color: 'white',
    fontWeight: 600,
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
  textButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '16px',
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
    fontSize: '64px',
    fontWeight: 800,
    textAlign: 'center',
    margin: '40px 0',
  },
  buttonsWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '16px',
  },
  colorButton: {
    border: 'none',
    borderRadius: '16px',
    padding: '20px',
    fontSize: '18px',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
  },
  feedback: {
    marginTop: '20px',
    padding: '16px',
    borderRadius: '12px',
    background: '#f1f5f9',
    color: '#1e293b',
    fontWeight: 600,
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
};

