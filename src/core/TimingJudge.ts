import { GameTimer } from './GameTimer';
import { Note, JudgmentResult, Judgment } from '../types/game.types';

export class TimingJudge {
  private readonly PERFECT_WINDOW = 10; // ±10ms
  private readonly GOOD_WINDOW = 30;    // ±30ms
  private readonly BAD_WINDOW = 50;     // ±50ms

  constructor(private gameTimer: GameTimer) {}

  calculateOffset(note: Note): number {
    const inputTime = this.gameTimer.getCurrentTime();
    const noteTime = note.time;
    return inputTime - noteTime;
  }

  judge(note: Note): JudgmentResult {
    const offset = this.calculateOffset(note);
    const absOffset = Math.abs(offset);

    let judgment: Judgment;
    let score: number;

    if (absOffset <= this.PERFECT_WINDOW) {
      judgment = 'PERFECT';
      score = 100;
    } else if (absOffset <= this.GOOD_WINDOW) {
      judgment = 'GOOD';
      score = 70;
    } else if (absOffset <= this.BAD_WINDOW) {
      judgment = 'BAD';
      score = 30;
    } else {
      judgment = 'MISS';
      score = 0;
    }

    return {
      judgment,
      score,
      offset,
      isFast: offset < 0,
      isSlow: offset > 0,
      absOffset,
    };
  }
}