import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchWithAccess } from '../util/fetchUtil';

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

// 백엔드 응답 타입
interface BackendResponse {
    type: string;
    isPositive: boolean;
    summary: string;
    details: {
        label: string;
        score: number;
        threshold: number;
        status: string;
    }[];
}

function ResultPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { surveyType, answers } = location.state || {};
    const [result, setResult] = useState<BackendResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [gender, setGender] = useState<'male' | 'female'>('male');

    useEffect(() => {
        if (!surveyType || !answers) {
            alert("잘못된 접근입니다.");
            navigate('/diagnosis');
            return;
        }

        const submitDiagnosis = async () => {
            setLoading(true);
            try {
                // 1. answers의 키를'문자열'로 변환
                const formattedAnswers = Object.keys(answers).reduce((acc, key) => {
                    acc[String(key)] = answers[Number(key)]; // 키를 String으로 변환
                    return acc;
                }, {} as Record<string, number>);

                // 2. 보낼 데이터 객체 생성
                const payload = {
                    surveyType: surveyType,
                    answers: formattedAnswers,
                    gender: gender
                };

                console.log("🚀 [디버깅] 서버로 보낼 원본 객체:", payload);
                console.log("🚀 [디버깅] JSON 변환 결과:", JSON.stringify(payload));
                const response = await fetchWithAccess(`${BACKEND_API_BASE_URL}/diagnosis/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                // 디버깅 시 사용
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`🔥 서버 에러 (${response.status}):`, errorText);
                    alert(`진단 실패: 서버에서 ${response.status} 오류가 발생했습니다.\n내용: ${errorText}`);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("✅ 진단 성공:", data);
                setResult(data);

            } catch (error) {
                console.error("❌ 최종 요청 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        submitDiagnosis();

    }, [surveyType, answers, gender, navigate]);

    if (loading) return <div style={styles.loadingContainer}>📊 결과 분석 중입니다...</div>;
    if (!result) return null;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>진단 결과 리포트</h1>

                {/* SNAP-IV 성별 선택 */}
                {surveyType === 'SNAP_IV' && (
                    <div style={styles.genderSelector}>
                        <span style={{marginRight: '10px', fontWeight:'bold', color:'#555'}}>아동 성별 기준:</span>
                        <button onClick={() => setGender('male')} style={{...styles.genderBtn, backgroundColor: gender === 'male' ? '#48dbfb' : '#eee', color: gender === 'male' ? 'white' : '#555'}}>남자</button>
                        <button onClick={() => setGender('female')} style={{...styles.genderBtn, backgroundColor: gender === 'female' ? '#ff6b6b' : '#eee', color: gender === 'female' ? 'white' : '#555'}}>여자</button>
                    </div>
                )}

                {/* 결과 요약 */}
                <div style={{
                    ...styles.summaryBox,
                    backgroundColor: result.isPositive ? '#fff0f0' : '#f0fff4',
                    borderColor: result.isPositive ? '#ff6b6b' : '#2ecc71'
                }}>
                    <div style={{fontSize: '60px', marginBottom: '10px'}}>
                        {result.isPositive ? '⚠️' : '✅'}
                    </div>
                    <h2 style={{color: result.isPositive ? '#e74c3c' : '#27ae60', marginBottom: '10px'}}>
                        {result.isPositive ? "추가 검사가 권장됩니다" : "정상 범위입니다"}
                    </h2>
                    <p style={styles.summaryText}>{result.summary}</p>
                </div>

                {/* 상세 점수  visual metaphor */}
                <div style={styles.detailContainer}>
                    {result.details.map((detail, index) => (
                        <div key={index} style={styles.detailRow}>
                            <div style={styles.detailLabel}>{detail.label}</div>
                            <div style={styles.detailScoreArea}>
                                <div style={styles.scoreText}>
                                    점수: <span style={styles.scoreValue}>{detail.score}</span>
                                    <span style={styles.thresholdText}> / 기준: {detail.threshold}</span>
                                </div>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: detail.status === '위험' ? '#ff6b6b' : '#2ecc71'
                                }}>{detail.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <p style={styles.disclaimer}>* 본 결과는 간이 선별 검사일 뿐이며, 의학적 진단을 대체할 수 없습니다.</p>

                <div style={styles.buttonGroup}>
                    <button onClick={() => navigate('/diagnosis')} style={styles.secondaryBtn}>다른 검사 하기</button>
                    <button onClick={() => navigate('/select-mode')} style={styles.primaryBtn}>치료 게임 하러 가기 🎮</button>
                </div>
            </div>
        </div>
    );
}

// 스타일 (기존 유지)
const styles: { [key: string]: React.CSSProperties } = {
    container: { width: '100vw', minHeight: '100vh', backgroundColor: '#c7f8f5', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', boxSizing: 'border-box' },
    loadingContainer: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', color: '#666', fontWeight: 'bold' },
    card: { width: '100%', maxWidth: '700px', backgroundColor: 'white', borderRadius: '30px', padding: '50px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', textAlign: 'center' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '30px' },
    genderSelector: { marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
    genderBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
    summaryBox: { padding: '30px', borderRadius: '20px', border: '2px solid', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    summaryText: { fontSize: '18px', color: '#555', lineHeight: '1.5', fontWeight: '500' },
    detailContainer: { width: '100%', marginBottom: '30px', borderTop: '1px solid #eee' },
    detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 10px', borderBottom: '1px solid #eee' },
    detailLabel: { fontSize: '16px', fontWeight: 'bold', color: '#555', textAlign: 'left', flex: 1 },
    detailScoreArea: { display: 'flex', alignItems: 'center', gap: '15px' },
    scoreText: { fontSize: '16px', color: '#666' },
    scoreValue: { fontWeight: 'bold', color: '#333', fontSize: '18px' },
    thresholdText: { fontSize: '14px', color: '#999' },
    statusBadge: { padding: '5px 12px', borderRadius: '15px', color: 'white', fontSize: '14px', fontWeight: 'bold', minWidth: '50px' },
    disclaimer: { fontSize: '13px', color: '#999', marginBottom: '40px', lineHeight: '1.5' },
    buttonGroup: { display: 'flex', gap: '15px', justifyContent: 'center' },
    primaryBtn: { padding: '15px 30px', backgroundColor: '#6c5ce7', color: 'white', border: 'none', borderRadius: '15px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', flex: 2 },
    secondaryBtn: { padding: '15px 30px', backgroundColor: '#fff', color: '#666', border: '2px solid #eee', borderRadius: '15px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }
};

export default ResultPage;