import { Note, HitFeedback } from '../types/game.types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private readonly HIGHWAY_TOP = 300;
  private readonly HIGHWAY_HEIGHT = 120;
  private readonly NOTE_RADIUS = 30;
  
  // 캐릭터 이미지
  private characterIdleImg: HTMLImageElement | null = null;
  private characterHitImg: HTMLImageElement | null = null;
  private imagesLoaded = false;

  constructor(
    canvas: HTMLCanvasElement,
    private width: number,
    private height: number
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);

    this.loadCharacterImages();
  }

  private loadCharacterImages() {
        
    this.characterIdleImg = new Image();
    this.characterIdleImg.src = '/character-idle.png'; // 망치 치기 전
    this.characterIdleImg.onload = () => this.checkImagesLoaded();

    this.characterHitImg = new Image();
    this.characterHitImg.src = '/character-hit.png'; // 망치 치는 중
    this.characterHitImg.onload = () => this.checkImagesLoaded();
  }

  private checkImagesLoaded() {
    if (this.characterIdleImg?.complete && this.characterHitImg?.complete) {
      this.imagesLoaded = true;
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#7dd3fc');
    gradient.addColorStop(1, '#38bdf8');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawSingleLane() {
    const y = this.HIGHWAY_TOP;
    
    // 트랙 배경
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.fillRect(50, y, this.width - 100, this.HIGHWAY_HEIGHT);
    
    // 트랙 테두리
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(50, y, this.width - 100, this.HIGHWAY_HEIGHT);
    
    // 트랙 위아래 라인
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(50, y + 10);
    this.ctx.lineTo(this.width - 50, y + 10);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(50, y + this.HIGHWAY_HEIGHT - 10);
    this.ctx.lineTo(this.width - 50, y + this.HIGHWAY_HEIGHT - 10);
    this.ctx.stroke();
  }

  drawJudgmentLine(x: number) {
    const y = this.HIGHWAY_TOP;
    
    // 판정선 그라디언트
    const gradient = this.ctx.createLinearGradient(
      x, y, x, y + this.HIGHWAY_HEIGHT
    );
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(0.5, '#00ffff');
    gradient.addColorStop(1, '#fff');
    
    // 발광 효과
    this.ctx.shadowColor = 'rgba(0, 255, 255, 1)';
    this.ctx.shadowBlur = 25;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x - 3, y, 6, this.HIGHWAY_HEIGHT);
    this.ctx.shadowBlur = 0;
  }

  drawCharacter(x: number, isHitting: boolean) {
    const y = this.HIGHWAY_TOP - 120;
    const charWidth = 150;
    const charHeight = 150;

    if (!this.imagesLoaded) {
      // 이미지 로딩 중이면 이모지로 대체
      this.ctx.font = '120px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(isHitting ? '🔨' : '🐮', x, y);
      return;
    }

    const img = isHitting ? this.characterHitImg : this.characterIdleImg;
    if (img) {
      this.ctx.drawImage(
        img,
        x - charWidth / 2,
        y - charHeight / 2,
        charWidth,
        charHeight
      );
    }
  }

  drawNote(note: Note) {
    const x = note.x;
    const y = this.HIGHWAY_TOP + this.HIGHWAY_HEIGHT / 2;

    // 노트 그라디언트
    const gradient = this.ctx.createRadialGradient(
      x, y, 0,
      x, y, this.NOTE_RADIUS
    );
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.6, '#FFA500');
    gradient.addColorStop(1, '#FF8C00');

    // 발광 효과
    this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    this.ctx.shadowBlur = 20;
    
    // 노트 원
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.NOTE_RADIUS, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 테두리
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    this.ctx.shadowBlur = 0;

    // 손바닥 이모지
    this.ctx.font = 'bold 28px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText('👏', x, y);
  }

  drawHitFeedback(feedback: HitFeedback) {
    const age = performance.now() - feedback.timestamp;
    const progress = Math.min(age / 1000, 1);
    const opacity = 1 - progress;

    if (opacity <= 0) return;

    const x = feedback.x;
    const y = this.HIGHWAY_TOP - 50 - progress * 50;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;

    // 판정 텍스트
    const judgmentColors = {
      PERFECT: '#ffd700',
      GOOD: '#2ed573',
      BAD: '#ffa502',
      MISS: '#ff4757',
    };

    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillStyle = judgmentColors[feedback.judgment];
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 8;
    this.ctx.fillText(feedback.judgment, x, y);

    // 타이밍 오차
    if (feedback.judgment !== 'MISS') {
      const offsetText = feedback.offset > 0
        ? `-${Math.abs(feedback.offset).toFixed(0)}ms`
        : `+${Math.abs(feedback.offset).toFixed(0)}ms`;
      
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = feedback.offset > 0 ? '#ff4757' : '#2ed573';
      this.ctx.fillText(offsetText, x, y + 35);
    }
    
    this.ctx.shadowBlur = 0;
    this.ctx.restore();
  }

  drawNotes(notes: Note[]) {
    notes.forEach(note => this.drawNote(note));
  }

  drawHitFeedbacks(feedbacks: HitFeedback[]) {
    feedbacks.forEach(feedback => this.drawHitFeedback(feedback));
  }

  render(
    notes: Note[],
    hitFeedbacks: HitFeedback[],
    judgmentLineX: number,
    isCharacterHitting: boolean
  ) {
    this.clear();
    this.drawBackground();
    this.drawSingleLane();
    this.drawNotes(notes);
    this.drawJudgmentLine(judgmentLineX);
    this.drawCharacter(judgmentLineX, isCharacterHitting);
    this.drawHitFeedbacks(hitFeedbacks);
  }
}