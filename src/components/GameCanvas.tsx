import { useEffect, useRef } from 'react';
import { Note, HitFeedback } from '../types/game.types';
import { CanvasRenderer } from '../core/CanvasRenderer';

interface GameCanvasProps {
  notes: Note[];
  hitFeedbacks: HitFeedback[];
  judgmentLineX: number;
  isCharacterHitting: boolean;
  onCanvasClick: () => void;
}

export function GameCanvas({
  notes,
  hitFeedbacks,
  judgmentLineX,
  isCharacterHitting,
  onCanvasClick,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 600;

  useEffect(() => {
    if (!canvasRef.current) return;
    
    rendererRef.current = new CanvasRenderer(
      canvasRef.current,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );
  }, []);

  useEffect(() => {
    if (!rendererRef.current) return;

    const render = () => {
      rendererRef.current!.render(
        notes,
        hitFeedbacks,
        judgmentLineX,
        isCharacterHitting
      );
    };

    render();
  }, [notes, hitFeedbacks, judgmentLineX, isCharacterHitting]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onCanvasClick}
      style={{
        display: 'block',
        margin: '0 auto',
        cursor: 'pointer',
        borderRadius: '12px',
      }}
    />
  );
}