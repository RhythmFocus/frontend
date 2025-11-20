import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MotionOverlay from './MotionOverlay';
import KeyboardTest from './KeyboardTest';
import SyncTester, { SyncTestResult } from './SyncTester';

type InputMode = 'keyboard' | 'motion';
type Stage = 'detection' | 'sync' | 'complete';

function CalibrationScreen() {
    const navigate = useNavigate();
    const location = useLocation();

    // 초기 모드 설정
    const initialMode = location.state?.selectedMode || 'motion';
    const [selectedMode, setSelectedMode] = useState<InputMode>(initialMode);

    // 단계 관리
    const [currentStage, setCurrentStage] = useState<Stage>('detection');

    const [calibrationResult, setCalibrationResult] = useState<SyncTestResult | null>(null);

    // 상태 관리
    const [inputTrigger, setInputTrigger] = useState(false);
    const [isDetectionReady, setIsDetectionReady] = useState(false);

    // 1. 입력 신호 (박수/키보드)
    const handleInputSignal = () => {
        if (currentStage === 'sync') {
            setInputTrigger(prev => !prev);
        }
    };

    // 키보드 리스너
    useEffect(() => {
        if (selectedMode === 'keyboard') {
            const handleKeyDown = () => handleInputSignal();
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [selectedMode, currentStage]);

    const handleSyncComplete = (result: SyncTestResult) => {
        setCalibrationResult(result);
        setCurrentStage('complete');
    };

    // 3. 액션 핸들러들
    const handleMainPage = () => {
        // 성공했을 때만 이동
        if (calibrationResult?.success) {
            navigate('/main', {
                state: {
                    inputMode: selectedMode,
                    globalOffset: calibrationResult.offset
                }
            });
        }
    };

    const handleRetry = () => {
        setCalibrationResult(null);
        setIsDetectionReady(false);
        setCurrentStage('detection');
    };

    const handleReselect = () => {
        navigate('/calibration');
    };

    return (
        <div style={styles.pageContainer}>
            <h1 style={{ marginBottom: '10px' }}>
                {currentStage === 'detection' ? '1단계: 장치 연결 확인' :
                    currentStage === 'sync' ? '2단계: 리듬 싱크 맞추기' : '설정 완료'}
            </h1>

            <div style={styles.displayArea}>
                {selectedMode === 'motion' && (
                    <div style={{
                        ...styles.motionWrapper,
                        opacity: currentStage === 'sync' ? 0.5 : 1
                    }}>
                        <MotionOverlay
                            onStatusChange={(s) => setIsDetectionReady(s === 'perfect')}
                            onClap={handleInputSignal}
                        />
                    </div>
                )}
                {selectedMode === 'keyboard' && currentStage === 'detection' && (
                    <div style={styles.keyboardWrapper}>
                        <KeyboardTest onReady={(ready) => setIsDetectionReady(ready)}/>
                    </div>
                )}
                {currentStage === 'sync' && (
                    <div style={styles.fullScreenOverlay}>
                        <SyncTester
                            triggerInput={inputTrigger}
                            onComplete={handleSyncComplete}
                        />
                    </div>
                )}

                {currentStage === 'complete' && calibrationResult && (
                    <div style={styles.resultLayer}>
                        <h2 style={{fontSize: '32px', marginBottom: '20px', color: calibrationResult.success ? '#333' : '#ff6a00'}}>
                            {calibrationResult.success ? "측정 결과" : "측정 실패"}
                        </h2>

                        <div style={styles.resultBox}>
                            {calibrationResult.success ? (
                                <>
                                    <span style={{fontSize: '18px', color: '#666'}}>평균 지연 시간</span>
                                    <div style={styles.offsetValue}>
                                        {calibrationResult.offset > 0 ? `+${calibrationResult.offset}` : calibrationResult.offset} ms
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span style={{fontSize: '18px', color: '#e74c3c', fontWeight:'bold'}}>
                                        {calibrationResult.message}
                                    </span>
                                    <p style={{fontSize: '14px', color: '#888', marginTop: '10px'}}>
                                        다시 시도해주세요.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* 선택 버튼 그룹 */}
                        <div style={styles.actionButtonGroup}>
                            {calibrationResult.success && (
                                <button onClick={handleMainPage} style={styles.primaryBtn}>
                                    메인 화면으로
                                </button>
                            )}

                            <div style={styles.secondaryGroup}>
                                <button onClick={handleRetry} style={styles.secondaryBtn}>
                                    다시 측정하기
                                </button>

                                <button onClick={handleReselect} style={styles.secondaryBtn}>
                                    입력 방식 변경
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {currentStage !== 'complete' && (
                <div style={styles.actionBar}>
                    {currentStage === 'detection' && (
                        <button
                            onClick={() => setCurrentStage('sync')}
                            disabled={!isDetectionReady}
                            style={{...styles.nextBtn, opacity: isDetectionReady ? 1 : 0.5}}
                        >
                            다음 단계 (싱크 측정)
                        </button>
                    )}

                    <button onClick={handleReselect} style={styles.backBtn}>
                        취소하고 돌아가기
                    </button>
                </div>
            )}
        </div>
    );
}

const styles = {
    pageContainer: {
        width: '100vw', height: '100vh', background: '#d0f4f0', color: 'white',
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
    },
    displayArea: {
        width: '800px', height: '500px',
        background: '#333', borderRadius: '20px',
        overflow: 'hidden', position: 'relative' as const,
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    motionWrapper: {
        width: '100%', height: '100%', position: 'absolute' as const, top: 0, left: 0,
    },
    keyboardWrapper: {
        width: '100%', height: '100%', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    overlayLayer: {
        position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgb(78,205,196)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
    },
    fullScreenOverlay: {
        position: 'fixed' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        background: '#c7f8f5',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    resultLayer: {
        position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0,
        background: '#f8f9fa', color: '#333',
        display: 'flex', flexDirection: 'column' as const,
        alignItems: 'center', justifyContent: 'center', zIndex: 20,
        padding: '40px'
    },
    resultBox: {
        background: 'white', padding: '20px 40px', borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' as const,
        marginBottom: '30px', minWidth: '300px',
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center'
    },
    offsetValue: {
        fontSize: '48px', fontWeight: '900', color: '#4ECDC4', margin: '10px 0'
    },
    offsetDesc: {
        fontSize: '14px', color: '#888'
    },
    actionButtonGroup: {
        display: 'flex', flexDirection: 'column' as const, gap: '15px', width: '100%', maxWidth: '350px'
    },
    primaryBtn: {
        padding: '18px', fontSize: '20px', fontWeight: 'bold', borderRadius: '12px',
        background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', color: 'white', border: 'none',
        cursor: 'pointer', boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
        transition: 'transform 0.2s'
    },
    secondaryGroup: {
        display: 'flex', gap: '10px'
    },
    secondaryBtn: {
        flex: 1, padding: '12px', fontSize: '14px', fontWeight: '600', borderRadius: '10px',
        background: 'white', color: '#555', border: '2px solid #eee',
        cursor: 'pointer', transition: 'background 0.2s'
    },
    actionBar: {
        marginTop: '30px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '15px',
    },
    nextBtn: {
        padding: '15px 35px', fontSize: '18px', borderRadius: '30px', border: 'none',
        background: '#0984e3', color: 'white', cursor: 'pointer', fontWeight: 'bold'
    },
    backBtn: {
        background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', textDecoration: 'underline'
    }
};

export default CalibrationScreen;