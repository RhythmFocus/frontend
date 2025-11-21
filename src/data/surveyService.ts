import { SurveyConfig } from '../types/survey.types';
import { ASRS_DATA } from './asrs';
import { SNAP_IV_DATA } from './snap_iv';

// ID를 받아서 해당 데이터를 리턴하는 헬퍼 함수
export const getSurveyDataById = (id: string): SurveyConfig | null => {
    switch (id) {
        case 'ASRS':
            return ASRS_DATA;
        case 'SNAP-IV':
            return SNAP_IV_DATA;
        default:
            return null;
    }
};