export interface SurveyQuestion {
    id: number;
    text: string;
    isReverse?: boolean; // 역채점 문항 여부
}

export interface SurveyConfig {
    id: string;
    title: string;
    description: string;
    type: 'ADULT' | 'CHILD';
    questions: SurveyQuestion[];
    options: { score: number; label: string }[]; // 선택지 (예: 0점-전혀아님)
    cutOffScore: number; // 진단 기준 점수
}
