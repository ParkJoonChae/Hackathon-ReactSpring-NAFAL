import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

/**
 * Header Component - NAFAL Style (검정색 헤더)
 * style-guide.css 기준 검정색 네비게이션
 */
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  // TODO: NAFAL.STORE 배포 시 변경 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/NAFAL",
    withCredentials: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [eventSource, setEventSource] = useState(null);
  const REST_KEY = process.env.REACT_APP_KAKAO_REST_KEY;
  const LOGOUT_REDIRECT = process.env.REACT_APP_KAKAO_LOGOUT_REDIRECT;

  // 로그인 상태 확인
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userInfo = JSON.parse(userData);
        console.log('localStorage에서 불러온 사용자 정보:', userInfo);
        setUser(userInfo);
      } catch (error) {
        console.error('User data parse error:', error);
        localStorage.removeItem('user');
      }
    }

    // 컴포넌트 언마운트 시 SSE 연결 종료
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('SSE 연결 종료');
      }
    };
  }, []);

  // 사용자 변경 시 SSE 재연결
  useEffect(() => {
    if (user) {
      console.log('사용자 정보로 SSE 연결 시작:', user);
      initializeSSE(user);
      // 기존 알림 로드
      // loadNotifications();
      // 브라우저 알림 권한 요청
      requestNotificationPermission();
    } else {
      // 로그아웃 시 SSE 연결 종료
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
        setNotifications([]);
      }
    }
  }, [user]);

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('알림 권한:', permission);
      });
    }
  };

  // Server-Sent Events 초기화
 // ... existing code ...
// 주석 해제하고 수정
const initializeSSE = (userInfo) => {
  // 기존 연결이 있다면 종료
  if (eventSource) {
    eventSource.close();
  }

  // 전역 알림 이벤트 리스너 등록
  const handleNotification = (event) => {
    try {
      const notification = JSON.parse(event.detail.data);
      if (shouldShowNotification(notification, userInfo)) {
        addNewNotification(notification);
      }
    } catch (error) {
      console.error('알림 데이터 파싱 오류:', error);
    }
  };

  window.addEventListener('nafalNotification', handleNotification);
  return () => {
    window.removeEventListener('nafalNotification', handleNotification);
  };
};

// 역할별 알림 표시 여부 결정
const shouldShowNotification = (notification, userInfo) => {
  const userType = (userInfo?.userType || userInfo?.role || 'USER').toString().toUpperCase();
  const notificationRole = (notification.targetRole || notification.role || 'USER').toString().toUpperCase();
  
  // 전체 사용자 대상 알림
  if (notificationRole === 'ALL') {
    return true;
  }
  
  // 역할별 알림
  switch (userType) {
    case 'ADMIN':
      return ['ADMIN', 'ALL'].includes(notificationRole);
    case 'NAFAL':
      return ['NAFAL', 'ADMIN', 'ALL'].includes(notificationRole);
    case 'USER':
    default:
      return ['USER', 'ALL'].includes(notificationRole);
  }
};

// 새 알림 추가
const addNewNotification = (notification) => {
  const newNotification = {
    id: notification.id || Date.now(),
    title: notification.title || '새 알림',
    message: notification.message || notification.data || notification,
    type: notification.type || 'info',
    isRead: false,
    createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date(),
    itemId: notification.itemId || null,
    userRole: notification.userRole || user?.userType || 'USER'
  };

  setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // 최대 20개 유지
  
  // 브라우저 알림 (사용자 권한 확인 후)
  if (Notification.permission === 'granted') {
    new Notification(newNotification.title, {
      body: newNotification.message,
      icon: '/logo192.png'
    });
  }
};

