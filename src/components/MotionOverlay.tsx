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

const MotionOverlay: React.FC = () => {
  const { videoRef, isLoaded, landmarks } = useHandTracking();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clapDetected, setClapDetected] = useState(false);

  // 박수 인식 알고리즘용 Ref 변수
  const prevHandCount = useRef(0);      // 이전 프레임 손 개수
  const prevDistRatio = useRef(10.0);   // 이전 프레임 거리 비율
  const prevVelocity = useRef(0);       // 이전 프레임 속도 (변화량)
  const clapCooldown = useRef(false);   // 중복 인식 방지

  // 거리 계산 헬퍼
  const getDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // 박수 트리거 함수
  const triggerClap = () => {
    // console.log("Clap Detected!");
    setClapDetected(true);
    clapCooldown.current = true;

    // UI 표시 시간 (0.2초)
    setTimeout(() => setClapDetected(false), 200);
    // 박수 인식 쿨다운 (일단은 0.4초)
    setTimeout(() => { clapCooldown.current = false; }, 400);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !landmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기를 비디오 크기와 일치시킴
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 그리기 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const currentHands = landmarks.landmarks;
    const currentHandCount = currentHands.length;

    // 1. 손 그리기
    if (currentHandCount > 0) {
      currentHands.forEach((hand) => {
        ctx.strokeStyle = '#00FF00';
        HAND_CONNECTIONS.forEach(([start, end]) => {
          const first = hand[start];
          const second = hand[end];

          ctx.beginPath();
          ctx.moveTo(first.x * canvas.width, first.y * canvas.height);
          ctx.lineTo(second.x * canvas.width, second.y * canvas.height);
          ctx.stroke();
        });

        // 2. 관절(Point) 그리기
        ctx.fillStyle = '#FF0000'; // 빨간 점
        hand.forEach((point) => {
          ctx.beginPath();
          // x, y는 0~1 정규화된 값이므로 캔버스 크기를 곱해야 함
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
    }

    //  박수를 인식하는 부분
    if (!clapCooldown.current) {

      // Case A: 손이 2개일 때 (가까워지는 중인지 확인)
      if (currentHandCount === 2) {
        const hand1 = currentHands[0];
        const hand2 = currentHands[1];

        // 손 크기(Reference) 측정 (손목~중지) -> 상대적인 거리를 재기 위해
        const size = (getDistance(hand1[0], hand1[9]) + getDistance(hand2[0], hand2[9])) / 2;
        // 두 손목 사이 거리
        const dist = getDistance(hand1[0], hand2[0]);

        // 비율 계산
        const currentRatio = dist / size;

        // 속도(Velocity) 계산: (현재 - 과거). 음수면 가까워짐, 양수면 멀어짐
        const velocity = currentRatio - prevDistRatio.current;

        // Ratio가 임곗값 아래고, 빠르게 가까워지는 중(-0.05)이라면 박수로 인정
        // 멀어질 때(velocity > 0)는 인식 안 함
        if (currentRatio < 0.8 && velocity < -0.05) {
             triggerClap();
        }

        // 상태 업데이트
        prevDistRatio.current = currentRatio;
        prevVelocity.current = velocity;
      }
      // Case B: 손이 사라짐 (손이 2개 미만, 이전 인식 손 개수가 2개)
      else if (currentHandCount < 2 && prevHandCount.current === 2) {
          // 사라지기 직전에 거리가 가까웠고(3.0 미만), 빠르게 다가오고 있었다면(-0.1 미만)
          if (prevDistRatio.current < 3.0 && prevVelocity.current < -0.1) {
              triggerClap();
              // 중복 방지 리셋
              prevDistRatio.current = 10.0;
          }
      }
    }

    prevHandCount.current = currentHandCount;
  }, [landmarks]);

  return (
    <div style={styles.container}>
      <div style={styles.statusBadge}>
        {isLoaded ? "Motion Ready" : "Loading Model..."}
      </div>

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
    transform: 'scaleX(-1)', // 거울 모드 (비디오+캔버스 같이 반전)
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
  clapIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '80px',
    fontWeight: '900',
    color: '#FFF200',
    zIndex: 20,
    textShadow: '0 0 20px rgba(255, 242, 0, 0.8)',
    animation: 'popIn 0.1s ease-out',
  }
};

export default MotionOverlay;