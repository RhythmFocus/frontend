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

export function GameScreen({ difficulty, onExit }: GameScreenProps) {
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

  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(true);
  const [isCharacterHitting, setIsCharacterHitting] = useState(false);

  const JUDGMENT_LINE_X = 1050;
  const NOTE_SPEED = 300;
  const SPAWN_AHEAD_TIME = 4000;

  const gameTimerRef = useRef(new GameTimer());
  const timingJudgeRef = useRef(new TimingJudge(gameTimerRef.current));
  const generatorRef = useRef(new NoteGenerator(difficulty));
  const allNotesRef = useRef<Note[]>([]);
  const spawnedNotesRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const gameDurationRef = useRef<number>(0);
  const offsetHistoryRef = useRef<number[]>([]);
  const finalGameStateRef = useRef<GameState | null>(null);

  const laneCount = 1;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCountingDown(false);
      startGame();
    }
  }, [countdown]);

  const startGame = () => {
    gameDurationRef.current = generatorRef.current.getDifficultyConfig(difficulty).duration;
    gameTimerRef.current.start();
    startGameLoop();

    const gameEndTimer = setTimeout(() => {
      endGame();
    }, gameDurationRef.current);

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearTimeout(gameEndTimer);
    };
  };

  const startGameLoop = () => {
    let lastDifficultyAdjustTime = 0;
    let lastLogTime = 0;

    const gameLoop = () => {
      if (gameTimerRef.current.getIsPaused()) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const currentTime = gameTimerRef.current.getCurrentTime();

      generatorRef.current.syncToCurrentTime(currentTime);

      const spawnDeadline = currentTime + SPAWN_AHEAD_TIME + 3000;
      let generatedCount = 0;

      while (
        generatorRef.current.getNextNoteTime() <= spawnDeadline &&
        generatedCount < 200
      ) {
        const newNote = generatorRef.current.getNextNote();
        allNotesRef.current.push(newNote);
        generatedCount++;
      }

      if (generatedCount > 0 && currentTime - lastLogTime > 2000) {
        console.log(`🎵 ${generatedCount}개 생성`);
        lastLogTime = currentTime;
      }

      const toSpawn = allNotesRef.current.filter(
        (note) =>
          !spawnedNotesRef.current.has(note.id) &&
          note.time - currentTime <= SPAWN_AHEAD_TIME &&
          note.time >= currentTime - 100
      );

      if (toSpawn.length > 0) {
        toSpawn.forEach((note) => {
          spawnedNotesRef.current.add(note.id);
        });
        setNotes((prev) => [...prev, ...toSpawn]);
      }

      // 난이도 자동 조절 - 3초마다 체크
      if (currentTime - lastDifficultyAdjustTime > 3000 && currentTime > 3000) {
        if (gameState.totalNotes >= 5) {
          const recentAccuracy = gameState.accuracy;
          const missRate = gameState.totalNotes > 0 
            ? gameState.judgmentCounts.miss / gameState.totalNotes 
            : 0;

          const validOffsets = offsetHistoryRef.current.filter(
            (offset) => Math.abs(offset) < 100
          );
          const avgOffset = validOffsets.length > 0
            ? validOffsets.reduce((a, b) => a + b, 0) / validOffsets.length
            : 0;

          let shouldIncrease = false;
          let shouldDecrease = false;

          // 수행 능력이 좋으면 난이도 상승
          if (recentAccuracy >= 90 && missRate < 0.1 && Math.abs(avgOffset) < 15) {
            shouldIncrease = true;
          }

          // 수행 능력이 좋지 않으면 난이도 하강
          if (recentAccuracy < 70 || missRate > 0.3 || Math.abs(avgOffset) > 30) {
            shouldDecrease = true;
          }

          if (shouldIncrease) {
            generatorRef.current.increaseDifficulty();
            console.log('🔼 난이도 상승 - Accuracy:', recentAccuracy.toFixed(1) + '%');
          } else if (shouldDecrease) {
            generatorRef.current.decreaseDifficulty();
            console.log('🔽 난이도 하강 - Accuracy:', recentAccuracy.toFixed(1) + '%');
          }
        }
        lastDifficultyAdjustTime = currentTime;
      }

      setNotes((prev) =>
        prev
          .map((note) => {
            const timeUntilHit = note.time - currentTime;
            const x = JUDGMENT_LINE_X - (timeUntilHit * NOTE_SPEED) / 1000;

            if (!note.isHit && timeUntilHit < -100) {
              handleMiss(note);
              return { ...note, x, isHit: true };
            }

            return { ...note, x };
          })
          .filter((note) => note.x > -100)
      );

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // MISS 처리
  const handleMiss = (note: Note) => {
    setGameState((prev) => {
      const newTotalNotes = prev.totalNotes + 1;
      const newJudgmentCounts = {
        ...prev.judgmentCounts,
        miss: prev.judgmentCounts.miss + 1,
      };

      // Accuracy 계산: (Perfect + Good) / 전체
      const successfulHits = newJudgmentCounts.perfect + newJudgmentCounts.good;
      const newAccuracy = newTotalNotes > 0 ? (successfulHits / newTotalNotes) * 100 : 100;

      const newState = {
        ...prev,
        combo: 0,
        accuracy: newAccuracy,
        judgmentCounts: newJudgmentCounts,
        totalNotes: newTotalNotes,
      };

      // 최종 상태 저장
      finalGameStateRef.current = newState;
      return newState;
    });

    const feedback: HitFeedbackType = {
      id: `feedback-miss-${Date.now()}-${Math.random()}`,
      x: JUDGMENT_LINE_X,
      y: 300 + 60,
      offset: 999,
      judgment: 'MISS',
      timestamp: performance.now(),
    };

    setHitFeedbacks((prev) => [...prev, feedback]);

    setTimeout(() => {
      setHitFeedbacks((prev) => prev.filter((f) => f.id !== feedback.id));
    }, 1000);
  };

  // updateGameState
  const updateGameState = (result: any) => {
    setGameState((prev) => {
      const newCombo = result.judgment !== 'MISS' ? prev.combo + 1 : 0;
      const newTotalNotes = prev.totalNotes + 1;
      const newJudgmentCounts = {
        ...prev.judgmentCounts,
        [result.judgment.toLowerCase()]:
          prev.judgmentCounts[
            result.judgment.toLowerCase() as keyof typeof prev.judgmentCounts
          ] + 1,
      };

      // Accuracy 계산: (Perfect + Good) / 전체
      const successfulHits = newJudgmentCounts.perfect + newJudgmentCounts.good;
      const newAccuracy = newTotalNotes > 0 ? (successfulHits / newTotalNotes) * 100 : 100;

      const validOffsets = offsetHistoryRef.current.filter(
        (offset) => Math.abs(offset) < 100
      );
      const newAverageOffset =
        validOffsets.length > 0
          ? validOffsets.reduce((a, b) => a + b, 0) / validOffsets.length
          : 0;

      const newState = {
        score:
          prev.score +
          result.score +
          (newCombo >= 10 ? Math.floor(newCombo / 10) * 10 : 0),
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        accuracy: newAccuracy,
        averageOffset: newAverageOffset,
        judgmentCounts: newJudgmentCounts,
        totalNotes: newTotalNotes,
      };

      // 최종 상태 저장
      finalGameStateRef.current = newState;
      return newState;
    });
  };

const handleInput = useCallback(() => {
  if (isPaused || isGameOver || isCountingDown) return;

  setIsCharacterHitting(true);
  setTimeout(() => setIsCharacterHitting(false), 200);

  const currentTime = gameTimerRef.current.getCurrentTime();

  const hittableNotes = notes
    .filter((note) => !note.isHit && Math.abs(note.time - currentTime) <= 100)
    .sort(
      (a, b) =>
        Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime)
    );

  const hittableNote = hittableNotes[0];

  if (hittableNote) {
    const result = timingJudgeRef.current.judge(hittableNote);

    offsetHistoryRef.current.push(result.offset);
    if (offsetHistoryRef.current.length > 50) {
      offsetHistoryRef.current.shift();
    }

    setNotes((prev) =>
      prev.map((n) => (n.id === hittableNote.id ? { ...n, isHit: true } : n))
    );

    updateGameState(result);
    addHitFeedback(hittableNote, result);
  }
}, [isPaused, isGameOver, isCountingDown, notes]);

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


  const addHitFeedback = (note: Note, result: any) => {
    const feedback: HitFeedbackType = {
      id: `feedback-${Date.now()}-${Math.random()}`,
      x: JUDGMENT_LINE_X,
      y: 300 + 60,
      offset: result.offset,
      judgment: result.judgment,
      timestamp: performance.now(),
    };

    setHitFeedbacks((prev) => [...prev, feedback]);

    setTimeout(() => {
      setHitFeedbacks((prev) => prev.filter((f) => f.id !== feedback.id));
    }, 1000);
  };

  const endGame = async () => {
    setIsGameOver(true);
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // finalGameStateRef에서 최종 상태 가져오기
    const finalState = finalGameStateRef.current || gameState;

    console.log('=== 게임 종료 ===');
    console.log('최종 게임 상태:', finalState);

    // 게임 결과를 서버에 저장
    try {
      const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

      const gameResultData = {
        difficulty: difficulty,
        score: finalState.score,
        accuracy: finalState.accuracy,
        maxCombo: finalState.maxCombo,
        clearRhythm: finalState.judgmentCounts.perfect + finalState.judgmentCounts.good,
        perfectCount: finalState.judgmentCounts.perfect,
        goodCount: finalState.judgmentCounts.good,
        badCount: finalState.judgmentCounts.bad,
        missCount: finalState.judgmentCounts.miss,
        totalNotes: finalState.totalNotes,
        averageOffset: finalState.averageOffset,
      };

      console.log('전송할 데이터:', gameResultData);

      const response = await fetchWithAccess(`${BACKEND_API_BASE_URL}/game-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(gameResultData),
      });

      console.log('✅ 게임 결과 저장 성공!');
      const result = await response.json();
      console.log('서버 응답:', result);
    } catch (error) {
      console.error('❌ 게임 결과 저장 중 오류:', error);
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const togglePause = () => {
    if (isCountingDown) return;

    if (isPaused) {
      gameTimerRef.current.resume();
    } else {
      gameTimerRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#e0f2fe',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 디버그 정보 */}
      {!isCountingDown && !isGameOver && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#00ff00',
            padding: '12px 15px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'Courier New, monospace',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            minWidth: '200px',
          }}
        >
          <div style={{ 
            color: '#ffff00', 
            fontWeight: 'bold', 
            marginBottom: '6px',
            fontSize: '13px' 
          }}>
            🎮 디버그
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            현재: {(gameTimerRef.current.getCurrentTime() / 1000).toFixed(1)}s
          </div>
          <div style={{ marginBottom: '4px' }}>
            다음: {(generatorRef.current.getNextNoteTime() / 1000).toFixed(1)}s
          </div>
          <div style={{ 
            marginBottom: '8px',
            color: (generatorRef.current.getNextNoteTime() - gameTimerRef.current.getCurrentTime()) < 2000 
              ? '#ff4444' : '#00ff00'
          }}>
            여유: {((generatorRef.current.getNextNoteTime() - gameTimerRef.current.getCurrentTime()) / 1000).toFixed(1)}s
          </div>

          <div style={{ 
            borderTop: '1px solid rgba(0,255,0,0.2)', 
            paddingTop: '6px',
            marginBottom: '6px' 
          }}>
            <div>전체: {allNotesRef.current.length}</div>
            <div>화면: {notes.length}</div>
          </div>

          <div style={{ 
            borderTop: '1px solid rgba(0,255,0,0.2)', 
            paddingTop: '6px',
            marginBottom: '6px' 
          }}>
            <div style={{ color: '#00ffff', fontWeight: 'bold' }}>
              BPM: {generatorRef.current.getCurrentBPM()}
            </div>
            <div style={{ fontSize: '10px', color: '#999' }}>
              {generatorRef.current.getCurrentInterval()}ms
            </div>
          </div>

          <div style={{ 
            borderTop: '1px solid rgba(0,255,0,0.2)', 
            paddingTop: '6px' 
          }}>
            <div style={{
              color: Math.abs(gameState.averageOffset) <= 20 ? '#00ff00' : '#ff9900'
            }}>
              오차: {gameState.averageOffset.toFixed(1)}ms
            </div>
            <div style={{ 
              color: gameState.judgmentCounts.miss > 5 ? '#ff4444' : '#00ff00',
              fontSize: '10px'
            }}>
              MISS: {gameState.judgmentCounts.miss}회
            </div>
          </div>
        </div>
      )}

      {isCountingDown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              fontSize: '120px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            {countdown === 0 ? 'START!' : countdown}
          </div>
        </div>
      )}

      <button
        onClick={onExit}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '10px',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#333',
          cursor: 'pointer',
          zIndex: 100,
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🏠 홈
      </button>

      <button
        onClick={togglePause}
        disabled={isCountingDown}
        style={{
          position: 'absolute',
          top: '20px',
          left: '110px',
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '10px',
          border: 'none',
          background: isCountingDown
            ? 'rgba(200, 200, 200, 0.6)'
            : 'rgba(255, 255, 255, 0.9)',
          color: '#333',
          cursor: isCountingDown ? 'not-allowed' : 'pointer',
          zIndex: 100,
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {isPaused ? '▶️ 재개' : '⏸️ 일시정지'}
      </button>

      {!isCountingDown && (
        <ScoreDisplay
          gameState={gameState}
          currentBPM={generatorRef.current.getCurrentBPM()}
        />
      )}

      {!isCountingDown && (
        <GameCanvas
          notes={notes.filter((n) => !n.isHit)}
          hitFeedbacks={hitFeedbacks}
          judgmentLineX={JUDGMENT_LINE_X}
          isCharacterHitting={isCharacterHitting}
          onCanvasClick={handleInput}
        />
      )}

      {!isCountingDown && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#333',
            fontSize: '18px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '15px 40px',
            borderRadius: '15px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontWeight: 'bold',
          }}
        >
          🖱️ 마우스 클릭 또는{' '}
          <kbd
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          >
            SPACE
          </kbd>{' '}
          키로 입력하세요!
        </div>
      )}

      {isPaused && !isCountingDown && (
        <div
          style={{
            position: 'fixed',
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
          }}
        >
          <div>
            <div
              style={{
                color: 'white',
                fontSize: '60px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              ⏸️ 일시정지
            </div>
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '18px',
                textAlign: 'center',
              }}
            >
              ESC 또는 일시정지 버튼을 눌러 재개하세요
            </div>
          </div>
        </div>
      )}

      {isGameOver && (
        <ResultScreen
          gameState={gameState}
          onRestart={handleRestart}
          onHome={onExit}
        />
      )}
    </div>
  );
}