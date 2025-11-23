export interface SurveyQuestion {
    id: number;
    text: string;
}

export interface SurveyOption {
    score: number;
    label: string;
}

export interface SurveyConfig {
    id: string;
    title: string;
    description: string;
    type: 'ADULT' | 'CHILD';
    options: SurveyOption[];
    questions: SurveyQuestion[];
}