// 알림 읽음 처리
const handleNotificationClick = async (notification) => {
  try {
    // 백엔드 API 호출
    await api.put(`/api/notifications/${notification.id}/read`);
    
    // 프론트엔드 상태 업데이트
    setNotifications(prev => prev.map(n =>
      n.id === notification.id ? { ...n, isRead: true } : n
    ));
    
    // 알림 관련 페이지로 이동
    if (notification.itemId) {
      navigate(`/item/${notification.itemId}`);
    }
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
  }
};
// ... existing code ...

  // TODO: 백엔드 연동 - 개별 알림 삭제 API
  // DELETE /api/notifications/:id - 개별 알림 삭제
  const handleDeleteNotification = (notificationId, e) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // TODO: 백엔드 연동 - 전체 알림 삭제 API
  // DELETE /api/notifications - 전체 알림 삭제
  const handleDeleteAllNotifications = () => {
    if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
      setNotifications([]);
    }
  };

  const formatNotificationTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  // 역할별 뱃지 색상
  const getRoleBadgeColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'var(--orange-500)';
      case 'NAFAL':
        return 'var(--primary)';
      case 'USER':
      default:
        return 'var(--mint-500)';
    }
  };

  // 역할별 라벨
  const getRoleLabel = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return '관리자';
      case 'NAFAL':
        return '대표자';
      case 'USER':
      default:
        return '일반';
    }
  };

  // 알림 타입별 뱃지 색상
  const getTypeBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'product':
        return 'var(--success)';
      case 'auction':
        return 'var(--warning)';
      case 'payment':
        return 'var(--primary)';
      case 'register':
        return 'var(--mint-600)';
      case 'error':
        return 'var(--danger)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  // 알림 타입별 라벨
  const getTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'product':
        return '상품';
      case 'auction':
        return '경매';
      case 'payment':
        return '결제';
      case 'register':
        return '가입';
      case 'error':
        return '오류';
      default:
        return '일반';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navigation = [
    { name: 'HOME', href: '/', active: location.pathname === '/' },
    { name: 'AUCTION', href: '/auction', active: location.pathname === '/auction' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search:', searchQuery);
      // TODO: Implement search functionality
    }
  };

  const handleLogout = async () => {
    try {
      // 1) 서버 세션 종료
      await api.post("/api/logout"); // baseURL이 http://localhost:8080/NAFAL이면 OK

      // 2) SSE 연결 정리
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }

      // 3) 로컬 클리어
      const provider = JSON.parse(localStorage.getItem("user"))?.provider || "LOCAL";
      localStorage.removeItem("user");
      setUser(null);
      setIsUserMenuOpen(false);
      setNotifications([]); // 알림도 클리어

      // 3) 카카오 사용자만 카카오 로그아웃으로
      // TODO: NAFAL.STORE 배포 시 LOGOUT_REDIRECT 환경변수를 https://nafal.store 로 설정
      const logoutRedirect = process.env.REACT_APP_LOGOUT_REDIRECT || 'http://localhost:3000';
      if (provider === "KAKAO" && REST_KEY && logoutRedirect) {
        const url =
            `https://kauth.kakao.com/oauth/logout?client_id=${REST_KEY}` +
            `&logout_redirect_uri=${encodeURIComponent(logoutRedirect)}`;
        window.location.href = url;
        return;
      }

      // 로컬 유저는 그냥 홈으로
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };


  const handleMyPage = () => {
    console.log('마이페이지 이동');
    console.log('user:', user.userType);
    setIsUserMenuOpen(false);

    // 사용자 역할에 따라 다른 페이지로 이동
    // 사용자 역할에 따라 다른 페이지로 이동 (userType 우선, role 백업)
    const userType = user?.userType || 'USER';
    const type = userType.toString().toUpperCase();
    console.log('최종 결정된 type:', type);

    switch (type) {
      case 'NAFAL':
        console.log('NAFAL 대표자 페이지로 이동');
        navigate('/nafal-mypage');
        break;
      case 'ADMIN':
        console.log('관리자 페이지로 이동');
        navigate('/admin-mypage');
        break;
      case 'USER':
        console.log('일반 사용자 페이지로 이동');
        navigate('/user-mypage');
        break;
      default:
        console.log('기본 마이페이지로 이동, type:', type);
        navigate('/user-mypage'); // 기본값을 user-mypage로 변경
        break;
    }
  };


  return (
      <header className="header">
        <div className="header__content">
          {/* 로고 */}
          <Link to="/" className="header__logo">
            <img src="/logo.png" alt="NAFAL Logo" />
          </Link>

          {/* 네비게이션 - 데스크톱 */}
          <nav className="header__nav d-lg-flex d-md-none">
            {navigation.map((item) => (
                <Link
                    key={item.name}
                    to={item.href}
                    className={`header__nav-link ${item.active ? 'header__nav-link--active' : ''}`}
                >
                  {item.name}
                </Link>
            ))}
          </nav>

          {/* 검색 - 데스크톱 */}
          <div className="header__search d-lg-flex d-md-none">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                  type="text"
                  placeholder="브랜드, 상품, 프로필, 태그 등"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderRadius: '20px',
                    paddingLeft: '40px',
                    height: '40px'
                  }}
              />
              <button
                  type="submit"
                  className="absolute"
                  style={{
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* 알림 - 검색창과 로그인 사이에 위치 */}
          <div className="notification-container d-lg-flex d-md-none" style={{ position: 'relative', marginRight: 'var(--space-4)' }}>
            <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{
                  position: 'relative',
                  background: 'none',
                  border: '2px solid rgba(255, 255, 255, 0.6)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--white)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'var(--white)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                  e.target.style.background = 'none';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
                title="알림"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>

              {/* 알림 수 표시 */}
              {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#FF5142',
                    color: 'white',
                    borderRadius: unreadCount >= 10 ? '100px' : '50%',
                    width: unreadCount >= 10 ? 'auto' : '20px',
                    height: '20px',
                    padding: unreadCount >= 10 ? '4px 10px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-family)',
                    minWidth: '20px'
                  }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              )}
            </button>

            {/* 알림 드롭다운 메뉴 */}
            {isNotificationOpen && (
                <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-primary)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '320px',
                      maxWidth: '400px',
                      zIndex: 'var(--z-dropdown)',
                      marginTop: 'var(--space-1)',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                >
                  {/* 헤더 */}
                  <div style={{
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)',
                      margin: 0
                    }}>
                      알림 {unreadCount > 0 && `(${unreadCount})`}
                    </h3>

                    {notifications.length > 0 && (
                        <button
                            onClick={handleDeleteAllNotifications}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                              padding: 'var(--space-1)',
                              borderRadius: 'var(--radius-md)',
                              transition: 'all var(--transition-fast)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--orange-50)';
                              e.target.style.color = 'var(--orange-600)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'none';
                              e.target.style.color = 'var(--text-tertiary)';
                            }}
                            title="전체 삭제"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                    )}
                  </div>

                  {/* 알림 목록 */}
                  <div>
                    {notifications.length === 0 ? (
                        <div style={{
                          padding: 'var(--space-8)',
                          textAlign: 'center',
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-family)'
                        }}>
                          <div style={{
                            fontSize: '2rem',
                            marginBottom: 'var(--space-2)',
                            opacity: 0.5
                          }}>
                            🔔
                          </div>
                          <p>새로운 알림이 없습니다</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                  padding: 'var(--space-3)',
                                  borderBottom: '1px solid var(--border-primary)',
                                  cursor: 'pointer',
                                  transition: 'all var(--transition-fast)',
                                  background: notification.isRead ? 'var(--bg-primary)' : 'var(--mint-50)',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  gap: 'var(--space-2)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = notification.isRead ? 'var(--bg-secondary)' : 'var(--mint-100)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = notification.isRead ? 'var(--bg-primary)' : 'var(--mint-50)';
                                }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 'var(--space-2)', 
                                  marginBottom: 'var(--space-1)' 
                                }}>
                                  <div style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--weight-semibold)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-family)'
                                  }}>
                                    {notification.title}
                                  </div>
                                  {/* 역할별 알림 뱃지 */}
                                  {notification.userRole && (
                                    <span style={{
                                      fontSize: 'var(--text-xs)',
                                      fontWeight: 'var(--weight-medium)',
                                      padding: '2px 6px',
                                      borderRadius: 'var(--radius-sm)',
                                      background: getRoleBadgeColor(notification.userRole),
                                      color: 'white'
                                    }}>
                                      {getRoleLabel(notification.userRole)}
                                    </span>
                                  )}
                                  {/* 알림 타입 뱃지 */}
                                  {notification.type && notification.type !== 'info' && (
                                    <span style={{
                                      fontSize: 'var(--text-xs)',
                                      fontWeight: 'var(--weight-medium)',
                                      padding: '2px 6px',
                                      borderRadius: 'var(--radius-sm)',
                                      background: getTypeBadgeColor(notification.type),
                                      color: 'white'
                                    }}>
                                      {getTypeLabel(notification.type)}
                                    </span>
                                  )}
                                </div>
                                <div style={{
                                  fontSize: 'var(--text-sm)',
                                  color: 'var(--text-secondary)',
                                  fontFamily: 'var(--font-family)',
                                  lineHeight: 1.4,
                                  marginBottom: 'var(--space-1)'
                                }}>
                                  {notification.message}
                                </div>
                                <div style={{
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--text-tertiary)',
                                  fontFamily: 'var(--font-family)'
                                }}>
                                  {formatNotificationTime(notification.createdAt)}
                                </div>
                              </div>

                              <button
                                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    padding: 'var(--space-1)',
                                    borderRadius: 'var(--radius-md)',
                                    transition: 'all var(--transition-fast)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = 'var(--orange-50)';
                                    e.target.style.color = 'var(--orange-600)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'none';
                                    e.target.style.color = 'var(--text-tertiary)';
                                  }}
                                  title="알림 삭제"
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                        ))
                    )}
                  </div>
                </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="header__actions">
            {user ? (
                // 로그인 상태: 사용자 메뉴
                <div className="user-menu-container" style={{ position: 'relative' }}>
                  <button
                      className="btn btn--outline btn--sm"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        minWidth: '120px',
                        justifyContent: 'center',
                        background: 'transparent',
                        borderColor: 'var(--white)',
                        color: 'var(--white)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--white)';
                        e.target.style.color = 'var(--black)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = 'var(--white)';
                      }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--mint-400), var(--mint-300))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--mint-900)'
                    }}>
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'currentColor',
                      fontFamily: 'var(--font-family)'
                    }}>
                  {user.name}
                </span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 사용자 드롭다운 메뉴 */}
                  {isUserMenuOpen && (
                      <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            background: 'var(--bg-primary)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-primary)',
                            boxShadow: 'var(--shadow-lg)',
                            padding: 'var(--space-2)',
                            minWidth: '180px',
                            zIndex: 'var(--z-dropdown)',
                            marginTop: 'var(--space-1)'
                          }}
                      >
                        <div style={{
                          padding: 'var(--space-3)',
                          borderBottom: '1px solid var(--border-primary)',
                          marginBottom: 'var(--space-2)'
                        }}>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--weight-semibold)',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-family)'
                          }}>
                            {user.name}
                          </div>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-tertiary)',
                            fontFamily: 'var(--font-family)'
                          }}>
                            {user.email}
                          </div>
                          {user.role === 'admin' && (
                              <div style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--mint-600)',
                                fontWeight: 'var(--weight-medium)',
                                fontFamily: 'var(--font-family)',
                                marginTop: 'var(--space-1)'
                              }}>
                                관리자
                              </div>
                          )}
                        </div>

                        <button
                            onClick={handleMyPage}
                            style={{
                              width: '100%',
                              padding: 'var(--space-2) var(--space-3)',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              fontSize: 'var(--text-sm)',
                              color: 'var(--text-secondary)',
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)',
                              fontFamily: 'var(--font-family)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-2)',
                              marginBottom: 'var(--space-1)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--mint-50)';
                              e.target.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'none';
                              e.target.style.color = 'var(--text-secondary)';
                            }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          마이페이지
                        </button>

                        <button
                            onClick={handleLogout}
                            style={{
                              width: '100%',
                              padding: 'var(--space-2) var(--space-3)',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              fontSize: 'var(--text-sm)',
                              color: 'var(--text-secondary)',
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)',
                              fontFamily: 'var(--font-family)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-2)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--orange-50)';
                              e.target.style.color = 'var(--orange-600)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'none';
                              e.target.style.color = 'var(--text-secondary)';
                            }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          로그아웃
                        </button>
                      </div>
                  )}
                </div>
            ) : (
                // 비로그인 상태: 로그인 버튼
                <Link to="/login" className="btn btn--outline btn--sm">
                  로그인
                </Link>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
                className="btn btn--outline btn--sm d-md-flex d-lg-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
            <div
                className="d-md-block d-lg-none"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--black)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: 'var(--space-4)',
                  zIndex: 'var(--z-dropdown)'
                }}
            >
              {/* 모바일 검색 */}
              <form onSubmit={handleSearch} className="mb-4">
                <input
                    type="text"
                    placeholder="브랜드, 상품, 프로필, 태그 등"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      borderRadius: '20px'
                    }}
                />
              </form>

              {/* 모바일 네비게이션 */}
              <nav className="d-flex flex-column gap-3">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={`header__nav-link ${item.active ? 'header__nav-link--active' : ''}`}
                        style={{ padding: 'var(--space-2) 0' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                ))}
              </nav>
            </div>
        )}

        {/* 헤더 높이만큼 여백 */}
        <div style={{ height: 'var(--header-height)' }} />
      </header>
  );
}