import React, { useEffect, useRef, useState } from 'react';
import { useHandTracking } from '../core/useHandTracking';

// 손가락 뼈대 연결 정보 (MediaPipe 표준)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // 엄지
  [0, 5], [5, 6], [6, 7], [7, 8], // 검지
  [0, 9], [9, 10], [10, 11], [11, 12], // 중지
  [0, 13], [13, 14], [14, 15], [15, 16], // 약지
  [0, 17], [17, 18], [18, 19], [19, 20], // 소지
  [5, 9], [9, 13], [13, 17] // 손바닥 연결
];

// Props 타입 정의 추가
type CalibrationStatus = 'no_hand' | 'too_far' | 'too_close' | 'perfect';

interface MotionOverlayProps {
    onStatusChange?: (status: CalibrationStatus) => void;
    onClap?: () => void;
}

// 함수 인자에 props 추가
const MotionOverlay: React.FC<MotionOverlayProps> = ({ onStatusChange, onClap }) => {
    const { videoRef, isLoaded, landmarks } = useHandTracking();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [clapDetected, setClapDetected] = useState(false);

    const [calibrationMsg, setCalibrationMsg] = useState<{status: CalibrationStatus, text: string}>({
        status: 'no_hand',
        text: '카메라에 손을 보여주세요'
    });

    const prevHandCount = useRef(0);
    const prevDistRatio = useRef(10.0);
    const prevVelocity = useRef(0);
    const clapCooldown = useRef(false);

    const getDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const triggerClap = () => {
        setClapDetected(true);
        clapCooldown.current = true;
        if (onClap) onClap();
        setTimeout(() => setClapDetected(false), 200);
        setTimeout(() => { clapCooldown.current = false; }, 300);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video || !landmarks) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        const currentHands = landmarks.landmarks;
        const currentHandCount = currentHands.length;

        // 손 그리기 및 거리 판단
        if (currentHandCount > 0) {
            const hand = currentHands[0];
            const palmSize = getDistance(hand[0], hand[9]);
            const isEdgeTouching = hand.some(p => p.x < 0.05 || p.x > 0.95 || p.y < 0.05 || p.y > 0.95);

            let newStatus: CalibrationStatus = 'perfect';
            let newText = "거리 완벽함! (Perfect)";

            if (palmSize < 0.12) {
                newStatus = 'too_far';
                newText = "더 가까이 와주세요 (Too Far)";
            } else if (palmSize > 0.35 || isEdgeTouching) {
                newStatus = 'too_close';
                newText = "조금 뒤로 가주세요 (Too Close)";
            }

            // 부모에게 상태 전달 (값이 변했을 때만)
            setCalibrationMsg(prev => {
                if (prev.status !== newStatus && onStatusChange) {
                    onStatusChange(newStatus);
                }
                return prev.status === newStatus ? prev : { status: newStatus, text: newText };
            });

            // 그리기 로직
            currentHands.forEach((h) => {
                const strokeColor = newStatus === 'perfect' ? '#00FF00' : '#FFD700';
                ctx.strokeStyle = strokeColor;
                HAND_CONNECTIONS.forEach(([start, end]) => {
                    const first = h[start];
                    const second = h[end];
                    ctx.beginPath();
                    ctx.moveTo(first.x * canvas.width, first.y * canvas.height);
                    ctx.lineTo(second.x * canvas.width, second.y * canvas.height);
                    ctx.stroke();
                });

                ctx.fillStyle = '#FF0000';
                h.forEach((point) => {
                    ctx.beginPath();
                    ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
                    ctx.fill();
                });
            });
        } else {
            // 손이 없을 때도 부모에게 알림
            setCalibrationMsg(prev => {
                if (prev.status !== 'no_hand' && onStatusChange) {
                    onStatusChange('no_hand');
                }
                return prev.status === 'no_hand' ? prev : { status: 'no_hand', text: '카메라에 손을 보여주세요' };
            });
        }

        if (!clapCooldown.current) {
            if (currentHandCount === 2) {
                const hand1 = currentHands[0];
                const hand2 = currentHands[1];
                const size = (getDistance(hand1[0], hand1[9]) + getDistance(hand2[0], hand2[9])) / 2;
                const dist = getDistance(hand1[0], hand2[0]);
                const currentRatio = dist / size;
                const velocity = currentRatio - prevDistRatio.current;

                if (currentRatio < 0.8 && velocity < -0.05) {
                    triggerClap();
                }
                prevDistRatio.current = currentRatio;
                prevVelocity.current = velocity;
            }
            else if (currentHandCount < 2 && prevHandCount.current === 2) {
                if (prevDistRatio.current < 3.0 && prevVelocity.current < -0.1) {
                    triggerClap();
                    prevDistRatio.current = 10.0;
                }
            }
        }
        prevHandCount.current = currentHandCount;
    }, [landmarks, onStatusChange]);

    const getStatusColor = (s: CalibrationStatus) => {
        switch(s) {
            case 'perfect': return '#2ecc71';
            case 'too_close': return '#e74c3c';
            case 'too_far': return '#f1c40f';
            default: return '#95a5a6';
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.statusBadge}>
                {isLoaded ? "System Ready" : "Loading..."}
            </div>

            {isLoaded && (
                <div style={{
                    ...styles.feedbackMessage,
                    backgroundColor: getStatusColor(calibrationMsg.status)
                }}>
                    {calibrationMsg.text}
                </div>
            )}

            <div style={styles.videoWrapper}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={styles.media}
                />
                <canvas
                    ref={canvasRef}
                    style={styles.media}
                />
                {clapDetected && (
                    <div style={styles.clapIndicator}>CLAP!</div>
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000',
    },
    videoWrapper: {
        position: 'relative',
        width: '100%',
        height: '100%',
        transform: 'scaleX(-1)',
    },
    media: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    statusBadge: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        padding: '6px 12px',
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid #fff',
        color: '#fff',
        fontSize: '12px',
        borderRadius: '20px',
        zIndex: 10,
        fontWeight: 'bold',
    },
    feedbackMessage: {
        position: 'absolute',
        top: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
        borderRadius: '30px',
        zIndex: 15,
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        transition: 'background-color 0.3s ease',
        textAlign: 'center',
        minWidth: '200px',
    },
    clapIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scaleX(-1)',
        fontSize: '80px',
        fontWeight: '900',
        color: '#FFF200',
        zIndex: 20,
        textShadow: '0 0 20px rgba(255, 242, 0, 0.8)',
        animation: 'popIn 0.1s ease-out',
        whiteSpace: 'nowrap',
    }
};

export default MotionOverlay;