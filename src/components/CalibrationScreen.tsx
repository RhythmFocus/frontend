import { Link } from 'react-router-dom';
import MotionOverlay from './MotionOverlay';

function CalibrationScreen() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f0f0',
      }}
    >
      <h1 style={{ fontSize: '48px', color: '#333', marginBottom: '40px' }}>
        Gesture Calibration
      </h1>
      <div
        style={{
          width: '70%',
          height: '50%',
          background: 'white',
          border: '2px solid #ccc',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <MotionOverlay />
      </div>
      <Link to="/" style={{ marginTop: '40px' }}>
        <button
          style={{
            padding: '15px 30px',
            fontSize: '20px',
            borderRadius: '10px',
            border: 'none',
            background: '#667eea',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Back to Main Menu
        </button>
      </Link>
    </div>
  );
}

export default CalibrationScreen;
