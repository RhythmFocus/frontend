import React, { useEffect, useRef } from 'react';
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

  // 랜드마크가 바뀔 때마다 캔버스에 그리기
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

    // 감지된 손이 있으면 반복문으로 모두 그리기
    if (landmarks.landmarks.length > 0) {
      landmarks.landmarks.forEach((hand) => {

        // 1. 뼈대(Line) 그리기
        ctx.strokeStyle = '#00FF00'; // 녹색 선
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
  }, [landmarks]);

  return (
    <div style={styles.container}>
      <div style={styles.statusBadge}>
        {isLoaded ? "Motion Ready" : "Loading Model..."}
      </div>

      {/* 비디오와 캔버스를 겹쳐서 배치 */}
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
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    width: '320px', // 조금 더 키움
    height: '240px',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 9999,
    border: '2px solid rgba(255,255,255,0.2)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
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
    padding: '4px 10px',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: '12px',
    borderRadius: '15px',
    zIndex: 10,
    fontWeight: 'bold',
  },
  detectIndicator: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    color: '#00ff00',
    fontWeight: 'bold',
    textShadow: '0 0 4px black',
    zIndex: 10,
  }
};

export default MotionOverlay;