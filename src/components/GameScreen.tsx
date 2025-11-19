import { useEffect, useRef, useState, useCallback } from 'react';
import { GameTimer } from '../core/GameTimer';
import { TimingJudge } from '../core/TimingJudge';
import { NoteGenerator } from '../core/NoteGenerator';
import {
  Note,
  HitFeedback as HitFeedbackType,
  GameState,
  Difficulty,
} from '../types/game.types';
import { GameCanvas } from './GameCanvas';
import { ScoreDisplay } from './ScoreDisplay';
import { ResultScreen } from './ResultScreen';
import { fetchWithAccess } from '../util/fetchUtil';

interface GameScreenProps {
  difficulty: Difficulty;
  onExit: () => void;
}

// 게임 설정
const GAME_CONFIG = {
  JUDGMENT_LINE_X: 1050,
  NOTE_SPEED: 300,
  SPAWN_AHEAD_TIME: 5000,
  GENERATION_INTERVAL: 50,
  MAX_NOTES_PER_GENERATION: 30,
  DIFFICULTY_ADJUST_INTERVAL: 5000,
  MIN_NOTES_FOR_ADJUSTMENT: 10,
} as const;

export function GameScreen({ difficulty, onExit }: GameScreenProps) {
  // 게임 상태
  const [notes, setNotes] = useState<Note[]>([]);
  const [hitFeedbacks, setHitFeedbacks] = useState<HitFeedbackType[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    accuracy: 100,
    averageOffset: 0,
    judgmentCounts: { perfect: 0, good: 0, bad: 0, miss: 0 },
    totalNotes: 0,
  });

  // UI 상태
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(true);
  const [isCharacterHitting, setIsCharacterHitting] = useState(false);
  const [bpmChange, setBpmChange] = useState<'up' | 'down' | null>(null);

  // Refs
  const gameTimerRef = useRef(new GameTimer());
  const timingJudgeRef = useRef(new TimingJudge(gameTimerRef.current));
  const generatorRef = useRef(new NoteGenerator(difficulty));
  const allNotesRef = useRef<Note[]>([]);
  const spawnedNotesRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const gameDurationRef = useRef<number>(0);
  const offsetHistoryRef = useRef<number[]>([]);
  const finalGameStateRef = useRef<GameState | null>(null);

  // 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCountingDown(false);
      startGame();
    }
  }, [countdown]);

  // 게임 시작
  const startGame = () => {
    gameDurationRef.current = generatorRef.current.getDifficultyConfig(difficulty).duration;
    gameTimerRef.current.start();
    startGameLoop();

    const gameEndTimer = setTimeout(() => endGame(), gameDurationRef.current);

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearTimeout(gameEndTimer);
    };
  };

  // 게임 루프
  const startGameLoop = () => {
    let lastDifficultyAdjustTime = 0;
    let lastGenerationTime = 0;

    const gameLoop = () => {
      if (gameTimerRef.current.getIsPaused()) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const currentTime = gameTimerRef.current.getCurrentTime();

      // 노트 생성
      generateNotes(currentTime, lastGenerationTime, (newTime) => {
        lastGenerationTime = newTime;
      });

      // 노트 스폰
      spawnNotes(currentTime);

      // 난이도 조절
      adjustDifficulty(currentTime, lastDifficultyAdjustTime, (newTime) => {
        lastDifficultyAdjustTime = newTime;
      });

      // 노트 위치 업데이트
      updateNotePositions(currentTime);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // 노트 생성 함수
  const generateNotes = (
    currentTime: number,
    lastGenerationTime: number,
    setLastGenerationTime: (time: number) => void
  ) => {
    if (currentTime - lastGenerationTime >= GAME_CONFIG.GENERATION_INTERVAL) {
      const spawnWindow = currentTime + GAME_CONFIG.SPAWN_AHEAD_TIME;
      let generatedCount = 0;

      while (
        generatorRef.current.getNextNoteTime() <= spawnWindow &&
        generatedCount < GAME_CONFIG.MAX_NOTES_PER_GENERATION
      ) {
        const newNote = generatorRef.current.getNextNote();
        allNotesRef.current.push(newNote);
        generatedCount++;
      }

      setLastGenerationTime(currentTime);
    }
  };

  // 노트 스폰 함수
  const spawnNotes = (currentTime: number) => {
    const toSpawn = allNotesRef.current.filter(
      (note) =>
        !spawnedNotesRef.current.has(note.id) &&
        note.time - currentTime <= GAME_CONFIG.SPAWN_AHEAD_TIME &&
        note.time >= currentTime - 100
    );

    if (toSpawn.length > 0) {
      const notesWithX = toSpawn.map((note) => {
        const timeUntilHit = note.time - currentTime;
        const x = GAME_CONFIG.JUDGMENT_LINE_X - (timeUntilHit * GAME_CONFIG.NOTE_SPEED) / 1000;
        return { ...note, x };
      });

      toSpawn.forEach((note) => spawnedNotesRef.current.add(note.id));
      setNotes((prev) => [...prev, ...notesWithX]);
    }
  };

  // 난이도 조절 함수
  const adjustDifficulty = (
    currentTime: number,
    lastDifficultyAdjustTime: number,
    setLastDifficultyAdjustTime: (time: number) => void
  ) => {
    if (
      currentTime - lastDifficultyAdjustTime > GAME_CONFIG.DIFFICULTY_ADJUST_INTERVAL &&
      currentTime > GAME_CONFIG.DIFFICULTY_ADJUST_INTERVAL &&
      gameState.totalNotes >= GAME_CONFIG.MIN_NOTES_FOR_ADJUSTMENT
    ) {
      const accuracy = gameState.accuracy;
      const missRate =
        gameState.totalNotes > 0 ? gameState.judgmentCounts.miss / gameState.totalNotes : 0;
      const validOffsets = offsetHistoryRef.current.filter((offset) => Math.abs(offset) < 100);
      const avgOffset =
        validOffsets.length > 0 ? validOffsets.reduce((a, b) => a + b, 0) / validOffsets.length : 0;

      if (accuracy >= 90 && missRate < 0.1 && Math.abs(avgOffset) < 15) {
        generatorRef.current.increaseDifficulty();
        setBpmChange('up');
        setTimeout(() => setBpmChange(null), 2000);
      } else if (accuracy < 70 || missRate > 0.3 || Math.abs(avgOffset) > 30) {
        generatorRef.current.decreaseDifficulty();
        setBpmChange('down');
        setTimeout(() => setBpmChange(null), 2000);
      }

      setLastDifficultyAdjustTime(currentTime);
    }
  };

  // 노트 위치 업데이트 함수
  const updateNotePositions = (currentTime: number) => {
    setNotes((prev) =>
      prev
        .map((note) => {
          const timeUntilHit = note.time - currentTime;
          const x = GAME_CONFIG.JUDGMENT_LINE_X - (timeUntilHit * GAME_CONFIG.NOTE_SPEED) / 1000;

          if (!note.isHit && timeUntilHit < -100) {
            handleMiss(note);
            return { ...note, x, isHit: true };
          }

          return { ...note, x };
        })
        .filter((note) => {
          // hit된 노트만 화면 밖으로 나가면 제거
          if (note.isHit && note.x < -200) return false;
          return true;
        })
    );
  };

  // MISS 처리
  const handleMiss = (note: Note) => {
    setGameState((prev) => {
      const newTotalNotes = prev.totalNotes + 1;
      const newJudgmentCounts = {
        ...prev.judgmentCounts,
        miss: prev.judgmentCounts.miss + 1,
      };
      const successfulHits = newJudgmentCounts.perfect + newJudgmentCounts.good;
      const newAccuracy = newTotalNotes > 0 ? (successfulHits / newTotalNotes) * 100 : 100;

      const newState = {
        ...prev,
        combo: 0,
        accuracy: newAccuracy,
        judgmentCounts: newJudgmentCounts,
        totalNotes: newTotalNotes,
      };

      finalGameStateRef.current = newState;
      return newState;
    });

    addHitFeedback(note, { offset: 999, judgment: 'MISS', score: 0 });
  };

  // 게임 상태 업데이트
  const updateGameState = (result: any) => {
    setGameState((prev) => {
      const newCombo = result.judgment !== 'MISS' ? prev.combo + 1 : 0;
      const newTotalNotes = prev.totalNotes + 1;
      const newJudgmentCounts = {
        ...prev.judgmentCounts,
        [result.judgment.toLowerCase()]:
          prev.judgmentCounts[result.judgment.toLowerCase() as keyof typeof prev.judgmentCounts] + 1,
      };
      const successfulHits = newJudgmentCounts.perfect + newJudgmentCounts.good;
      const newAccuracy = newTotalNotes > 0 ? (successfulHits / newTotalNotes) * 100 : 100;
      const validOffsets = offsetHistoryRef.current.filter((offset) => Math.abs(offset) < 100);
      const newAverageOffset =
        validOffsets.length > 0 ? validOffsets.reduce((a, b) => a + b, 0) / validOffsets.length : 0;

      const newState = {
        score: prev.score + result.score + (newCombo >= 10 ? Math.floor(newCombo / 10) * 10 : 0),
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        accuracy: newAccuracy,
        averageOffset: newAverageOffset,
        judgmentCounts: newJudgmentCounts,
        totalNotes: newTotalNotes,
      };

      finalGameStateRef.current = newState;
      return newState;
    });
  };

  // 입력 처리
  const handleInput = useCallback(() => {
    if (isPaused || isGameOver || isCountingDown) return;

    setIsCharacterHitting(true);
    setTimeout(() => setIsCharacterHitting(false), 200);

    const currentTime = gameTimerRef.current.getCurrentTime();
    const hittableNotes = notes
      .filter((note) => !note.isHit && Math.abs(note.time - currentTime) <= 100)
      .sort((a, b) => Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime));

    const hittableNote = hittableNotes[0];

    if (hittableNote) {
      const result = timingJudgeRef.current.judge(hittableNote);

      offsetHistoryRef.current.push(result.offset);
      if (offsetHistoryRef.current.length > 50) {
        offsetHistoryRef.current.shift();
      }

      setNotes((prev) => prev.map((n) => (n.id === hittableNote.id ? { ...n, isHit: true } : n)));
      updateGameState(result);
      addHitFeedback(hittableNote, result);
    }
  }, [isPaused, isGameOver, isCountingDown, notes]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleInput();
      } else if (e.code === 'Escape') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  // 피드백 추가
  const addHitFeedback = (note: Note, result: any) => {
    const feedback: HitFeedbackType = {
      id: `feedback-${Date.now()}-${Math.random()}`,
      x: GAME_CONFIG.JUDGMENT_LINE_X,
      y: 360,
      offset: result.offset,
      judgment: result.judgment,
      timestamp: performance.now(),
    };

    setHitFeedbacks((prev) => [...prev, feedback]);
    setTimeout(() => {
      setHitFeedbacks((prev) => prev.filter((f) => f.id !== feedback.id));
    }, 1000);
  };

  // 게임 종료
  const endGame = async () => {
    setIsGameOver(true);
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const finalState = finalGameStateRef.current || gameState;

    try {
      const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
      const safeAccuracy = isNaN(finalState.accuracy) ? 0 : finalState.accuracy;
      const safeAverageOffset = isNaN(finalState.averageOffset) ? 0 : finalState.averageOffset;

      const gameResultData = {
        difficulty: String(difficulty),
        score: Math.floor(Number(finalState.score) || 0),
        accuracy: Number(safeAccuracy.toFixed(2)),
        maxCombo: Math.floor(Number(finalState.maxCombo) || 0),
        clearRhythm: Math.floor(
          Number(finalState.judgmentCounts.perfect + finalState.judgmentCounts.good) || 0
        ),
        perfectCount: Math.floor(Number(finalState.judgmentCounts.perfect) || 0),
        goodCount: Math.floor(Number(finalState.judgmentCounts.good) || 0),
        badCount: Math.floor(Number(finalState.judgmentCounts.bad) || 0),
        missCount: Math.floor(Number(finalState.judgmentCounts.miss) || 0),
        totalNotes: Math.floor(Number(finalState.totalNotes) || 0),
        averageOffset: Number(safeAverageOffset.toFixed(2)),
      };

      await fetchWithAccess(`${BACKEND_API_BASE_URL}/game-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(gameResultData),
      });
    } catch (error) {
      console.error('게임 결과 저장 실패:', error);
    }
  };

  // 재시작
  const handleRestart = () => window.location.reload();

  // 일시정지
  const togglePause = () => {
    if (isCountingDown) return;
    isPaused ? gameTimerRef.current.resume() : gameTimerRef.current.pause();
    setIsPaused(!isPaused);
  };

  return (
    <div style={styles.container}>
      {/* 카운트다운 */}
      {isCountingDown && (
        <div style={styles.countdown}>
          <div style={styles.countdownText}>
            {countdown === 0 ? 'START!' : countdown}
          </div>
        </div>
      )}

      {/* 상단 버튼 */}
      <button onClick={onExit} style={styles.homeButtonImage}>
        <img src="/home-button.png" alt="홈" style={styles.buttonImage} />
      </button>
      <button 
        onClick={togglePause} 
        disabled={isCountingDown} 
        style={styles.pauseButtonImage(isCountingDown)}
      >
        <img 
          src={isPaused ? "/play-button.png" : "/pause-button.png"}
          alt={isPaused ? "재개" : "일시정지"}
          style={styles.buttonImage}
        />
      </button>

      {/* 점수판 */}
      {!isCountingDown && (
        <ScoreDisplay
          gameState={gameState}
          currentBPM={generatorRef.current.getCurrentBPM()}
          bpmChange={bpmChange}
        />
      )}

      {/* 게임 캔버스 */}
      {!isCountingDown && (
        <GameCanvas
          notes={notes.filter((n) => !n.isHit)}
          hitFeedbacks={hitFeedbacks}
          judgmentLineX={GAME_CONFIG.JUDGMENT_LINE_X}
          isCharacterHitting={isCharacterHitting}
          onCanvasClick={handleInput}
        />
      )}

      {/* 일시정지 화면 */}
      {isPaused && !isCountingDown && (
        <div style={styles.pauseOverlay}>
          <div>
            <div style={styles.pauseTitle}>⏸️ 일시정지</div>
            <div style={styles.pauseSubtitle}>ESC 버튼을 눌러 재개하세요</div>
          </div>
        </div>
      )}

      {/* 결과 화면 */}
      {isGameOver && (
        <ResultScreen gameState={gameState} onRestart={handleRestart} onHome={onExit} />
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: '#c7f8f5',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  countdown: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  countdownText: {
    fontSize: '120px',
    fontWeight: 'bold' as const,
    color: 'white',
  },
  homeButtonImage: {
    position: 'absolute' as const,
    top: '20px',
    left: '20px',
    width: '60px',
    height: '60px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 100,
    transition: 'transform 0.2s ease',
  },
  pauseButtonImage: (isCountingDown: boolean) => ({
    position: 'absolute' as const,
    top: '20px',
    left: '100px',
    width: '60px',
    height: '60px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: isCountingDown ? 'not-allowed' : 'pointer',
    opacity: isCountingDown ? 0.5 : 1,
    zIndex: 100,
    transition: 'transform 0.2s ease',
  }),
  buttonImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
  },
  kbd: {
    background: 'rgba(0, 0, 0, 0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  pauseOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500,
  },
  pauseTitle: {
    color: 'white',
    fontSize: '60px',
    fontWeight: 'bold' as const,
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  pauseSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '18px',
    textAlign: 'center' as const,
  },
};