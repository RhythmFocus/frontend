// src/types/survey.types.ts

export interface SurveyQuestion {
    id: number;
    text: string;
}

export interface SurveyOption {
    score: number;
    label: string;
}

// 👇 채점 기준 등은 다 빼고 '화면 표시용' 정보만 남깁니다.
export interface SurveyConfig {
    id: string;
    title: string;
    description: string;
    type: 'ADULT' | 'CHILD';
    options: SurveyOption[];
    questions: SurveyQuestion[];
}