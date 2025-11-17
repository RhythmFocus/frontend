export type Difficulty = 'easy' | 'normal' | 'hard';
export type Judgment = 'PERFECT' | 'GOOD' | 'BAD' | 'MISS';

export interface Note {
  id: string;
  time: number;
  lane: number;
  x: number;
  isHit: boolean;
}

export interface HitFeedback {
  id: string;
  x: number;
  y: number;
  offset: number;
  judgment: Judgment;
  timestamp: number;
}

export interface JudgmentResult {
  judgment: Judgment;
  score: number;
  offset: number;
  isFast: boolean;
  isSlow: boolean;
  absOffset: number;
}

export interface GameState {
  score: number;
  combo: number;
  maxCombo: number;
  accuracy: number;
  averageOffset: number;
  judgmentCounts: {
    perfect: number;
    good: number;
    bad: number;
    miss: number;
  };
  totalNotes: number;
}

export interface DifficultyConfig {
  duration: number;
  interval: number;
  laneCount: number;
  randomness: number;
  bpm: number;
}