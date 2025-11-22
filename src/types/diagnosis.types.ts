export type DiagnosisType = 'STROOP' | 'N_BACK' | 'SNAP_IV' | 'ASRS' | 'CFQ';
export type InputMethod = 'MOUSE' | 'KEYBOARD';
export type DiagnosisStatus = 'NOT_STARTED' | 'COMPLETED';
export type DiagnosisGrade = 'PERFECT' | 'GOOD' | 'BAD' | null;

export interface DiagnosisItem {
    id: string;
    type: DiagnosisType;
    title: string;
    category: string; // 예: '집중력', 'ADHD'
    categoryColor: string; // 예: '#ff6b6b' (분홍), '#6ab04c' (초록)
    inputMethod: InputMethod;
    status: DiagnosisStatus;
    grade: DiagnosisGrade;
    description: string; // 예: '마우스 사용', '키보드 사용'
}