import { SurveyConfig } from '../types/survey.types';

export const BDI_DATA: SurveyConfig = {
    id: 'BDI',
    title: '벡 우울 척도 (BDI: Beck Depression Inventory) 한글판',
    description: `다음의 문항을 읽어보시고, 각 문항별 여러 진술 중 지난 1주일간 자신에게 가장 적합하다고 생각되는 진술 하나를 선택하여 주십시오.`,
    type: 'ADULT',
    // options: BDI는 질문별 선택지를 사용하므로, 이 필드는 사용하지 않음
    questions: [
        {
            id: 1,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 슬프지 않다.' },
                { score: 1, text: '나는 슬프다.' },
                { score: 2, text: '나는 항상 슬프고 기운을 낼 수 없다.' },
                { score: 3, text: '나는 너무나 슬프고 불행해서 도저히 견딜 수 없다.' },
            ],
        },
        {
            id: 2,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 앞날에 대해서 별로 낙심하지 않는다.' },
                { score: 1, text: '나는 앞날에 대해서 용기가 나지 않는다.' },
                { score: 2, text: '나는 앞날에 대해 기대할 것이 아무것도 없다고 느낀다.' },
                { score: 3, text: '나는 앞날은 아주 절망적이고 나아질 가망이 없다고 느낀다.' },
            ],
        },
        {
            id: 3,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 실패자라고 느끼지 않는다.' },
                { score: 1, text: '나는 보통사람들보다 더 많이 실패한 것 같다.' },
                { score: 2, text: '내가 살아온 과거를 뒤돌아 보면, 실패투성이인 것 같다.' },
                { score: 3, text: '나는 인간으로서 완전한 실패자라고 느낀다.' },
            ],
        },
        {
            id: 4,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 전과같이 일상생활에 만족하고 있다.' },
                { score: 1, text: '나의 일상생활은 예전처럼 즐겁지 않다.' },
                { score: 2, text: '나는 요즘에는 어떤 것에서도 별로 만족을 얻지 못한다.' },
                { score: 3, text: '나는 모든 것이 다 불만스럽고 싫증난다.' },
            ],
        },
        {
            id: 5,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 특별히 죄책감을 느끼지 않는다.' },
                { score: 1, text: '나는 죄책감을 느낄 때가 많다.' },
                { score: 2, text: '나는 죄책감을 느낄때가 아주 많다.' },
                { score: 3, text: '나는 항상 죄책감에 시달리고 있다.' },
            ],
        },
        {
            id: 6,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 벌을 받고 있다고 느끼지 않는다.' },
                { score: 1, text: '나는 나는 어쩌면 벌을 받을지도 모른다는 느낌이 든다.' },
                { score: 2, text: '나는 벌을 받을 것 같다.' },
                { score: 3, text: '나는 지금 벌을 받고 있다고 느낀다.' },
            ],
        },
        {
            id: 7,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 나 자신에게 실망하지 않는다.' },
                { score: 1, text: '나는 나 자신에게 실망하고 있다.' },
                { score: 2, text: '나는 나 자신에게 화가 난다.' },
                { score: 3, text: '나는 나 자신을 증오한다.' },
            ],
        },
        {
            id: 8,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '내가 다른 사람보다 못한 것 같지는 않다.' },
                { score: 1, text: '나는 나의 약점이나 실수에 대해서 나 자신을 탓하는 편이다.' },
                { score: 2, text: '내가 한 일이 잘못되었을 때는 언제나 나를 탓한다.' },
                { score: 3, text: '일어나는 모든 나쁜 일들은 다 내 탓이다.' },
            ],
        },
        {
            id: 9,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 자살같은 것은 생각하지 않는다.' },
                { score: 1, text: '나는 자살할 생각을 가끔 하지만, 실제로 하지는 않을 것이다.' },
                { score: 2, text: '자살하고 싶은 생각이 자주 든다.' },
                { score: 3, text: '나는 기회만 있으면 자살하겠다.' },
            ],
        },
        {
            id: 10,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 평소보다 더 울지는 않는다.' },
                { score: 1, text: '나는 전보다 더 많이 운다.' },
                { score: 2, text: '나는 요즈음 항상 운다.' },
                { score: 3, text: '나는 전에는 울고 싶을 때 울 수 있었지만 요즈음은 울래야 울 기력조차 없다.' },
            ],
        },
        {
            id: 11,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 요즈음 평소보다 더 짜증을 내는 편은 아니다.' },
                { score: 1, text: '나는 요즈음 항상 짜증이 나고 귀찮아 진다.' },
                { score: 2, text: '나는 요즈음 항상 짜증을 내고 있다.' },
                { score: 3, text: '전에는 짜증스럽던 일에 요즘은 너무 지쳐서 짜증조차 나지 않는다.' },
            ],
        },
        {
            id: 12,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 다른 사람들에 대한 관심을 잃지 않고 있다.' },
                { score: 1, text: '나는 전보다 다른 사람들에 대한 관심이 줄었다.' },
                { score: 2, text: '나는 다른 사람들에 대한 관심이 거의 없어졌다.' },
                { score: 3, text: '나는 다른 사람들에 대한 관심이 완전히 없어졌다.' },
            ],
        },
        {
            id: 13,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 평소처럼 결정을 잘 내린다.' },
                { score: 1, text: '나는 결정을 미루는 때가 전보다 더 많다.' },
                { score: 2, text: '나는 전에 비해 결정내리는 데에 더 큰 어려움을 느낀다.' },
                { score: 3, text: '나는 더 이상 아무 결정도 내릴 수가 없다.' },
            ],
        },
        {
            id: 14,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 전보다 내 모습이 나빠졌다고 느끼지 않는다.' },
                { score: 1, text: '나는 나이들어 보이거나 매력 없이 보일까봐 걱정한다.' },
                { score: 2, text: '나는 매 모습이 매력 없게 변해버린 것 같은 느낌이 든다.' },
                { score: 3, text: '나는 내가 추하게 보인다고 믿는다.' },
            ],
        },
        {
            id: 15,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 전처럼 일을 할 수 있다.' },
                { score: 1, text: '어떤 일을 시작하는 데에 전보다 더 많은 노력이 든다.' },
                { score: 2, text: '무슨 일이든 하려면 나 자신을 매우 심하게 채찍질해야만 한다.' },
                { score: 3, text: '나는 전혀 아무 일도 할 수가 없다.' },
            ],
        },
        {
            id: 16,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 평소처럼 잠을 잘 수 있다.' },
                { score: 1, text: '나는 전에 만큼 잠을 자지는 못한다.' },
                { score: 2, text: '나는 전보다 한두 시간 일찍 깨고 다싯 잠들기 어렵다.' },
                { score: 3, text: '나는 평소보다 몇 시간이나 일찍 깨고, 한번 깨면 다시 잠들 수 없다.' },
            ],
        },
        {
            id: 17,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 평소 보다 더 피곤하지는 않다.' },
                { score: 1, text: '나는 전보다 더 쉽게 피곤해 진다.' },
                { score: 2, text: '나는 무엇을 해도 피곤해진다.' },
                { score: 3, text: '나는 너무나 피곤해서 아무 일도 할 수 없다.' },
            ],
        },
        {
            id: 18,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '내 식욕은 평소와 다름없다.' },
                { score: 1, text: '나는 요즈음 전보다 식욕이 좋지 않다.' },
                { score: 2, text: '나는 요즈음 식욕이 많이 떨어졌다.' },
                { score: 3, text: '요즈음에는 전혀 식욕이 없다.' },
            ],
        },
        {
            id: 19,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '요즈음 체중이 별로 줄지 않았다.' },
                { score: 1, text: '전보다 몸무게가 2Kg 가량 줄었다.' },
                { score: 2, text: '전보다 몸무게가 5Kg 가량 줄었다.' },
                { score: 3, text: '전보다 몸무게가 7Kg 가량 줄었다.' },
            ],

        },
        {
            id: 20,
            type: 'multiple-choice',
            text: '',
            choices: [
                { score: 0, text: '나는 건강에 대해 전보다 더 염려하고 있지는 않다.' },
                { score: 1, text: '나는 여러 가지 통증, 소화불량, 변비 등과 같은 신체적인 문제로 걱정하고 있다.' },
                { score: 2, text: '나는 건강이 염려되어 다른 일은 생각하기 힘들다.' },
                { score: 3, text: '나는 건강이 너무 염려되어 다른 일은 아무 것도 생각할 수 없다.' },
            ],
        },
        {
            id: 21,
            type: 'multiple-choice',
            text: ' ',
            choices: [
                { score: 0, text: '나는 요즈음 성에 대한 관심에 별다른 변화가 있는 것 같지는 않다.' },
                { score: 1, text: '나는 전보다 성에 대한 관심이 줄었다.' },
                { score: 2, text: '나는 전보다 성에 대한 관심이 상당히 줄었다.' },
                { score: 3, text: '나는 성에 대한 관심을 완전히 잃었다.' },
            ],
        },
    ],
};