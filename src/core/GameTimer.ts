export class GameTimer {
  private musicStartTime: number = 0;
  private isPaused: boolean = false;
  private pausedTime: number = 0;

  start() {
    this.musicStartTime = performance.now();
  }

  getCurrentTime(): number {
    if (this.isPaused) {
      return this.pausedTime;
    }
    return performance.now() - this.musicStartTime;
  }

  pause() {
    this.isPaused = true;
    this.pausedTime = this.getCurrentTime();
  }

  resume() {
    this.isPaused = false;
    this.musicStartTime = performance.now() - this.pausedTime;
  }

  reset() {
    this.musicStartTime = 0;
    this.isPaused = false;
    this.pausedTime = 0;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }
}