import React, { useState, useEffect } from 'react';
import { FoodItemDisplay, FOOD_ITEM_MAP } from '../types/gacha.types';

interface GachaAnimationProps {
  items: string[];
  onComplete: () => void;
}

const GachaAnimation: React.FC<GachaAnimationProps> = ({ items, onComplete }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    // 애니메이션 시퀀스
    const openTimer = setTimeout(() => {
      setIsOpening(true);
    }, 300);

    const openedTimer = setTimeout(() => {
      setIsOpen(true);
    }, 800);

    const showItemsTimer = setTimeout(() => {
      setShowItems(true);
    }, 1200);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(openedTimer);
      clearTimeout(showItemsTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const displayItems: FoodItemDisplay[] = items
    .map(item => FOOD_ITEM_MAP[item])
    .filter(Boolean);

  return (
    <div style={styles.overlay}>
      {/* 보물상자 */}
      <div style={{
        ...styles.treasureContainer,
        transform: isOpening ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.5s ease-out'
      }}>
        <img
          src={isOpen ? '/treasure-open.png' : '/treasure-closed.png'}
          alt="보물상자"
          style={styles.treasureImage}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* 아이템 리스트 */}
      {showItems && (
        <div style={{
          ...styles.itemsContainer,
          animation: 'slideUp 0.5s ease-out'
        }}>
          {displayItems.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              style={{
                ...styles.itemCard,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <img
                src={item.imagePath}
                alt={item.displayName}
                style={styles.itemImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/food-default.png';
                }}
              />
              <div style={styles.itemName}>{item.displayName}</div>
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  treasureContainer: {
    marginBottom: '50px',
  },
  treasureImage: {
    width: '300px',
    height: '300px',
    objectFit: 'contain',
  },
  itemsContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '80%',
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    animation: 'slideUp 0.5s ease-out',
    minWidth: '120px',
  },
  itemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default GachaAnimation;