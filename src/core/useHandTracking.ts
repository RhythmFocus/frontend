import { useEffect, useRef, useState } from 'react';
import {
  FilesetResolver,
  HandLandmarker,
  HandLandmarkerResult
} from '@mediapipe/tasks-vision';

export const useHandTracking = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [landmarks, setLandmarks] = useState<HandLandmarkerResult | null>(null);

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2, // 2개의 손까지 인식합니다.
          // 탐지 민감도 (새로운 손인지)
          minHandDetectionConfidence: 0.4,
          // 존재 신뢰도 (진짜 손인지 최종적인 판단)
          minHandPresenceConfidence: 0.4,
          // 추적 민감도 조정 (이미 잡은 손을 다음 프레임에도 따라가는 정도)
          minTrackingConfidence: 0.4
        });

        setIsLoaded(true);
        startWebcam();
      } catch (error) {
        console.error("MediaPipe Setup Error:", error);
      }
    };

    const startWebcam = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Webcam not supported");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 60 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictLoop);
        }
      } catch (err) {
        console.error("Webcam Permission Error:", err);
      }
    };

    const predictLoop = () => {
      if (!handLandmarker || !videoRef.current) return;

      if (videoRef.current.currentTime > 0 && !videoRef.current.paused) {
          const startTimeMs = performance.now();
          const result = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

          // 손이 없어도 상태를 업데이트하도록 변경
          setLandmarks(result);
      }
      animationFrameId = requestAnimationFrame(predictLoop);
    };

    setupMediaPipe();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handLandmarker) handLandmarker.close();
    };
  }, []);

  return { videoRef, isLoaded, landmarks };
};