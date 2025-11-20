import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasRenderer } from '../core/CanvasRenderer';
import { Note } from '../types/game.types';

export interface SyncTestResult {
    offset: number;       // 보정값
    success: boolean;     // 성공 여부
    message: string;      // 결과 메시지 (성공 시 칭찬, 실패 시 원인)
    stdDev: number;       // 표준편차
}

interface SyncTesterProps {
    onComplete: (result: SyncTestResult) => void;
    triggerInput: boolean; // 부모(박수/키보드)로부터 오는 입력 신호
}

const CONFIG = {
    WIDTH: 1280,
    HEIGHT: 720,
    BPM: 120,
    NOTE_SPEED: 100,
    JUDGMENT_LINE_X: 1050, // 판정선 위치
    TOTAL_BEATS: 6,
    INTERVAL: 2000, // 120BPM -> 500ms 간격
};

const calculateStats = (data: number[]) => {
    if (data.length === 0) return { mean: 0, stdDev: 0 };

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    return { mean, stdDev: Math.sqrt(variance) };
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
    const offsetsRef = useRef<number[]>([]);
    const beatIndexRef = useRef(0);
    const isCharacterHittingRef = useRef(false);

    // 입력 중복 방지
    const prevTriggerRef = useRef(triggerInput);

    // 1. 초기화
    useEffect(() => {
        if (canvasRef.current) {
            rendererRef.current = new CanvasRenderer(canvasRef.current, CONFIG.WIDTH, CONFIG.HEIGHT);
            rendererRef.current.render([], [], CONFIG.JUDGMENT_LINE_X, false);
        }
    }, []);

    // 2. 테스트 시작
    const startTest = () => {
        if (!rendererRef.current) return;
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setIsRunning(true);
        offsetsRef.current = [];
        beatIndexRef.current = -1;
        const startDelay = 1000;
        startTimeRef.current = performance.now() + startDelay;

        const newNotes: Note[] = [];
        for (let i = 0; i < CONFIG.TOTAL_BEATS; i++) {
            newNotes.push({
                id: `test-${i}`,
                time: startTimeRef.current + (i * CONFIG.INTERVAL),
                lane: 1, x: 0, isHit: false
            });
        }
        notesRef.current = newNotes;
        loop();
    };

    // 3. 렌더링 루프
    const loop = () => {
        const now = performance.now();
        const timeSinceStart = now - startTimeRef.current;
        const currentBeatIndex = Math.floor((timeSinceStart + 50) / CONFIG.INTERVAL);

        if (currentBeatIndex >= 0 && currentBeatIndex < CONFIG.TOTAL_BEATS && currentBeatIndex > beatIndexRef.current) {
            playBeat();
            beatIndexRef.current = currentBeatIndex;
        }

        notesRef.current.forEach(note => {
            note.x = CONFIG.JUDGMENT_LINE_X - ((note.time - now) * CONFIG.NOTE_SPEED) / 1000;
        });

        if (rendererRef.current) {
            const visibleNotes = notesRef.current.filter(n => !n.isHit);
            rendererRef.current.render(visibleNotes, [], CONFIG.JUDGMENT_LINE_X, isCharacterHittingRef.current);
        }

        if (now > startTimeRef.current + ((CONFIG.TOTAL_BEATS - 1) * CONFIG.INTERVAL) + 1500) {
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
        setTimeout(() => { isCharacterHittingRef.current = false; }, 500); // 0.5초 타격 모션

        // 판정 범위 내(-200ms ~ +200ms)에 있는 가장 가까운 노트 찾기
        const targetNote = notesRef.current.find(n =>
            !n.isHit && Math.abs(n.time - now) < 400 // 범위를 좀 넉넉하게 잡음
        );

        if (targetNote) {
            const offset = now - targetNote.time; // 양수=Late, 음수=Early
            offsetsRef.current.push(offset);
            targetNote.isHit = true;
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

        let rawOffsets = [...offsetsRef.current];

        // 1. 입력 부족 실패
        if (rawOffsets.length < CONFIG.TOTAL_BEATS / 2) {
            onComplete({
                success: false,
                offset: 0,
                message: "누락된 입력이 너무 많습니다! (최소 4회 이상)",
                stdDev: 0
            });
            return;
        }

        // 2. 통계 계산
        rawOffsets.sort((a, b) => a - b);
        if (rawOffsets.length >= 5) {
            rawOffsets = rawOffsets.slice(1, rawOffsets.length - 1); // Min/Max 절사
        }

        const { mean, stdDev } = calculateStats(rawOffsets);
        const MAX_ALLOWED_STD_DEV = 45; // 허용 편차 (ms)

        // 3. 불안정 실패
        if (stdDev > MAX_ALLOWED_STD_DEV) {
            onComplete({
                success: false,
                offset: Math.round(mean),
                message: `입력이 균일하지 않습니다! (편차 ±${Math.round(stdDev)}ms)`,
                stdDev: stdDev
            });
        } else {
            // 4. 성공
            onComplete({
                success: true,
                offset: Math.round(mean),
                message: "측정 완료",
                stdDev: stdDev
            });
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
                        총 6번의 비트가 나옵니다.<br/>
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
        width: '100%',
        height: '100%',
        objectFit: 'contain' as const,
        display: 'block',
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