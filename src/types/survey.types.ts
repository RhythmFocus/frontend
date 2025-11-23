export interface BaseSurveyQuestion {
    id: number;
    text: string;
    type: 'standard' | 'multiple-choice';
}

export interface StandardQuestion extends BaseSurveyQuestion {
    type: 'standard'; // Discriminator
}

export interface MultipleChoiceQuestion extends BaseSurveyQuestion {
    type: 'multiple-choice'; // Discriminator
    choices: Array<{ // Each choice has a score and its specific text
        score: number;
        text: string;
    }>;
}

export type SurveyQuestion = StandardQuestion | MultipleChoiceQuestion;

export interface SurveyOption {
    score: number;
    label: string;
}

export interface SurveyConfig {
    id: string;
    title: string;
    description: string;
    type: 'ADULT' | 'CHILD';
    options?: SurveyOption[];
    questions: SurveyQuestion[];
}