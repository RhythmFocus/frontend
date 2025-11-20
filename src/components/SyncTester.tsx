import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasRenderer } from '../core/CanvasRenderer';
import { Note, HitFeedback } from '../types/game.types';

interface SyncTesterProps {
    onComplete: (offset: number) => void;
    triggerInput: boolean; // 부모(박수/키보드)로부터 오는 입력 신호
}

const CONFIG = {
    WIDTH: 1280,
    HEIGHT: 720,
    BPM: 120,
    NOTE_SPEED: 500,
    JUDGMENT_LINE_X: 1050, // 판정선 위치
    TOTAL_BEATS: 4,
    INTERVAL: 1000, // 120BPM -> 500ms 간격
};

const SyncTester: React.FC<SyncTesterProps> = ({ onComplete, triggerInput }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);

    const [isRunning, setIsRunning] = useState(false);
    const [message, setMessage] = useState("판정선이 노트의 정중앙에 위치할 때 박수/키보드를 쳐주세요!");

    // 데이터 Refs
    const audioCtx = useRef<AudioContext | null>(null);
    const startTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number>(0);
    const notesRef = useRef<Note[]>([]);
    const feedbacksRef = useRef<HitFeedback[]>([]);
    const offsetsRef = useRef<number[]>([]);
    const beatIndexRef = useRef(0);
    const isCharacterHittingRef = useRef(false);

    // 입력 중복 방지
    const prevTriggerRef = useRef(triggerInput);

    // 1. 초기화
    useEffect(() => {
        if (canvasRef.current) {
            // 렌더러 생성 (1280x720 고정 해상도)
            rendererRef.current = new CanvasRenderer(
                canvasRef.current,
                CONFIG.WIDTH,
                CONFIG.HEIGHT
            );

            // 초기 화면 그리기
            rendererRef.current.render([], [], CONFIG.JUDGMENT_LINE_X, false);
        }
    }, []);

    // 2. 테스트 시작
    const startTest = () => {
        if (!rendererRef.current) return;

        // 오디오 컨텍스트 시작
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        setIsRunning(true);
        offsetsRef.current = [];
        feedbacksRef.current = [];
        beatIndexRef.current = -1;

        // 시작 시간 설정 (1초 대기 후 시작)
        const startDelay = 1000;
        startTimeRef.current = performance.now() + startDelay;

        const newNotes: Note[] = [];
        for (let i = 0; i < CONFIG.TOTAL_BEATS; i++) {
            const noteTime = startTimeRef.current + (i * CONFIG.INTERVAL);
            newNotes.push({
                id: `test-${i}`,
                time: noteTime,
                lane: 1,
                x: 0, // 렌더링 루프에서 계산됨
                isHit: false
            });
        }
        notesRef.current = newNotes;

        loop();
    };

    // 3. 렌더링 루프
    const loop = () => {
        const now = performance.now();

        // 소리 재생 (메트로놈)
        const timeSinceStart = now - startTimeRef.current;
        const currentBeatIndex = Math.floor((timeSinceStart + 50) / CONFIG.INTERVAL);

        if (currentBeatIndex >= 0 && currentBeatIndex < CONFIG.TOTAL_BEATS && currentBeatIndex > beatIndexRef.current) {
            playBeat();
            beatIndexRef.current = currentBeatIndex;
        }

        // 노트 위치 업데이트
        notesRef.current.forEach(note => {
            const timeUntilHit = note.time - now;
            // 위치 공식: 판정선 - (남은시간 * 속도)
            note.x = CONFIG.JUDGMENT_LINE_X - (timeUntilHit * CONFIG.NOTE_SPEED) / 1000;
        });

        // 화면 그리기 (CanvasRenderer 위임)
        if (rendererRef.current) {
            const visibleNotes = notesRef.current.filter(n => !n.isHit);

            // 피드백(PERFECT 등) 지속시간 체크 (1초 지나면 제거)
            feedbacksRef.current = feedbacksRef.current.filter(f => now - f.timestamp < 1000);

            rendererRef.current.render(
                visibleNotes,
                feedbacksRef.current,
                CONFIG.JUDGMENT_LINE_X,
                isCharacterHittingRef.current
            );
        }

        // 타격 모션 리셋 (0.1초 뒤)
        if (isCharacterHittingRef.current) {
            if (Math.random() > 0.9) isCharacterHittingRef.current = false; // 간단히 랜덤 리셋 혹은 타이머 사용
        }

        // D. 종료 체크 (마지막 노트 시간 + 1.5초)
        const lastNoteTime = startTimeRef.current + ((CONFIG.TOTAL_BEATS - 1) * CONFIG.INTERVAL);
        if (now > lastNoteTime + 1500) {
            finishTest();
            return;
        }

        animationFrameRef.current = requestAnimationFrame(loop);
    };

    // 비트 소리
    const playBeat = () => {
        if (!audioCtx.current) return;
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);
        osc.frequency.value = 1200;
        gain.gain.value = 0.15;
        osc.start();
        osc.stop(audioCtx.current.currentTime + 0.05);
    };

    // 입력 처리 (핵심 로직)
    const handleInput = useCallback(() => {
        if (!isRunning) return;

        const now = performance.now();
        isCharacterHittingRef.current = true;
        setTimeout(() => { isCharacterHittingRef.current = false; }, 100); // 0.1초 타격 모션

        // 판정 범위 내(-200ms ~ +200ms)에 있는 가장 가까운 노트 찾기
        const targetNote = notesRef.current.find(n =>
            !n.isHit && Math.abs(n.time - now) < 400 // 범위를 좀 넉넉하게 잡음
        );

        if (targetNote) {
            const offset = now - targetNote.time; // 양수=Late, 음수=Early
            offsetsRef.current.push(offset);
            targetNote.isHit = true;

            // 피드백 생성
            const feedback: HitFeedback = {
                id: `fb-${Date.now()}`,
                x: CONFIG.JUDGMENT_LINE_X,
                y: 250, // 텍스트 높이
                offset: offset,
                judgment: Math.abs(offset) < 50 ? 'PERFECT' : 'GOOD',
                timestamp: now
            };
            feedbacksRef.current.push(feedback);

            setMessage(`입력됨! 오차: ${Math.round(offset)}ms`);
        }
    }, [isRunning]);

    // 부모 triggerInput 감지
    useEffect(() => {
        if (triggerInput !== prevTriggerRef.current) {
            handleInput();
            prevTriggerRef.current = triggerInput;
        }
    }, [triggerInput, handleInput]);

    const finishTest = () => {
        setIsRunning(false);
        cancelAnimationFrame(animationFrameRef.current);
        const validOffsets = offsetsRef.current;

        if (validOffsets.length > 0) {
            const avg = Math.round(validOffsets.reduce((a, b) => a + b, 0) / validOffsets.length);
            onComplete(avg);
        } else {
            onComplete(0);
        }
    };

    return (
        <div
            ref={containerRef}
            style={styles.container}
        >
            <canvas
                ref={canvasRef}
                style={styles.canvas}
                width={CONFIG.WIDTH}
                height={CONFIG.HEIGHT}
            />

            {/* 오버레이 UI */}
            {!isRunning && (
                <div style={styles.overlay}>
                    <h2 style={{color: 'white', fontSize: '28px', marginBottom: '10px'}}>리듬 싱크 테스트</h2>
                    <p style={{color: '#ddd', marginBottom: '30px'}}>
                        총 4번의 비트가 나옵니다.<br/>
                        판정선이 노트에 정중앙에 위치할 때 박수/키보드를 쳐주세요!
                    </p>
                    <button
                        onClick={(e) => { e.stopPropagation(); startTest(); }}
                        style={styles.startBtn}
                    >
                        테스트 시작 ▶
                    </button>
                </div>
            )}

            {/* 상태 메시지 (테스트 중 표시) */}
            {isRunning && (
                <div style={styles.debugMsg}>
                    {message}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        height: '100%',
        position: 'relative' as const,
        backgroundColor: '#c7f8f5',
        borderRadius: '15px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    canvas: {
        // 캔버스를 컨테이너 크기에 맞게 줄여서 보여줌 (비율 유지)
        maxWidth: '100%',
        maxHeight: '100%',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    },
    overlay: {
        position: 'absolute' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20
    },
    startBtn: {
        padding: '15px 50px',
        fontSize: '22px',
        fontWeight: 'bold',
        borderRadius: '30px',
        border: 'none',
        background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
        color: 'white',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.5)',
    },
    debugMsg: {
        position: 'absolute' as const,
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '5px 15px',
        borderRadius: '15px',
        fontSize: '14px',
        pointerEvents: 'none' as const,
    }
};

export default SyncTester;