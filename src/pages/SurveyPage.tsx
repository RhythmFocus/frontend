import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSurveyDataById } from '../data/surveyService';
import { SurveyConfig } from '../types/survey.types';

function SurveyPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const surveyId = location.state?.gameType || 'ASRS';
    const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

    // --- 상태 관리 ---
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 현재 보고 있는 문제 인덱스
    const [isStarted, setIsStarted] = useState(false); // 테스트 시작 여부

    // 데이터 로딩
    useEffect(() => {
        const data = getSurveyDataById(surveyId);
        if (data) {
            setSurveyConfig(data);
        } else {
            alert("준비 중인 진단 도구입니다.");
            navigate('/diagnosis');
        }
    }, [surveyId, navigate]);

    if (!surveyConfig) return <div style={styles.loading}>로딩 중...</div>;

    // 현재 질문 객체
    const currentQuestion = surveyConfig.questions[currentQuestionIndex];
    const totalQuestions = surveyConfig.questions.length;

    // --- 핸들러 ---
    const handleStart = () => {
        setIsStarted(true);
    };

    const handleSelectOption = (score: number) => {
        // 응답 저장
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: score }));

        // 클릭 시 자동적으로 다음 문제로 넘어가는 기능(비활성화)
        /* if (currentQuestionIndex < totalQuestions - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
            }, 300); // 약간의 딜레이 후 이동
        } */
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSubmit = () => {
        // 1. 모든 문항 응답 확인
        if (Object.keys(answers).length < totalQuestions) {
            alert("모든 문항에 답변해주세요.");
            return;
        }

        console.log("제출 답안:", answers);

        // 2. navigate 함수의 두 번째 인자로 데이터를 실어 보냄
        navigate('/diagnosis/result', {
            state: {
                surveyType: surveyId, // "ASRS" or "SNAP-IV"
                answers: answers      // { 1: 4, 2: 3 ... }
            }
        });
    };

    // 진행률 계산
    const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);


    return (
        <div style={styles.container}>
            {/* 상단 헤더 */}
            <div style={styles.header}>
                <div style={styles.homeIcon} onClick={() => navigate('/diagnosis')}>
                    ↩ 목록으로
                </div>
                <h1 style={styles.headerTitle}>{surveyConfig.title}</h1>
            </div>

            {/* 메인 컨텐츠 박스 */}
            <div style={styles.contentBox}>

                {/* --- [좌측] 질문 및 선택지 영역 --- */}
                <div style={styles.questionArea}>
                    <div style={styles.questionHeader}>
                        <span style={styles.questionBadge}>문항 {currentQuestionIndex + 1} / {totalQuestions}</span>
                    </div>

                    <h2 style={styles.questionText}>
                        <span style={styles.questionNum}>{currentQuestion.id}.</span> {currentQuestion.text}
                    </h2>

                    {/* 선택지 버튼 영역 */}
                    <div style={styles.optionsContainer}>
                        {surveyConfig.options.map((opt) => {
                            const isSelected = answers[currentQuestion.id] === opt.score;
                            return (
                                <button
                                    key={opt.score}
                                    onClick={() => handleSelectOption(opt.score)}
                                    style={{
                                        ...styles.optionButton,
                                        backgroundColor: isSelected ? '#7d86bf' : '#f1f2f6',
                                        color: isSelected ? 'white' : '#555',
                                        border: isSelected ? '2px solid #7d86bf' : '2px solid transparent',
                                        fontWeight: isSelected ? 'bold' : 'normal',
                                    }}
                                    disabled={!isStarted} // 시작 전에는 선택 불가
                                >
                                    <div style={styles.optionScoreCircle}>{opt.score}</div>
                                    <span>{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>


                {/* --- [우측] 사이드 패널 (안내 및 네비게이션) --- */}
                {/* isStarted 상태에 따라 클래스를 다르게 적용하여 애니메이션 효과를 줌 */}
                <div style={{
                    ...styles.sidePanel,
                    transform: isStarted ? 'translateX(0)' : 'translateX(0)', // 실제 이동은 내부 컨텐츠가 함
                    width: isStarted ? '300px' : '400px', // 시작 후 너비가 약간 줄어듦 (선택사항)
                }}>

                    {/* 1. 시작 전 안내 화면 */}
                    <div style={{
                        ...styles.panelContent,
                        ...styles.startPanel,
                        opacity: isStarted ? 0 : 1,
                        pointerEvents: isStarted ? 'none' : 'auto',
                        transform: isStarted ? 'translateX(100%)' : 'translateX(0)',
                    }}>
                        <h3 style={styles.panelTitle}>평가 방법</h3>
                        <p style={styles.panelDescription}>
                            {surveyConfig.description}
                            <br/><br/>
                            각 문항을 주의 깊게 읽고, 가장 적절하다고 생각되는 번호를 선택해주세요.
                        </p>
                        <button onClick={handleStart} style={styles.startButton}>
                            테스트 시작하기 👉
                        </button>
                    </div>

                    {/* 2. 시작 후 네비게이션 화면 */}
                    <div style={{
                        ...styles.panelContent,
                        ...styles.navPanel,
                        opacity: isStarted ? 1 : 0,
                        pointerEvents: isStarted ? 'auto' : 'none',
                        transform: isStarted ? 'translateX(0)' : 'translateX(100%)',
                    }}>
                        <h3 style={styles.panelTitle}>진행 상황</h3>
                        {/* 진행바 */}
                        <div style={styles.progressBarBg}>
                            <div style={{...styles.progressBarFill, width: `${progressPercentage}%`}} />
                        </div>
                        <p style={styles.progressText}>{currentQuestionIndex + 1} / {totalQuestions} 문항</p>


                        <div style={styles.navButtons}>
                            <button
                                onClick={handlePrev}
                                disabled={currentQuestionIndex === 0}
                                style={{...styles.navButton, opacity: currentQuestionIndex === 0 ? 0.5 : 1}}
                            >
                                이전 문항
                            </button>

                            {currentQuestionIndex < totalQuestions - 1 ? (
                                <button onClick={handleNext} style={styles.navButton}>
                                    다음 문항
                                </button>
                            ) : (
                                <button onClick={handleSubmit} style={{...styles.navButton, backgroundColor: '#4ECDC4'}}>
                                    결과 보기
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100vw', height: '100vh', backgroundColor: '#c7f8f5', // 민트색 배경
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px', boxSizing: 'border-box',
    },
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px', color: '#666' },

    header: {
        width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', marginBottom: '30px', position: 'relative',
    },
    homeIcon: {
        cursor: 'pointer', color: '#00d2d3', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '5px',
    },
    headerTitle: {
        flex: 1, textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0, marginLeft: '-80px' // 아이콘 공간만큼 보정
    },

    // 메인 컨텐츠 박스 (흰색 + 보라색)
    contentBox: {
        width: '100%', maxWidth: '1200px', flex: 1, backgroundColor: 'white', borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', overflow: 'hidden', position: 'relative',
    },

    // --- [좌측] 질문 영역 ---
    questionArea: {
        flex: 1, padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    },
    questionHeader: { marginBottom: '20px' },
    questionBadge: {
        padding: '8px 16px', backgroundColor: '#7d86bf', color: 'white', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold',
    },
    questionText: {
        fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '50px', lineHeight: '1.4',
    },
    questionNum: { color: '#7d86bf', marginRight: '10px' },
    optionsContainer: {
        display: 'flex', justifyContent: 'space-around', gap: '20px', flexWrap: 'wrap',
    },
    optionButton: {
        flex: 1, minWidth: '120px', maxWidth: '180px', padding: '25px 15px', border: 'none', borderRadius: '15px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transition: 'all 0.2s ease',
    },
    optionScoreCircle: {
        width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'white', border: '2px solid #ccc',
        display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', fontWeight: 'bold', color: '#555',
    },

    // --- [우측] 사이드 패널 ---
    sidePanel: {
        backgroundColor: '#7d86bf', color: 'white', position: 'relative', overflow: 'hidden',
        transition: 'width 0.5s ease-in-out', // 너비 변경 애니메이션
    },
    panelContent: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: '60px 40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        transition: 'all 0.5s ease-in-out', // 슬라이드 및 투명도 애니메이션
    },
    startPanel: { /* 시작 전 패널 스타일 */ },
    navPanel: { /* 네비게이션 패널 스타일 */ },

    panelTitle: { fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '15px', width: '100%' },
    panelDescription: { fontSize: '18px', lineHeight: '1.6', marginBottom: '50px', flex: 1 },
    startButton: {
        padding: '15px 40px', fontSize: '20px', fontWeight: 'bold', color: '#7d86bf', backgroundColor: 'white',
        border: 'none', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
    },

    // 네비게이션 관련 스타일
    progressBarBg: { width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' },
    progressBarFill: { height: '100%', backgroundColor: '#4ECDC4', transition: 'width 0.3s ease' },
    progressText: { fontSize: '16px', marginBottom: '40px' },
    navButtons: {
        display: 'flex', flexDirection: 'column', gap: '15px', width: '100%',
    },
    navButton: {
        padding: '15px', fontSize: '18px', fontWeight: 'bold', color: 'white', backgroundColor: 'rgba(255,255,255,0.2)',
        border: '2px solid rgba(255,255,255,0.5)', borderRadius: '15px', cursor: 'pointer', transition: 'all 0.2s',
    }
};

export default SurveyPage;