import React, { useState, useEffect } from 'react';
import {
  FaHeart,
  FaGavel,
  FaClock,
  FaTimes,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';

/**
 * NotificationService - 실시간 팝업 알림 서비스
 * 찜한 목록 경매 시작, 입찰 추월 등의 알림을 표시
 */
export default function NotificationService() {
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

useEffect(() => {
  // 전역 알림 이벤트 리스너 등록
  const handleNotification = (event) => {
    const notification = JSON.parse(event.detail.data);
    addNotification(notification);
  };

  window.addEventListener('nafalNotification', handleNotification);

  return () => {
    window.removeEventListener('nafalNotification', handleNotification);
  };
}, []);

  // 개발 환경 테스트용 알림
  const showTestNotification = () => {
    const testNotifications = [
      {
        id: Date.now(),
        type: 'wishlist_auction_start',
        title: '💖 찜한 상품 경매 시작!',
        message: '라운지 패브릭 쇼파 경매가 시작되었습니다',
        itemName: '라운지 패브릭 쇼파',
        startPrice: '25,000원',
        image: '/items/sofa.png',
        timestamp: new Date()
      }
    ];

    // 5초 후 추월 알림 추가 시뮬레이션
    setTimeout(() => {
      const outbidNotification = {
        id: Date.now() + 1,
        type: 'outbid',
        title: '🚨 입찰가 추월 알림!',
        message: '사이드 테이블에서 더 높은 입찰이 들어왔습니다',
        itemName: '사이드 테이블-라탄 상판',
        currentPrice: '38,000원',
        yourBid: '37,000원',
        image: '/items/sidetable.png',
        timestamp: new Date()
      };

      addNotification(outbidNotification);
    }, 5000);

    testNotifications.forEach(notification => {
      addNotification(notification);
    });
  };

  // TODO: 실제 WebSocket 연결 설정
  const setupNotificationListener = () => {
    // const ws = new WebSocket('ws://localhost:8080/notifications');
    // 
    // ws.onmessage = (event) => {
    //   const notification = JSON.parse(event.data);
    //   addNotification(notification);
    // };
    //
    // ws.onopen = () => {
    //   console.log('Notification WebSocket connected');
    // };
    //
    // ws.onclose = () => {
    //   console.log('Notification WebSocket disconnected');
    //   // 재연결 로직
    //   setTimeout(setupNotificationListener, 5000);
    // };
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setShowNotification(true);

    // 알림 자동 제거 (8초 후)
    setTimeout(() => {
      removeNotification(notification.id);
    }, 8000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    // 마지막 알림이 제거되면 전체 컨테이너 숨김
    setTimeout(() => {
      setNotifications(prev => {
        if (prev.length === 0) {
          setShowNotification(false);
        }
        return prev;
      });
    }, 300);
  };

  const handleNotificationClick = (notification) => {
    // 알림 클릭 시 해당 상품 페이지로 이동
    if (notification.type === 'wishlist_auction_start' || notification.type === 'outbid') {
      // TODO: 실제 상품 ID로 이동
      window.location.href = `/item/${notification.itemId || 'NAFAL-0003'}`;
    }

    removeNotification(notification.id);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'wishlist_auction_start':
        return <FaHeart style={{ color: 'var(--mint-600)' }} />;
      case 'outbid':
        return <FaExclamationTriangle style={{ color: 'var(--orange-600)' }} />;
      case 'auction_ending':
        return <FaClock style={{ color: 'var(--orange-500)' }} />;
      case 'auction_won':
        return <FaCheckCircle style={{ color: 'var(--mint-600)' }} />;
      default:
        return <FaBell style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'wishlist_auction_start':
        return {
          bg: 'white',
          border: 'var(--border-primary)',
          shadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        };
      case 'outbid':
        return {
          bg: 'white',
          border: 'var(--border-primary)',
          shadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        };
      case 'auction_ending':
        return {
          bg: 'white',
          border: 'var(--border-primary)',
          shadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        };
      default:
        return {
          bg: 'white',
          border: 'var(--border-primary)',
          shadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        };
    }
  };

  if (!showNotification || notifications.length === 0) {
    return null;
  }

  return (
      <div style={{
        position: 'fixed',
        top: 'calc(var(--header-height) + var(--space-4))',
        right: 'var(--space-4)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        maxWidth: '380px',
        width: '100%'
      }}>
        {notifications.map((notification, index) => {
          const colors = getNotificationColor(notification.type);

          return (
              <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    boxShadow: colors.shadow,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    animation: `slideInRight 0.4s ease-out ${index * 0.1}s both`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="notification-item"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = colors.shadow.replace('0.3)', '0.5)');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    e.currentTarget.style.boxShadow = colors.shadow;
                  }}
              >
                {/* 닫기 버튼 */}
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: 'var(--space-2)',
                      right: 'var(--space-2)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 1)';
                      e.target.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.color = 'var(--text-tertiary)';
                    }}
                >
                  <FaTimes />
                </button>

                {/* 알림 헤더 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-3)'
                }}>
                  <div style={{
                    fontSize: 'var(--text-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '50%',
                    border: '1px solid var(--border-primary)'
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--text-primary)',
                      margin: 0,
                      fontFamily: 'var(--font-family)',
                      lineHeight: 1.2
                    }}>
                      {notification.title}
                    </h4>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      fontFamily: 'var(--font-family)',
                      marginTop: 'var(--space-1)'
                    }}>
                      {notification.message}
                    </p>
                  </div>
                </div>

                {/* 상품 정보 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                }}>
                  {notification.image && (
                      <img
                          src={notification.image}
                          alt={notification.itemName}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-md)',
                            objectFit: 'cover',
                            border: '1px solid var(--border-primary)'
                          }}
                      />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)',
                      marginBottom: 'var(--space-1)',
                      lineHeight: 1.3
                    }}>
                      {notification.itemName}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {notification.type === 'wishlist_auction_start' && (
                          <span style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--mint-700)',
                            fontWeight: 'var(--weight-bold)',
                            fontFamily: 'var(--font-family)'
                          }}>
                      시작가: {notification.startPrice}
                    </span>
                      )}

                      {notification.type === 'outbid' && (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-1)'
                          }}>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-family)'
                      }}>
                        내 입찰: {notification.yourBid} → 현재가: {notification.currentPrice}
                      </span>
                          </div>
                      )}

                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-family)'
                      }}>
                    {new Date(notification.timestamp).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div style={{
                  marginTop: 'var(--space-3)',
                  display: 'flex',
                  gap: 'var(--space-2)'
                }}>
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      style={{
                        flex: 1,
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'var(--mint-500)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-bold)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        fontFamily: 'var(--font-family)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '0.9';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'translateY(0)';
                      }}
                  >
                    {notification.type === 'wishlist_auction_start' ? '경매 참여하기' :
                        notification.type === 'outbid' ? '재입찰하기' : '확인하기'}
                  </button>
                </div>
              </div>
          );
        })}


      </div>
  );
}

// 알림 타입 상수
export const NOTIFICATION_TYPES = {
  WISHLIST_AUCTION_START: 'wishlist_auction_start',
  OUTBID: 'outbid',
  AUCTION_ENDING: 'auction_ending',
  AUCTION_WON: 'auction_won'
};

// 알림 생성 헬퍼 함수
export const createNotification = (type, data) => {
  return {
    id: Date.now() + Math.random(),
    type,
    timestamp: new Date(),
    ...data
  };
};
