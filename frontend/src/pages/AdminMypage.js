import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaChartBar,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaList,
  FaMoneyBillWave,
  FaGavel,
  FaTruck,
  FaCreditCard,
  FaGift,
  FaChartLine,
  FaUserTie,
  FaBullhorn,
  FaComments,
  FaCrown,
  FaTimes,
  FaCheck,
  FaCheckCircle,
  // 카테고리 아이콘들  
  FaChair,
  FaTable,
  FaUtensils,
  FaCoffee,
  FaLightbulb,
  FaTshirt,
  FaPalette,
  FaLeaf,
  FaHome,
  FaBed,
  FaBath,
  FaBookOpen,
  FaMobileAlt,
  FaCar,
  FaMusic,
  FaBicycle,
  FaCameraRetro,
  FaGamepad,
  FaGlasses,
  FaMugHot,
  FaPaintBrush,
  FaGlassCheers,
  FaSearch,
  FaSpinner
} from 'react-icons/fa';

import {
  MdDashboard,
  MdInventory,
  MdSupportAgent
} from 'react-icons/md';
import Header from '../components/Header';
import Footer from '../components/Footer';


// CSS 애니메이션 스타일 주입
const injectStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .loading-spinner {
      animation: spin 1s linear infinite;
    }
    
    .skeleton-loader {
      animation: skeleton-loading 1.5s infinite;
    }
    
    .pulse-animation {
      animation: pulse 2s infinite;
    }
  `;
  
  if (!document.head.querySelector('style[data-admin-animations]')) {
    style.setAttribute('data-admin-animations', 'true');
    document.head.appendChild(style);
  }
};

// 로딩 스피너 컴포넌트
function LoadingSpinner({ size = 'md', color = 'var(--primary)' }) {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '40px'
  };

  useEffect(() => {
    injectStyles();
  }, []);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <FaSpinner 
        className="loading-spinner"
        style={{
          fontSize: sizeMap[size],
          color: color
        }}
      />
    </div>
  );
}

// 스켈레톤 로딩 컴포넌트
function SkeletonLoader({ width = '100%', height = '20px', borderRadius = '4px' }) {
  useEffect(() => {
    injectStyles();
  }, []);

  return (
    <div 
      className="skeleton-loader"
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%'
      }}
    />
  );
}

// 카드 스켈레톤 로딩
function StatCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      border: '1px solid var(--border-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }}>
      <SkeletonLoader width="60px" height="60px" borderRadius="var(--radius-lg)" />
      <div style={{ flex: 1 }}>
        <SkeletonLoader width="80%" height="24px" borderRadius="4px" />
        <div style={{ marginTop: 'var(--space-2)' }}>
          <SkeletonLoader width="60%" height="16px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
}

// 상품 카드 스켈레톤 로딩
function ProductCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      border: '1px solid var(--border-primary)'
    }}>
      <SkeletonLoader width="100%" height="200px" borderRadius="var(--radius-md)" />
      <div style={{ marginTop: 'var(--space-3)' }}>
        <SkeletonLoader width="90%" height="18px" borderRadius="4px" />
        <div style={{ marginTop: 'var(--space-2)' }}>
          <SkeletonLoader width="60%" height="14px" borderRadius="4px" />
        </div>
        <div style={{ marginTop: 'var(--space-2)' }}>
          <SkeletonLoader width="80%" height="20px" borderRadius="4px" />
        </div>
        <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
          <SkeletonLoader width="48%" height="32px" borderRadius="var(--radius-md)" />
          <SkeletonLoader width="48%" height="32px" borderRadius="var(--radius-md)" />
        </div>
      </div>
    </div>
  );
}

// 카테고리 카드 스켈레톤 로딩
function CategoryCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      border: '1px solid var(--border-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <SkeletonLoader width="32px" height="32px" borderRadius="4px" />
        <div>
          <SkeletonLoader width="120px" height="18px" borderRadius="4px" />
          <div style={{ marginTop: 'var(--space-1)' }}>
            <SkeletonLoader width="80px" height="14px" borderRadius="4px" />
          </div>
        </div>
      </div>
      <SkeletonLoader width="60px" height="32px" borderRadius="var(--radius-md)" />
    </div>
  );
}

// 페이드인 효과 컴포넌트
function FadeIn({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    }}>
      {children}
    </div>
  );
}

/**
 * AdminMypage - NAFAL 관리자 페이지
 * KREAM 스타일의 좌측 네비게이션과 우측 콘텐츠 구조
 */
export default function AdminMypage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // TODO: NAFAL.STORE 배포 시 변경 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
    withCredentials: true,
  });

  // 관리자 네비게이션 메뉴 (핵심 기능만 유지)
  const navItems = [
    { id: 'overview', name: '대시보드', icon: <FaChartBar /> },
    { id: 'product-manage', name: '상품 관리', icon: <FaBox /> },
    { id: 'category-manage', name: '카테고리 관리', icon: <FaList /> },
    { id: 'shipping-manage', name: '배송 관리', icon: <FaTruck /> }
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    // 로컬 스토리지에서 사용자 정보 로드
    const userData = localStorage.getItem('user');
    if (userData) {
      const userInfo = JSON.parse(userData);
      if (userInfo.userType !== 'ADMIN') {
        // 관리자가 아니면 리다이렉트
        window.location.href = '/';
        return;
      }
      setUser(userInfo);
    }

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
        <div className="admin-page">
          <Header />
          <div style={{ height: 'var(--header-height)' }} />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
            fontFamily: 'var(--font-family)',
            gap: 'var(--space-4)'
          }}>
            <LoadingSpinner size="xl" />
            <div style={{ 
              fontSize: 'var(--text-lg)', 
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              <div>관리자 페이지를 불러오는 중...</div>
              <div style={{ 
                fontSize: 'var(--text-sm)', 
                marginTop: 'var(--space-2)',
                color: 'var(--text-tertiary)'
              }}>
                잠시만 기다려 주세요
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (!user || user.userType !== 'ADMIN') {
    return (
        <div className="admin-page">
          <Header />
          <div style={{ height: 'var(--header-height)' }} />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            fontFamily: 'var(--font-family)'
          }}>
            <div>
              <h2>관리자 권한이 필요합니다</h2>
              <a href="/" className="btn btn--primary">홈으로 돌아가기</a>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="admin-page">
        <Header />
        <div style={{ height: 'var(--header-height)' }} />

        <div className="container" style={{ padding: 'var(--space-6) var(--space-4)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: 'var(--space-8)',
            minHeight: 'calc(100vh - var(--header-height) - 3rem)'
          }}>
            {/* 좌측 네비게이션 */}
            <nav style={{
              position: 'sticky',
              top: 'calc(var(--header-height) + var(--space-6))',
              height: 'fit-content',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{
                marginBottom: 'var(--space-6)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--orange-500), var(--orange-400))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'white',
                  margin: '0 auto var(--space-3)'
                }}>
                  <FaCrown style={{ color: 'var(--orange-500)' }} />
                </div>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-primary)',
                  margin: '0 0 var(--space-1) 0',
                  fontFamily: 'var(--font-family)'
                }}>
                  {user.name}
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--orange-600)',
                  margin: 0,
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--weight-medium)'
                }}>
                  관리자
                </p>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {navItems.map((item) => (
                    <li key={item.id} style={{ marginBottom: 'var(--space-1)' }}>
                      <button
                          onClick={() => setActiveSection(item.id)}
                          style={{
                            width: '100%',
                            padding: 'var(--space-3) var(--space-4)',
                            background: activeSection === item.id ? 'var(--orange-50)' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            color: activeSection === item.id ? 'var(--orange-700)' : 'var(--text-secondary)',
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family)',
                            fontWeight: activeSection === item.id ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)'
                          }}
                          onMouseEnter={(e) => {
                            if (activeSection !== item.id) {
                              e.target.style.background = 'var(--bg-primary)';
                              e.target.style.color = 'var(--text-primary)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (activeSection !== item.id) {
                              e.target.style.background = 'transparent';
                              e.target.style.color = 'var(--text-secondary)';
                            }
                          }}
                      >
                        <span style={{ fontSize: '1.2em', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                        {item.name}
                      </button>
                    </li>
                ))}
              </ul>
            </nav>

            {/* 우측 콘텐츠 */}
            <FadeIn delay={300}>
              <main style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                border: '1px solid var(--border-primary)',
                minHeight: '600px'
              }}>
                {activeSection === 'overview' && <DashboardSection />}
                {activeSection === 'product-manage' && <ProductManageSection />}
                {activeSection === 'category-manage' && <CategoryManageSection />}
                {activeSection === 'shipping-manage' && <ShippingManageSection />}
              </main>
            </FadeIn>
          </div>
        </div>

        {/* 푸터 */}
        <Footer />
      </div>
  );
}

// 대시보드 섹션
function DashboardSection() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 인스턴스 생성
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
    withCredentials: true,
  });

  // 대시보드 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Dashboard API 호출 시작');
      const response = await api.get('/api/admin/dashboard');
      console.log('Dashboard API 응답:', response.data);
      
      if (response.data) {
        setDashboardData(response.data);
        
        // 관리자 대시보드 데이터를 실시간 알림으로 전송
        if (response.data.newActivity && response.data.newActivity.length > 0) {
          // 새로운 활동을 알림으로 전송 (실제로는 백엔드에서 SSE로 전송됨)
          console.log('새로운 관리자 활동 감지:', response.data.newActivity);
        }
      }
    } catch (error) {
      console.error('Dashboard API 호출 오류:', error);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
      
      // 에러 발생 시 기본값 설정
      setDashboardData({
        totalProducts: 0,
        inProgressAuctions: 0,
        todaySales: 0,
        activeUser: 0,
        newActivity: ['데이터를 불러오는 중입니다...']
      });
    } finally {
      setLoading(false);
    }
  };

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <FadeIn>
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-family)',
              margin: 0
            }}>
              관리자 대시보드
            </h2>
            <SkeletonLoader width="100px" height="32px" borderRadius="var(--radius-md)" />
          </div>

          {/* 통계 카드 스켈레톤 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)'
          }}>
            {[1, 2, 3, 4].map((_, index) => (
              <FadeIn key={index} delay={index * 100}>
                <StatCardSkeleton />
              </FadeIn>
            ))}
          </div>

          {/* 최근 활동 스켈레톤 */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            border: '1px solid var(--border-primary)'
          }}>
            <SkeletonLoader width="120px" height="20px" borderRadius="4px" />
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[1, 2, 3, 4].map((_, index) => (
                <FadeIn key={index} delay={500 + index * 100}>
                  <SkeletonLoader width={`${Math.random() * 30 + 60}%`} height="16px" borderRadius="4px" />
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  // 통계 데이터 동적 생성
  const stats = [
    { 
      label: '총 상품 수', 
      value: dashboardData?.totalProducts?.toLocaleString() || '0', 
      icon: <FaBox />, 
      color: 'var(--mint-500)' 
    },
    { 
      label: '진행 중 경매', 
      value: dashboardData?.inProgressAuctions?.toLocaleString() || '0', 
      icon: <FaGavel />, 
      color: 'var(--orange-500)' 
    },
    { 
      label: '오늘 매출', 
      value: `₩${dashboardData?.todaySales?.toLocaleString() || '0'}`, 
      icon: <FaMoneyBillWave />, 
      color: 'var(--success)' 
    },
    { 
      label: '활성 사용자', 
      value: dashboardData?.activeUser?.toLocaleString() || '0', 
      icon: <FaUsers />, 
      color: 'var(--primary)' 
    }
  ];

  return (
      <FadeIn>
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-6)'
          }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-family)',
              margin: 0
            }}>
              관리자 대시보드
            </h2>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              style={{
                background: loading ? 'var(--border-primary)' : 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              {loading && <LoadingSpinner size="sm" color="white" />}
              {loading ? '새로고침 중...' : '새로고침'}
            </button>
          </div>

        {/* 에러 메시지 표시 */}
        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            color: 'var(--danger)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family)'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)'
        }}>
          {stats.map((stat, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-lg)',
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: stat.color
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              </FadeIn>
          ))}
        </div>

        <FadeIn delay={400}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            border: '1px solid var(--border-primary)'
          }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-family)'
            }}>
              최근 활동
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {(dashboardData?.newActivity || []).map((activity, index) => (
                  <FadeIn key={index} delay={500 + index * 100}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)',
                      padding: 'var(--space-2) 0',
                      borderBottom: index < (dashboardData?.newActivity?.length - 1 || 0) ? '1px solid var(--border-primary)' : 'none',
                      transition: 'color 0.2s ease',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    >
                      • {activity}
                    </div>
                  </FadeIn>
              ))}
              {(!dashboardData?.newActivity || dashboardData.newActivity.length === 0) && (
                <FadeIn delay={500}>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)',
                    padding: 'var(--space-2) 0',
                    textAlign: 'center'
                  }}>
                    최근 활동이 없습니다.
                  </div>
                </FadeIn>
              )}
            </div>
          </div>
        </FadeIn>
        </div>
      </FadeIn>
  );
}

// 관리자 계정 관리는 대표자 페이지(NafalMypage.js)로 이동됨

// 상품 관리 섹션
function ProductManageSection() {
  // TODO: NAFAL.STORE 배포 시 변경 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
    withCredentials: true,
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
  // 상품 기본 정보
  title: '', // 상품명 (productName → title)
  description: '', // 간단 설명
  categoryId: '', // 카테고리 ID
  brand: '', // 브랜드
  history: '', // 히스토리 (historyText → history)
  eventName: '', // 이벤트/팝업명
  tag: '', // 태그 (tags → tag)
  material: '', // 재질
  itemStatus: 'S', // 상품 상태 (condition → itemStatus)

  // 가격 정보
  ori_price: '', // 시작가 (startPrice → ori_price)
  instantPrice: '', // 즉시결제

  // 사이즈 정보
  size: { width: '', height: '', depth: '' },
  sizeInfo: '', // 사이즈 통합 정보

  // 배송 정보
  deliveryType: '', // 배송 방법 (shippingMethod → deliveryType)
  deliveryPrice: '', // 배송 금액 (shippingCost → deliveryPrice)
  deliveryOpt: '', // 배송 비고 (shippingNote → deliveryOpt)

  // CO2 효과
  co2EffectKg: '', // CO2 절약 효과 (co2Saved → co2EffectKg)
  effectDesc: '', // 기대효과 설명 (새로 추가)

  // 경매 설정
  minimunPrice: '', // 최소 입장료 (entryFee → minimunPrice)
  startPrice: '1000', // 입찰 단위 (새로 추가)
  auctionStartDate: '',
  auctionEndDate: '',

  // 이미지
  images: [],
  imageFiles: [], // 실제 File 객체들

  // 기타
  errorRange: ''
  });

  // 상품 목록 및 카테고리 로드
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('상품 등록용 카테고리 목록 로딩 중...');
      const response = await api.get('/api/post/getCategory');
      console.log('상품 등록용 카테고리 API 응답:', response.data);
      console.log('응답 데이터 타입:', typeof response.data);
      console.log('응답 데이터 구조:', JSON.stringify(response.data, null, 2));
      
      // 백엔드 응답 데이터 구조 확인 및 매핑
      let categoryData = response.data;
      
      // 데이터가 배열이 아닌 경우 처리
      if (!Array.isArray(categoryData)) {
        console.warn('카테고리 데이터가 배열이 아닙니다:', categoryData);
        categoryData = [];
      }
      
      // 카테고리 데이터 구조 정규화
      const normalizedCategories = categoryData.map(category => ({
        categoryId: category.categoryId || category.id,
        name: category.name || category.categoryName || '이름 없음',
        icon: category.icon || 'FaBox',
        count: category.count || 0
      }));
      
      console.log('정규화된 카테고리 데이터:', normalizedCategories);
      setCategories(normalizedCategories);
      
    } catch (error) {
      console.error('카테고리 목록 로딩 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      
      // 더미 데이터로 폴백
      setCategories([
        { categoryId: 1, name: '가구/테이블', icon: 'FaChair' },
        { categoryId: 2, name: '소품/패브릭', icon: 'FaGlasses' },
        { categoryId: 3, name: '가전/커피머신', icon: 'FaCoffee' }
      ]);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('상품 목록 로딩 중...');
      const response = await api.get('/api/admin/product');
      console.log('상품 목록:', response.data);
      
      // 백엔드 응답 형식에 맞게 매핑
      const mappedProducts = response.data.map(item => {
        // 카테고리 ID로 카테고리 이름 찾기
        const category = categories.find(cat => cat.categoryId === item.categoryId);
        
        return {
          id: item.productId,
          name: item.title,
          category: category ? category.name : '미분류',
          condition: item.productStatus,
          price: item.price,
          status: item.auctionStatus, // scheduled, auction, completed 등
          image: item.imgUrl ? `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL'}/api/images/?imagePath=${item.imgUrl}` : '/items/default.png'
        };
      });
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('상품 목록 로딩 실패:', error);
      alert('상품 목록을 불러오는데 실패했습니다.');
      setProducts([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      'S': { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', text: '#8B4513' }, // 골드
      'A': { bg: 'linear-gradient(135deg,rgb(235, 124, 134),rgb(212, 66, 66))', text: '#000000' }, // 검은색으로 변경
      'B': { bg: 'linear-gradient(135deg, #87CEEB, #4169E1)', text: '#000080' }, // 블루
      'C': { bg: 'linear-gradient(135deg,rgb(150, 235, 124),rgb(121, 219, 112))', text: '#006400' }  // 그린
    };
    return colors[condition] || { bg: '#f3f4f6', text: '#374151' };
  };

  const getStatusColor = (status) => {
    const colors = {
      'auction': { bg: 'var(--orange-100)', text: 'var(--orange-700)', label: '경매중' },
      'completed': { bg: '#E8F5E8', text: '#2E7D32', label: '완료' }, // 연한 초록 배경, 진한 초록 텍스트
      'pending': { bg: '#FFF4E6', text: '#E65100', label: '대기중' } // 연한 오렌지 배경, 진한 오렌지 텍스트
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151', label: '알 수 없음' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProductForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProductForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // 최대 3장
    
    if (files.length === 0) return;
    
    // File 객체와 미리보기 URL을 모두 저장
    const imagePreviewUrls = files.map(file => URL.createObjectURL(file));
    
    setProductForm(prev => ({
      ...prev,
      images: imagePreviewUrls, // 미리보기용
      imageFiles: files // 실제 업로드용 File 객체들
    }));
  };

  const handleSubmitProduct = async () => {
    try {
      // 입력값 검증
      if (!productForm.title || !productForm.brand || !productForm.ori_price || !productForm.instantPrice) {
        alert('필수 필드를 모두 입력해주세요.');
        return;
      }

      // FormData 생성 (이미지 업로드 포함)
      const formData = new FormData();

       // 사이즈 정보를 sizeInfo로 통합
      const sizeInfo = `${productForm.size.width || 0}x${productForm.size.height || 0}x${productForm.size.depth || 0}cm${productForm.errorRange ? ` (오차범위: ${productForm.errorRange})` : ''}`;
      
      const productData = {
        username: localStorage.getItem('username') || '', // 작성자 username
        title: productForm.title || '', // 상품명
        description: productForm.description || '', // 간단 설명
        categoryId: parseInt(productForm.categoryId) || 1, // 카테고리 ID
        deliveryType: productForm.deliveryType || '', // 배송 방법
        deliveryPrice: parseInt(productForm.deliveryPrice) || 0, // 배송 금액
        deliveryOpt: productForm.deliveryOpt || '', // 배송 비고
        co2EffectKg: parseInt(productForm.co2EffectKg) || 0, // CO2 절약 효과
        effectDesc: productForm.effectDesc || '', // 기대효과 설명
        sizeInfo: sizeInfo, // 사이즈 정보
        history: productForm.history || '', // 히스토리
        registerDate: new Date().toISOString(), // 등록일
        brand: productForm.brand || '', // 브랜드
        tag: productForm.tag || '', // 태그
        ori_price: parseInt(productForm.ori_price) || 0, // 시작가
        instantPrice: parseInt(productForm.instantPrice) || 0, // 즉시결제
        material: productForm.material || '', // 재질
        eventName: productForm.eventName || '', // 이벤트/팝업명
        itemStatus: productForm.itemStatus || 'S' // 상품 상태
      };
      
      // 2. auction 객체 (새로운 DB 스키마에 맞춤)
      const auctionData = {
        productId: '', // 백엔드에서 설정
        startPrice: parseInt(productForm.ori_price) || 0, // 경매 최소 금액
        buyNowPrice: parseInt(productForm.instantPrice) || 0, // 즉시 구매 값
        minimunPrice: parseInt(productForm.minimunPrice) || 0, // 최소 입장료
        startPrice: parseInt(productForm.startPrice) || 1000, // 입찰 단위
        auctionStart: productForm.auctionStartDate ? new Date(productForm.auctionStartDate).toISOString() : '',
        auctionEnd: productForm.auctionEndDate ? new Date(productForm.auctionEndDate).toISOString() : ''
      };

      // JSON 데이터를 FormData에 추가
      formData.append('product', JSON.stringify(productData));
      formData.append('auction', JSON.stringify(auctionData));

             // 이미지 파일들을 FormData에 추가
       if (productForm.imageFiles && productForm.imageFiles.length > 0) {
         productForm.imageFiles.forEach((file, index) => {
           formData.append('files', file);
         });
       }

      console.log('상품 등록 데이터:', productData);
      
      const response = await api.post('/api/post/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('상품 등록 응답:', response.data);
      
      if (response.status === 200) {
        alert('상품이 성공적으로 등록되었습니다.');
        setShowProductModal(false);
        resetProductForm();
        // 상품 목록 새로고침
        loadProducts();
      }
    } catch (error) {
      console.error('상품 등록 오류:', error);
      if (error.response?.data?.message) {
        alert(`상품 등록 실패: ${error.response.data.message}`);
      } else {
        alert('상품 등록 중 오류가 발생했습니다.');
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      // 상품 기본 정보
      title: '', // 상품명 (productName → title)
      description: '', // 간단 설명
      categoryId: '', // 카테고리 ID
      brand: '', // 브랜드
      history: '', // 히스토리 (historyText → history)
      eventName: '', // 이벤트/팝업명
      tag: '', // 태그 (tags → tag)
      material: '', // 재질
      itemStatus: 'S', // 상품 상태 (condition → itemStatus)

      // 가격 정보
      ori_price: '', // 시작가 (startPrice → ori_price)
      instantPrice: '', // 즉시결제

      // 사이즈 정보
      size: { width: '', height: '', depth: '' },
      sizeInfo: '', // 사이즈 통합 정보

      // 배송 정보
      deliveryType: '', // 배송 방법 (shippingMethod → deliveryType)
      deliveryPrice: '', // 배송 금액 (shippingCost → deliveryPrice)
      deliveryOpt: '', // 배송 비고 (shippingNote → deliveryOpt)

      // CO2 효과
      co2EffectKg: '', // CO2 절약 효과 (co2Saved → co2EffectKg)
      effectDesc: '', // 기대효과 설명 (새로 추가)

      // 경매 설정
      minimunPrice: '', // 최소 입장료 (entryFee → minimunPrice)
      startPrice: '1000', // 입찰 단위 (새로 추가)
      auctionStartDate: '',
      auctionEndDate: '',

      // 이미지
      images: [],
      imageFiles: [], // 실제 File 객체들

      // 기타
      errorRange: ''
    });
    setEditingProduct(null);
  };

  return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: 'var(--font-family)'
          }}>
            상품 관리
          </h2>
          <button
              className="btn btn--primary"
              onClick={() => {
                setShowProductModal(true);
                // 상품 등록 모달 열 때 카테고리 목록 새로고침
                loadCategories();
              }}
          >
            + 상품 등록
          </button>
        </div>

        {/* 상품 등록/수정 모달 */}
        {showProductModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 'var(--space-4)'
            }}>
              <div style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid var(--border-primary)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-6)',
                  borderBottom: '1px solid var(--border-primary)',
                  paddingBottom: 'var(--space-4)'
                }}>
                  <h3 style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--text-primary)',
                    margin: 0,
                    fontFamily: 'var(--font-family)'
                  }}>
                    {editingProduct ? '상품 수정' : '새 상품 등록'}
                  </h3>
                  <button
                      onClick={() => {
                        setShowProductModal(false);
                        resetProductForm();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 'var(--text-xl)',
                        cursor: 'pointer',
                        color: 'var(--text-tertiary)',
                        padding: 'var(--space-2)'
                      }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  {/* 기본 정보 */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      상품명 *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={productForm.title}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="라운지 패브릭 쇼파"
                        required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      브랜드 *
                    </label>
                    <input
                        type="text"
                        name="brand"
                        value={productForm.brand}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="라이프집"
                        required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      카테고리 *
                    </label>
                    <select
                        name="categoryId"
                        value={productForm.categoryId}
                        onChange={handleInputChange}
                        className="input"
                        required
                    >
                      <option value="">
                        {categories && categories.length > 0 ? '카테고리 선택' : '카테고리를 불러오는 중...'}
                      </option>
                      {categories && categories.map((category, index) => {
                        console.log('카테고리 드롭다운 렌더링:', category); // 디버깅용
                        return (
                          <option key={category.categoryId || index} value={category.categoryId}>
                            {category.name || '이름 없음'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      상품 상태 *
                    </label>
                    <select
                        name="itemStatus"
                        value={productForm.itemStatus}
                        onChange={handleInputChange}
                        className="input"
                        required
                    >
                      <option value="S">S급 (최상)</option>
                      <option value="A">A급 (상)</option>
                      <option value="B">B급 (중)</option>
                      <option value="C">C급 (하)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      시작가 (원) *
                    </label>
                    <input
                        type="number"
                        name="ori_price"
                        value={productForm.ori_price}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="25000"
                        required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      즉시구매가 (원) *
                    </label>
                    <input
                        type="number"
                        name="instantPrice"
                        value={productForm.instantPrice}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="65000"
                        required
                    />
                  </div>

                  <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-family)'
                }}>
                  재질
                </label>
                <input
                  type="text"
                  name="material"
                  value={productForm.material}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="패브릭/목재"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-family)'
                }}>
                  CO₂ 절약 효과 (kg)
                </label>
                <input
                  type="number"
                  name="co2EffectKg"
                  value={productForm.co2EffectKg}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="15"
                  step="1"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-family)'
                }}>
                  이벤트/팝업명
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={productForm.eventName}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="라이프집 두 번째 오프라인 팝업 집들2"
                />
              </div>

              {/* CO2 기대효과 설명 입력창 추가 */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-family)'
                }}>
                  기대효과 설명
                </label>
                <input
                  type="text"
                  name="effectDesc"
                  value={productForm.effectDesc}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="친환경 효과로 지구를 보호합니다"
                />
              </div>
            </div>

                {/* 사이즈 정보 */}
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <h4 style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-4)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    사이즈 정보 (cm)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                    <input
                        type="number"
                        name="size.width"
                        value={productForm.size.width}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="가로"
                    />
                    <input
                        type="number"
                        name="size.height"
                        value={productForm.size.height}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="세로"
                    />
                    <input
                        type="number"
                        name="size.depth"
                        value={productForm.size.depth}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="깊이"
                    />
                    <input
                        type="text"
                        name="errorRange"
                        value={productForm.errorRange}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="±5cm"
                    />
                  </div>
                </div>

                {/* 이미지 업로드 */}
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-2)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    상품 이미지 (최대 3장)
                  </label>
                  <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="input"
                      style={{ padding: 'var(--space-2)' }}
                  />
                  {productForm.images.length > 0 && (
                      <div style={{ marginTop: 'var(--space-3)' }}>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--weight-medium)',
                          color: 'var(--text-primary)',
                          marginBottom: 'var(--space-2)',
                          fontFamily: 'var(--font-family)'
                        }}>
                          업로드된 이미지 ({productForm.images.length}/3)
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 'var(--space-2)',
                          marginBottom: 'var(--space-3)'
                        }}>
                          {productForm.images.map((imageUrl, index) => (
                              <div key={index} style={{ position: 'relative' }}>
                                <img
                                    src={imageUrl}
                                    alt={`상품 이미지 ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '80px',
                                      objectFit: 'cover',
                                      borderRadius: 'var(--radius-md)',
                                      border: '1px solid var(--border-primary)'
                                    }}
                                />
                                <button
                                    onClick={() => {
                                      const newImages = productForm.images.filter((_, i) => i !== index);
                                      const newImageFiles = productForm.imageFiles.filter((_, i) => i !== index);
                                      setProductForm(prev => ({
                                        ...prev,
                                        images: newImages,
                                        imageFiles: newImageFiles
                                      }));
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: '-8px',
                                      right: '-8px',
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: '#ff4444',
                                      color: 'white',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title="이미지 삭제"
                                >
                                  ×
                                </button>
                              </div>
                          ))}
                        </div>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-family)'
                        }}>
                          {productForm.imageFiles.map((file, index) => (
                            <div key={index}>
                              • {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
                            </div>
                          ))}
                        </div>
                      </div>
                  )}
                </div>

                {/* 설명 정보 */}
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-medium)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-2)',
                        fontFamily: 'var(--font-family)'
                      }}>
                        간단 설명 (25자 이내)
                      </label>
                      <input
                          type="text"
                          name="description"
                          value={productForm.description}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="침실 존 소품 디스플레이용"
                          maxLength={25}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-medium)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-2)',
                        fontFamily: 'var(--font-family)'
                      }}>
                        히스토리/스토리
                      </label>
                      <textarea
                          name="history"
                          value={productForm.history}
                          onChange={handleInputChange}
                          className="input"
                          rows={3}
                          placeholder="2025년 여름 서울 성수에서 열린 '라이프집 집들2' 팝업스토어에서..."
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-medium)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-2)',
                        fontFamily: 'var(--font-family)'
                      }}>
                        태그 (쉼표로 구분)
                      </label>
                      <input
                        type="text"
                        name="tag"
                        value={productForm.tag}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="쇼파, 그레이, 라운지, 라이프집"
                      />
                    </div>
                  </div>
                </div>

            {/* 배송 정보 */}
            <div style={{ marginTop: 'var(--space-6)' }}>
              <h4 style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)',
                fontFamily: 'var(--font-family)'
              }}>
                배송 정보
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-2)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    배송 방법
                  </label>
                  <select
                    name="deliveryType"
                    value={productForm.deliveryType}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">배송 방법 선택</option>
                    <option value="1">일반배송</option>
                    <option value="2">화물배송</option>
                    <option value="3">직접수령</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-2)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    배송비 (원)
                  </label>
                  <input
                    type="number"
                    name="deliveryPrice"
                    value={productForm.deliveryPrice}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-2)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    배송 비고
                  </label>
                  <input
                    type="text"
                    name="deliveryOpt"
                    value={productForm.deliveryOpt}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="서울 내 무료 배송"
                  />
                </div>
              </div>
            </div>

            {/* 경매 설정 */}
            <div style={{ marginTop: 'var(--space-6)' }}>
              <h4 style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)',
                fontFamily: 'var(--font-family)'
              }}>
                경매 설정
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                <input
                    type="number"
                    name="startPrice"
                    value={productForm.startPrice}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="입찰단위 (1000)"
                />
                <input
                    type="number"
                    name="minimunPrice"
                    value={productForm.minimunPrice}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="입장료"
                />
                <input
                    type="datetime-local"
                    name="auctionStartDate"
                    value={productForm.auctionStartDate}
                    onChange={handleInputChange}
                    className="input"
                />
                <input
                    type="datetime-local"
                    name="auctionEndDate"
                    value={productForm.auctionEndDate}
                    onChange={handleInputChange}
                    className="input"
                />
              </div>
            </div>

            {/* 액션 버튼 */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-8)',
              borderTop: '1px solid var(--border-primary)',
              paddingTop: 'var(--space-4)'
            }}>
              <button
                  onClick={() => {
                    setShowProductModal(false);
                    resetProductForm();
                  }}
                  className="btn btn--ghost"
              >
                취소
              </button>
              <button
                  onClick={handleSubmitProduct}
                  className="btn btn--primary"
              >
                {editingProduct ? '수정하기' : '등록하기'}
              </button>
            </div>
              </div>
            </div>
        )}

        {/* 로딩 상태 */}
        {loading ? (
          <FadeIn>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              fontFamily: 'var(--font-family)',
              gap: 'var(--space-4)'
            }}>
              <LoadingSpinner size="lg" />
              <div style={{ 
                fontSize: 'var(--text-base)', 
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                <div>상품 목록을 불러오는 중...</div>
                <div style={{ 
                  fontSize: 'var(--text-sm)', 
                  marginTop: 'var(--space-1)',
                  color: 'var(--text-tertiary)'
                }}>
                  잠시만 기다려 주세요
                </div>
              </div>
            </div>
          </FadeIn>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-12)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-family)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'center' }}>
              <FaBox />
            </div>
            <h3 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-medium)',
              marginBottom: 'var(--space-2)'
            }}>
              등록된 상품이 없습니다
            </h3>
            <p>새 상품을 등록해보세요</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product, index) => (
              <FadeIn key={product.id} delay={index * 50}>
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--border-primary)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
                  <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)'
                      }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 'var(--space-2)',
                    right: 'var(--space-2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)'
                  }}>
                <span style={{
                  background: getConditionColor(product.condition).bg,
                  color: getConditionColor(product.condition).text,
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-bold)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  {product.condition}급
                </span>
                    <span style={{
                      background: getStatusColor(product.status).bg,
                      color: getStatusColor(product.status).text,
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--weight-bold)',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                  {getStatusColor(product.status).label}
                </span>
                  </div>
                </div>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-primary)',
                  margin: '0 0 var(--space-1) 0',
                  fontFamily: 'var(--font-family)'
                }}>
                  {product.name}
                </h3>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  margin: '0 0 var(--space-2) 0',
                  fontFamily: 'var(--font-family)'
                }}>
                  {product.id}
                </p>
                <div style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)',
                  marginBottom: 'var(--space-3)'
                }}>
                  {product.price.toLocaleString()}원
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn--ghost" style={{ flex: 1, fontSize: 'var(--text-xs)' }}>
                    수정
                  </button>
                  <button className="btn btn--ghost" style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--error)' }}>
                    삭제
                  </button>
                </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
  );
}

// 카테고리 관리 섹션  
function CategoryManageSection() {
  // TODO: NAFAL.STORE 배포 시 변경 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
    withCredentials: true,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 사용 가능한 아이콘 목록
  const availableIcons = [
    { name: 'FaChair', icon: FaChair, label: '의자', category: '가구' },
    { name: 'FaTable', icon: FaTable, label: '테이블', category: '가구' },
    { name: 'FaBed', icon: FaBed, label: '침대', category: '가구' },
    { name: 'FaHome', icon: FaHome, label: '홈', category: '가구' },
    { name: 'FaUtensils', icon: FaUtensils, label: '식기', category: '주방' },
    { name: 'FaCoffee', icon: FaCoffee, label: '커피', category: '주방' },
    { name: 'FaMugHot', icon: FaMugHot, label: '머그컵', category: '주방' },
    { name: 'FaGlassCheers', icon: FaGlassCheers, label: '글라스', category: '주방' },
    { name: 'FaTshirt', icon: FaTshirt, label: '의류', category: '패션' },
    { name: 'FaGlasses', icon: FaGlasses, label: '안경', category: '패션' },
    { name: 'FaPalette', icon: FaPalette, label: '팔레트', category: '예술' },
    { name: 'FaPaintBrush', icon: FaPaintBrush, label: '붓', category: '예술' },
    { name: 'FaCameraRetro', icon: FaCameraRetro, label: '카메라', category: '예술' },
    { name: 'FaLightbulb', icon: FaLightbulb, label: '전구', category: '가전' },
    { name: 'FaMobileAlt', icon: FaMobileAlt, label: '휴대폰', category: '가전' },
    { name: 'FaLeaf', icon: FaLeaf, label: '잎', category: '친환경' },
    { name: 'FaBath', icon: FaBath, label: '욕실', category: '생활' },
    { name: 'FaBookOpen', icon: FaBookOpen, label: '책', category: '생활' },
    { name: 'FaCar', icon: FaCar, label: '자동차', category: '기타' },
    { name: 'FaMusic', icon: FaMusic, label: '음악', category: '기타' },
    { name: 'FaBicycle', icon: FaBicycle, label: '자전거', category: '기타' },
    { name: 'FaGamepad', icon: FaGamepad, label: '게임', category: '기타' }
  ];

  // 아이콘 매핑 객체 (확장됨)
  const iconMapping = {
    'FaChair': FaChair,
    'FaTable': FaTable,
    'FaBed': FaBed,
    'FaHome': FaHome,
    'FaUtensils': FaUtensils,
    'FaCoffee': FaCoffee,
    'FaMugHot': FaMugHot,
    'FaGlassCheers': FaGlassCheers,
    'FaTshirt': FaTshirt,
    'FaGlasses': FaGlasses,
    'FaPalette': FaPalette,
    'FaPaintBrush': FaPaintBrush,
    'FaCameraRetro': FaCameraRetro,
    'FaLightbulb': FaLightbulb,
    'FaMobileAlt': FaMobileAlt,
    'FaLeaf': FaLeaf,
    'FaBath': FaBath,
    'FaBookOpen': FaBookOpen,
    'FaCar': FaCar,
    'FaMusic': FaMusic,
    'FaBicycle': FaBicycle,
    'FaGamepad': FaGamepad,
    'FaBox': FaBox,
    'FaGift': FaGift
  };

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: ''
  });
  const [selectedIconComponent, setSelectedIconComponent] = useState(null);

  // 카테고리 목록 로드
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('카테고리 관리용 카테고리 목록 로딩 중...');
      const response = await api.get('/api/post/getCategory');
      console.log('카테고리 관리용 카테고리 API 응답:', response.data);
      console.log('응답 데이터 타입:', typeof response.data);
      console.log('응답 데이터 구조:', JSON.stringify(response.data, null, 2));
      
      // 백엔드 응답 데이터 구조 확인 및 매핑
      let categoryData = response.data;
      
      // 데이터가 배열이 아닌 경우 처리
      if (!Array.isArray(categoryData)) {
        console.warn('카테고리 데이터가 배열이 아닙니다:', categoryData);
        categoryData = [];
      }
      
      // 카테고리 데이터 구조 정규화
      const normalizedCategories = categoryData.map(category => ({
        categoryId: category.categoryId || category.id,
        name: category.name || category.categoryName || '이름 없음',
        icon: category.icon || 'FaBox',
        count: category.count || 0
      }));
      
      console.log('정규화된 카테고리 데이터:', normalizedCategories);
      setCategories(normalizedCategories);
      
    } catch (error) {
      console.error('카테고리 목록 로딩 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      alert('카테고리 목록을 불러오는데 실패했습니다.');
      
      // 더미 데이터로 폴백
      setCategories([
        { categoryId: 1, name: '가구/테이블', icon: 'FaChair', count: 8 },
        { categoryId: 2, name: '소품/패브릭', icon: 'FaGlasses', count: 5 },
        { categoryId: 3, name: '가전/커피머신', icon: 'FaCoffee', count: 3 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconSelect = (iconData) => {
    setCategoryForm(prev => ({
      ...prev,
      icon: iconData.name
    }));
    setSelectedIconComponent(iconData.icon);
    setShowIconSelector(false);
  };

  const handleSubmitCategory = async () => {
    try {
      // 입력값 검증
      if (!categoryForm.name || !categoryForm.icon) {
        alert('카테고리명과 아이콘을 모두 입력해주세요.');
        return;
      }

      console.log('카테고리 등록 데이터:', categoryForm);
      
      // 백엔드 API 호출
      const response = await api.post('/api/post/register/category', {
        categoryName: categoryForm.name,
        icon: categoryForm.icon // 아이콘 이름 (예: "FaChair")
      });
      
      console.log('카테고리 등록 응답:', response.data);
      
      if (response.data) {
        // 응답 데이터를 기반으로 카테고리 목록에 추가
        const newCategory = {
          categoryId: response.data.categoryId || categories.length + 1,
          name: response.data.name,
          icon: response.data.icon,
          count: 0
        };
        
        setCategories(prev => [...prev, newCategory]);
        
        // 폼 초기화
        setCategoryForm({ name: '', icon: '' });
        setShowCategoryModal(false);
        alert('카테고리가 성공적으로 추가되었습니다.');
      }
    } catch (error) {
      console.error('카테고리 등록 오류:', error);
      if (error.response?.data?.message) {
        alert(`카테고리 등록 실패: ${error.response.data.message}`);
      } else {
        alert('카테고리 등록 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        console.log('카테고리 삭제:', categoryId);
        await api.delete(`/api/admin/getCategory/${categoryId}`);
        
        // 로컬 상태에서 제거
        setCategories(categories.filter(cat => cat.categoryId !== categoryId));
        alert('카테고리가 삭제되었습니다.');
      } catch (error) {
        console.error('카테고리 삭제 오류:', error);
        alert('카테고리 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: 'var(--font-family)'
          }}>
            카테고리 관리
          </h2>
          <button
              onClick={() => setShowCategoryModal(true)}
              className="btn btn--primary"
          >
            + 카테고리 추가
          </button>
        </div>

        {/* 카테고리 추가/수정 모달 */}
        {showCategoryModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 'var(--space-4)'
            }}>
              <div style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                maxWidth: '500px',
                width: '100%',
                border: '1px solid var(--border-primary)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-6)',
                  borderBottom: '1px solid var(--border-primary)',
                  paddingBottom: 'var(--space-4)'
                }}>
                  <h3 style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--text-primary)',
                    margin: 0,
                    fontFamily: 'var(--font-family)'
                  }}>
                    {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
                  </h3>
                  <button
                      onClick={() => {
                        setShowCategoryModal(false);
                        setCategoryForm({ name: '', icon: '' });
                        setEditingCategory(null);
                        setSelectedIconComponent(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 'var(--text-xl)',
                        cursor: 'pointer',
                        color: 'var(--text-tertiary)',
                        padding: 'var(--space-2)'
                      }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      카테고리명 *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={categoryForm.name}
                        onChange={handleCategoryInputChange}
                        className="input"
                        placeholder="가구/테이블"
                        required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      아이콘 *
                    </label>
                    <div style={{ 
                      display: 'flex',
                      gap: 'var(--space-2)',
                      alignItems: 'center'
                    }}>
                      <input
                          type="text"
                          name="icon"
                          value={categoryForm.icon}
                          onChange={handleCategoryInputChange}
                          className="input"
                          placeholder="React Icons 컴포넌트 (예: FaChair)"
                          required
                          style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowIconSelector(true)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--text-lg)',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--primary-light)';
                          e.target.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'var(--bg-secondary)';
                          e.target.style.borderColor = 'var(--border-primary)';
                        }}
                        title="아이콘 목록에서 선택"
                      >
                        <FaList />
                      </button>
                      {selectedIconComponent && (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--primary)',
                          background: 'var(--primary-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          fontSize: 'var(--text-lg)'
                        }}>
                          <selectedIconComponent />
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      marginTop: 'var(--space-1)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      React Icons 컴포넌트를 사용합니다 (예: FaChair, FaCoffee, FaMugHot)
                    </div>
                  </div>


                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--space-3)',
                  marginTop: 'var(--space-6)',
                  borderTop: '1px solid var(--border-primary)',
                  paddingTop: 'var(--space-4)'
                }}>
                  <button
                      onClick={() => {
                        setShowCategoryModal(false);
                        setCategoryForm({ name: '', icon: '' });
                        setEditingCategory(null);
                        setSelectedIconComponent(null);
                      }}
                      className="btn btn--ghost"
                  >
                    취소
                  </button>
                  <button
                      onClick={handleSubmitCategory}
                      className="btn btn--primary"
                  >
                    {editingCategory ? '수정하기' : '추가하기'}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* 아이콘 선택기 모달 */}
        {showIconSelector && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: 'var(--space-4)'
          }}>
            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)',
                borderBottom: '1px solid var(--border-primary)',
                paddingBottom: 'var(--space-4)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-primary)',
                  margin: 0,
                  fontFamily: 'var(--font-family)'
                }}>
                  아이콘 선택
                </h3>
                <button
                  onClick={() => setShowIconSelector(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 'var(--text-xl)',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    padding: 'var(--space-2)'
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* 카테고리별 아이콘 그룹 */}
              {['가구', '주방', '패션', '예술', '가전', '친환경', '생활', '기타'].map(categoryGroup => {
                const iconsInCategory = availableIcons.filter(icon => icon.category === categoryGroup);
                if (iconsInCategory.length === 0) return null;
                
                return (
                  <div key={categoryGroup} style={{ marginBottom: 'var(--space-6)' }}>
                    <h4 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-3)',
                      paddingBottom: 'var(--space-2)',
                      borderBottom: '1px solid var(--border-secondary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {categoryGroup}
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                      gap: 'var(--space-2)'
                    }}>
                      {iconsInCategory.map((iconData) => {
                        const IconComponent = iconData.icon;
                        const isSelected = categoryForm.icon === iconData.name;
                        
                        return (
                          <button
                            key={iconData.name + iconData.label}
                            type="button"
                            onClick={() => handleIconSelect(iconData)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 'var(--space-1)',
                              padding: 'var(--space-3)',
                              borderRadius: 'var(--radius-md)',
                              border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-primary)',
                              background: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)',
                              fontSize: 'var(--text-xs)',
                              color: isSelected ? 'var(--primary)' : 'var(--text-primary)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.target.style.background = 'var(--bg-tertiary)';
                                e.target.style.borderColor = 'var(--primary-light)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.target.style.background = 'var(--bg-secondary)';
                                e.target.style.borderColor = 'var(--border-primary)';
                              }
                            }}
                          >
                            <IconComponent size={24} />
                            <span style={{ 
                              textAlign: 'center',
                              fontFamily: 'var(--font-family)',
                              fontWeight: isSelected ? 'var(--weight-semibold)' : 'var(--weight-regular)'
                            }}>
                              {iconData.label}
                            </span>
                            <span style={{ 
                              fontSize: '10px',
                              color: 'var(--text-tertiary)',
                              fontFamily: 'monospace'
                            }}>
                              {iconData.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-6)',
                borderTop: '1px solid var(--border-primary)',
                paddingTop: 'var(--space-4)'
              }}>
                <button
                  onClick={() => setShowIconSelector(false)}
                  className="btn btn--ghost"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading ? (
          <FadeIn>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              fontFamily: 'var(--font-family)',
              gap: 'var(--space-4)'
            }}>
              <LoadingSpinner size="lg" />
              <div style={{ 
                fontSize: 'var(--text-base)', 
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                <div>카테고리 목록을 불러오는 중...</div>
                <div style={{ 
                  fontSize: 'var(--text-sm)', 
                  marginTop: 'var(--space-1)',
                  color: 'var(--text-tertiary)'
                }}>
                  잠시만 기다려 주세요
                </div>
              </div>
            </div>
          </FadeIn>
        ) : categories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-12)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-family)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'center' }}>
              <FaList />
            </div>
            <h3 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-medium)',
              marginBottom: 'var(--space-2)'
            }}>
              등록된 카테고리가 없습니다
            </h3>
            <p>새 카테고리를 추가해보세요</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            {categories.map((category, index) => {
              console.log('카테고리 렌더링:', category); // 디버깅용
              const IconComponent = iconMapping[category.icon] || FaChair;
              return (
                <FadeIn key={category.categoryId || index} delay={index * 100}>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-5)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ fontSize: '2rem' }}><IconComponent /></div>
                    <div>
                      <h3 style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--text-primary)',
                        margin: '0 0 var(--space-1) 0',
                        fontFamily: 'var(--font-family)'
                      }}>
                        {category.name || '카테고리명 없음'}
                      </h3>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        fontFamily: 'var(--font-family)'
                      }}>
                        {category.count || 0}개 상품
                      </p>
                    </div>
                  </div>
                  <button
                      onClick={() => handleDeleteCategory(category.categoryId)}
                      className="btn btn--ghost"
                      style={{ color: 'var(--error)' }}
                  >
                    삭제
                  </button>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>
  );
}



// 배송 관리 섹션
function ShippingManageSection() {
  const [shipments, setShipments] = useState([
    { id: 'S001', productName: '라운지 패브릭 쇼파', customer: '김나팔', status: 'pending', date: '2024-12-16' },
    { id: 'S002', productName: '커피머신', customer: '이사용자', status: 'processing', date: '2024-12-15' },
    { id: 'S003', productName: '사이드 테이블', customer: '박구매자', status: 'completed', date: '2024-12-14' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const getShippingStatus = (status) => {
    const statusMap = {
      'pending': { label: '배송 대기', color: 'var(--warning)', bg: 'var(--warning-light)' },
      'processing': { label: '배송 처리', color: 'var(--primary)', bg: 'var(--primary-light)' },
      'completed': { label: '배송 완료', color: 'var(--success)', bg: 'var(--success-light)' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const handleStatusUpdate = (id, newStatus) => {
    setShipments(shipments.map(shipment =>
        shipment.id === id ? { ...shipment, status: newStatus } : shipment
    ));
    alert(`배송 상태가 업데이트되었습니다.`);
  };

  // 검색 기능
  const filteredShipments = shipments.filter(shipment =>
      shipment.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: 'var(--font-family)'
          }}>
            배송 관리
          </h2>

          {/* 검색 기능 */}
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="상품명, 주문번호, 고객명으로 검색..."
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-10) var(--space-3) var(--space-4)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
            />
            <div style={{
              position: 'absolute',
              right: 'var(--space-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              pointerEvents: 'none'
            }}>
              <FaSearch />
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 2fr',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-primary)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
          }}>
            <div>주문번호</div>
            <div>상품명</div>
            <div>고객명</div>
            <div>상태</div>
            <div>날짜</div>
            <div>작업</div>
          </div>
          {filteredShipments.map((shipment) => (
              <div key={shipment.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 2fr',
                gap: 'var(--space-4)',
                padding: 'var(--space-4)',
                borderBottom: '1px solid var(--border-primary)',
                alignItems: 'center',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)'
              }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)' }}>
                  {shipment.id}
                </div>
                <div style={{ color: 'var(--text-primary)' }}>
                  {shipment.productName}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {shipment.customer}
                </div>
                <div>
              <span style={{
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                background: getShippingStatus(shipment.status).bg,
                color: getShippingStatus(shipment.status).color
              }}>
                {getShippingStatus(shipment.status).label}
              </span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {shipment.date}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  <button
                      onClick={() => handleStatusUpdate(shipment.id, 'pending')}
                      className="btn btn--ghost"
                      style={{
                        fontSize: 'var(--text-xs)',
                        padding: 'var(--space-1) var(--space-2)',
                        color: 'var(--warning)',
                        opacity: shipment.status === 'pending' ? 0.5 : 1,
                        cursor: shipment.status === 'pending' ? 'not-allowed' : 'pointer'
                      }}
                      disabled={shipment.status === 'pending'}
                  >
                    대기
                  </button>
                  <button
                      onClick={() => handleStatusUpdate(shipment.id, 'processing')}
                      className="btn btn--ghost"
                      style={{
                        fontSize: 'var(--text-xs)',
                        padding: 'var(--space-1) var(--space-2)',
                        color: 'var(--primary)',
                        opacity: shipment.status === 'processing' ? 0.5 : 1,
                        cursor: shipment.status === 'processing' ? 'not-allowed' : 'pointer'
                      }}
                      disabled={shipment.status === 'processing'}
                  >
                    처리
                  </button>
                  <button
                      onClick={() => handleStatusUpdate(shipment.id, 'completed')}
                      className="btn btn--ghost"
                      style={{
                        fontSize: 'var(--text-xs)',
                        padding: 'var(--space-1) var(--space-2)',
                        color: 'var(--success)',
                        opacity: shipment.status === 'completed' ? 0.5 : 1,
                        cursor: shipment.status === 'completed' ? 'not-allowed' : 'pointer'
                      }}
                      disabled={shipment.status === 'completed'}
                  >
                    완료
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}




