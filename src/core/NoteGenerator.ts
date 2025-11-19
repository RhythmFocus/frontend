import { Note, Difficulty, DifficultyConfig } from '../types/game.types';

export class NoteGenerator {
  private currentBPM: number = 120;
  private readonly BASE_CONFIGS: Record<Difficulty, DifficultyConfig> = {
    easy: {
      duration: 10000,
      interval: 1000,
      laneCount: 1,
      randomness: 0,
      bpm: 60,
    },
    normal: {
      duration: 10000,
      interval: 600,
      laneCount: 1,
      randomness: 50,
      bpm: 100,
    },
    hard: {
      duration: 10000,
      interval: 400,
      laneCount: 1,
      randomness: 100,
      bpm: 150,
    },
  };

  private currentConfig: DifficultyConfig;
  private noteIdCounter: number = 0;
  private nextNoteTime: number = 1000;

  constructor(initialDifficulty: Difficulty = 'normal') {
    this.currentConfig = { ...this.BASE_CONFIGS[initialDifficulty] };
    this.currentBPM = this.currentConfig.bpm;
    console.log(`✅ 게임 초기화: ${this.currentBPM} BPM, ${this.currentConfig.interval}ms`);
  }

  // 난이도 상승 (BPM 증가)
  increaseDifficulty(): void {
    const oldBPM = this.currentBPM;
    this.currentBPM = Math.min(this.currentBPM + 10, 200); // 최대 200 BPM
    
    if (this.currentBPM !== oldBPM) {
      this.currentConfig.interval = 60000 / this.currentBPM;
      console.log(`🔼 난이도 상승: ${oldBPM} → ${this.currentBPM} BPM (${this.currentConfig.interval.toFixed(0)}ms)`);
    }
  }

  // 난이도 하강 (BPM 감소)
  decreaseDifficulty(): void {
    const oldBPM = this.currentBPM;
    this.currentBPM = Math.max(this.currentBPM - 10, 40); // 최소 40 BPM
    
    if (this.currentBPM !== oldBPM) {
      this.currentConfig.interval = 60000 / this.currentBPM;
      console.log(`🔽 난이도 하강: ${oldBPM} → ${this.currentBPM} BPM (${this.currentConfig.interval.toFixed(0)}ms)`);
    }
  }

  adjustDifficulty(averageOffset: number, missRate: number): boolean {
    const TARGET_RANGE = 20;
    const HIGH_MISS_RATE = 0.3;
    const oldBPM = this.currentBPM;

    let changed = false;

    if (missRate > HIGH_MISS_RATE) {
      this.currentBPM = Math.max(this.currentBPM - 10, 40);
      changed = true;
    } else if (Math.abs(averageOffset) < TARGET_RANGE / 2) {
      this.currentBPM = Math.min(this.currentBPM + 5, 180);
      changed = true;
    } else if (Math.abs(averageOffset) > TARGET_RANGE * 1.5) {
      this.currentBPM = Math.max(this.currentBPM - 5, 40);
      changed = true;
    }

    if (changed) {
      this.currentConfig.interval = 60000 / this.currentBPM;
      console.log(`🔄 난이도 변경: ${oldBPM} → ${this.currentBPM} BPM (${this.currentConfig.interval.toFixed(0)}ms)`);
    }

    return changed;
  }

  getNextNote(): Note {
    const maxRandomness = this.currentConfig.interval * 0.1;
    const randomOffset =
      this.currentConfig.randomness > 0
        ? (Math.random() - 0.5) * 2 * Math.min(this.currentConfig.randomness, maxRandomness)
        : 0;

    const note: Note = {
      id: `note-${this.noteIdCounter++}`,
      time: Math.round(this.nextNoteTime + randomOffset),
      lane: 0,
      x: 0,
      isHit: false,
    };

    this.nextNoteTime += this.currentConfig.interval;
    return note;
  }

  syncToCurrentTime(currentTime: number): void {
  }

  getNextNoteTime(): number {
    return this.nextNoteTime;
  }

  getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
    return this.currentConfig;
  }

  getCurrentBPM(): number {
    return this.currentBPM;
  }

  getCurrentInterval(): number {
    return this.currentConfig.interval;
  }

  reset() {
    this.nextNoteTime = 1000;
    this.noteIdCounter = 0;
  }
}