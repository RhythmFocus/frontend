import { SurveyConfig } from '../types/survey.types';

// SNAP-IV 전용 진단 기준 (성별 및 하위척도별 절단점)
interface SNAPIVDiagnosticCriteria {
    type: 'ARI_PER_SUBSCALES_BY_GENDER';
    description: string;
    cutOffs: {
        // 논문 Table 8: 남자 1.5 SD (93 percentile) 절단점
        male: {
            inattention: number; // 1.38
            hyperImpulsivity: number; // 0.98
        };
        // 논문 Table 8: 여자 1.5 SD (93 percentile) 절단점
        female: {
            inattention: number; // 1.02
            hyperImpulsivity: number; // 0.62
        };
    };
}

// SNAP-IV의 하위 척도 구성 정보
interface SNAPIVSubscale {
    name: 'Inattention' | 'Hyperactivity/Impulsivity';
    itemIds: number[]; // 문항 ID 배열
    itemCount: number;
}

// SNAP-IV 데이터 구성을 위한 확장 인터페이스
export interface SNAPIVSurveyConfig extends SurveyConfig {
    subscales: SNAPIVSubscale[];
    diagnosticCriteria: SNAPIVDiagnosticCriteria;
}

export const SNAP_IV_DATA: SNAPIVSurveyConfig = {
    id: 'SNAP-IV',
    title: 'SNAP-IV 부모용 척도 (단축형)',
    description: '귀하의 아동의 행동에 대해 지난 6개월 동안 가장 적합한 문항을 표시하십시오. (총 18문항)',
    type: 'CHILD',

    options: [
        { score: 0, label: '전혀 그렇지 않다' },
        { score: 1, label: '약간 그렇다' },
        { score: 2, label: '꽤 그렇다' },
        { score: 3, label: '아주 많이 그렇다' },
    ],

    // 단일 cutOffScore는 사용하지 않으므로 0으로 설정
    cutOffScore: 0,

    // (논문 Table 6 및 일반적인 SNAP-IV 구성 기준)
    subscales: [
        {
            name: 'Inattention', // 부주의성
            itemIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            itemCount: 9
        },
        {
            name: 'Hyperactivity/Impulsivity', // 과잉행동·충동성
            itemIds: [10, 11, 12, 13, 14, 15, 16, 17, 18],
            itemCount: 9
        },
    ],

    // **진단 기준 (논문 Table 8 기반)
    diagnosticCriteria: {
        type: 'ARI_PER_SUBSCALES_BY_GENDER',
        description: '평균 평정 지수(ARI: Average Rating Index, 하위 척도 총점/문항 수)가 1.5 표준 편차(93 백분위) 이상의 절단점을 초과하는지 판단해야 합니다.',
        cutOffs: {
            male: {
                inattention: 1.38,
                hyperImpulsivity: 0.98,
            },
            female: {
                inattention: 1.02,
                hyperImpulsivity: 0.62,
            },
        },
    },

    questions: [
        // --- Inattention (1~9번) ---
        { id: 1, text: '과제나 업무를 수행하는 데 있어서 집중을 잘 못하고, 부주의로 인한 실수가 종종 있다.' },
        { id: 2, text: '수업이나 놀이에서 집중을 유지하는 데 어려움을 겪는 경우가 있다.' },
        { id: 3, text: '이야기를 할 때 잘 듣지 않는 경우가 있다.' },
        { id: 4, text: '지시를 잘 따르지 않으며 숙제, 과제, 임무를 완수하지 못하는 경우가 종종 있다.' },
        { id: 5, text: '과제나 활동을 체계적으로 하는 데 종종 어려움을 겪는다.' },
        { id: 6, text: '지속적으로 정신력이 필요한 과제에 몰두하는 것을 피하거나, 싫어하거나, 저항하는 경우가 종종 있다.' },
        { id: 7, text: '활동에 필요한 물건들을 종종 잃어버린다(예: 장난감, 숙제, 연필, 책 등).' },
        { id: 8, text: '외부 자극에 의해 종종 산만해진다.' },
        { id: 9, text: '일상적인 일들을 종종 잊어버린다.' },

        // --- Hyperactivity/Impulsivity (10~18번) ---
        { id: 10, text: '손발이 가만히 있지 않으며, 앉아 있을 때 계속 몸을 꿈틀거리는 일이 종종 있다.' },
        { id: 11, text: '수업 중(또는 조용히 앉아 있어야 하는 상황)에 자리에서 일어나서 다니는 경우가 종종 있다.' },
        { id: 12, text: '상황에 맞지 않게 돌아다니거나 지나치게 기어오르는 일이 종종 있다.' },
        { id: 13, text: '차분하게 노는 것, 놀이에 몰두하는 것에 어려움이 종종 있다.' },
        { id: 14, text: '끊임없이 움직이거나, 마치 "모터가 달린 것 같이" 행동하는 경우가 종종 있다.' },
        { id: 15, text: '지나치게 말을 많이 하는 경우가 종종 있다.' },
        { id: 16, text: '질문이 끝나기도 전에 불쑥 대답을 해버리는 경우가 종종 있다.' },
        { id: 17, text: '자기 차례를 기다리지 못하는 경우가 종종 있다.' },
        { id: 18, text: '다른 사람을 방해하거나 간섭하는 경우가 종종 있다(예: 대화에 끼어들거나 다른 사람이 노는 데 참견한다).' },
    ]
};