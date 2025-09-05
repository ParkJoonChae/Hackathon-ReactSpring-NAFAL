import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaStar,
  FaGem,
  FaShoppingBag,
  FaMoneyBillWave,
  FaHeart,
  FaCheck,
  FaBox,
  FaGift
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

/**
 * UserMypage - NAFAL 사용자 마이페이지
 * KREAM 스타일의 좌측 네비게이션과 우측 콘텐츠 구조
 */
export default function UserMypage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // TODO: NAFAL.STORE 배포 시 변경 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
    withCredentials: true,
  });

  // 네비게이션 메뉴
  const navItems = [
    { id: 'profile', name: '프로필 관리', icon: <FaUser /> },
    { id: 'points', name: '포인트 충전', icon: <FaGem /> },
    { id: 'purchase', name: '구매 내역', icon: <FaShoppingBag /> },
    { id: 'wishlist', name: '관심 상품', icon: <FaHeart /> }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // 로컬 스토리지에서 사용자 정보 로드
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 더미 데이터 로드
    setTimeout(() => {
      setPurchaseHistory([
        {
          id: 'P001',
          productName: '라운지 패브릭 쇼파',
          brand: '라이프집',
          price: 42000,
          date: '2024-12-15',
          status: '배송완료',
          image: '/items/sofa.png'
        },
        {
          id: 'P002',
          productName: '원두 에디션 커피머신',
          brand: '카누',
          price: 14000,
          date: '2024-12-10',
          status: '배송중',
          image: '/items/coffeemachine.png'
        }
      ]);

      setWishlist([
        {
          id: 'W001',
          productName: '대형 러그',
          brand: '라이프집',
          price: 19000,
          condition: 'B',
          image: '/items/rug.png'
        },
        {
          id: 'W002',
          productName: '쿠션 세트(2ea)',
          brand: '라이프집',
          price: 12000,
          condition: 'A',
          image: '/items/coushion.png'
        }
      ]);

      setLoading(false);
    }, 1000);
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

  if (loading) {
    return (
        <div className="mypage">
          <Header />
          <div style={{ height: 'var(--header-height)' }} />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
            fontFamily: 'var(--font-family)'
          }}>
            <div className="loading" style={{ width: '40px', height: '40px' }} />
          </div>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="mypage">
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
              <h2>로그인이 필요합니다</h2>
              <a href="/login" className="btn btn--primary">로그인하기</a>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="mypage">
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
                  background: 'linear-gradient(135deg, var(--mint-400), var(--mint-300))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--mint-900)',
                  margin: '0 auto var(--space-3)'
                }}>
                  {user.name?.charAt(0) || 'U'}
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
                  color: 'var(--text-tertiary)',
                  margin: 0,
                  fontFamily: 'var(--font-family)'
                }}>
                  {user.email}
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
                            background: activeSection === item.id ? 'var(--mint-50)' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            color: activeSection === item.id ? 'var(--mint-700)' : 'var(--text-secondary)',
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
                        <span style={{ fontSize: '1.2em' }}>{item.icon}</span>
                        {item.name}
                      </button>
                    </li>
                ))}
              </ul>
            </nav>

            {/* 우측 콘텐츠 */}
            <main style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              border: '1px solid var(--border-primary)',
              minHeight: '600px'
            }}>
              {activeSection === 'profile' && <ProfileSection user={user} setUser={setUser} />}
              {activeSection === 'points' && <PointsSection user={user} />}
              {activeSection === 'purchase' && <PurchaseSection history={purchaseHistory} />}
              {activeSection === 'wishlist' && <WishlistSection wishlist={wishlist} getConditionColor={getConditionColor} />}
            </main>
          </div>
        </div>

        {/* 푸터 */}
        <Footer />
      </div>
  );
}

// 프로필 관리 섹션
function ProfileSection({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // 사용자 정보 업데이트
    const updatedUser = { ...user, name: formData.name };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert('프로필이 업데이트되었습니다.');
  };

  return (
      <div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-family)'
        }}>
          프로필 관리
        </h2>

        <div style={{ maxWidth: '500px' }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-family)'
            }}>
              이름
            </label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                style={{ fontFamily: 'var(--font-family)' }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-family)'
            }}>
              이메일
            </label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input"
                disabled
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-family)'
                }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-family)'
            }}>
              전화번호
            </label>
            <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
                style={{ fontFamily: 'var(--font-family)' }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-family)'
            }}>
              주소
            </label>
            <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input"
                style={{ fontFamily: 'var(--font-family)' }}
            />
          </div>

          <button
              onClick={handleSave}
              className="btn btn--primary"
              style={{ minWidth: '120px' }}
          >
            저장하기
          </button>
        </div>
      </div>
  );
}

// 포인트 충전 섹션
function PointsSection({ user }) {
  const [userPoints, setUserPoints] = useState(0); // 현재 보유 포인트
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';

  useEffect(() => {
    loadPointsData();

    // 창이 포커스될 때 데이터 새로고침 (포인트 충전 후 돌아왔을 때)
    const handleFocus = () => {
      loadPointsData();
    };

    // 페이지 visibility 변경 시 데이터 새로고침
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPointsData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadPointsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. 세션 확인
      const { data: sessionData } = await axios.get(`${apiBase}/api/user/session`, { withCredentials: true });
      
      if (!sessionData.success) {
        throw new Error('로그인이 필요합니다.');
      }

      // 2. 지갑 정보 조회 (현재 보유 포인트)
      const { data: walletData } = await axios.get(`${apiBase}/api/user/${sessionData.userId}/wallet`, { withCredentials: true });
      
      if (walletData.success) {
        setUserPoints(walletData.balance || 0);
      }

      // 3. 포인트 거래 내역 조회
      const { data: transactionData } = await axios.get(`${apiBase}/api/user/point-transactions`, { withCredentials: true });
      
      if (transactionData.success) {
        // 거래 내역을 UI에 맞게 변환
        const formattedTransactions = transactionData.transactions.map(tx => ({
          id: tx.txId,
          type: tx.type === 'charge' || tx.type === 'refund' || tx.type === 'payout' || tx.type === 'adjust' ? 'charge' : 'use',
          amount: tx.type === 'charge' || tx.type === 'refund' || tx.type === 'payout' || tx.type === 'adjust' ? tx.amount : -tx.amount,
          date: new Date(tx.createdAt).toLocaleDateString('ko-KR'),
          description: tx.typeDesc || '포인트 거래',
          originalType: tx.type
        }));
        setRecentTransactions(formattedTransactions);
      }

    } catch (error) {
      console.error('포인트 데이터 로드 오류:', error);
      setError(error.message || '포인트 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChargeClick = () => {
    window.location.href = '/purchase';
  };

  if (loading) {
    return (
      <div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-family)'
        }}>
          포인트 충전
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          fontFamily: 'var(--font-family)'
        }}>
          <div className="loading" style={{ width: '40px', height: '40px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-family)'
        }}>
          포인트 충전
        </h2>
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          background: 'var(--error-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--error-200)',
          color: 'var(--error-600)',
          fontFamily: 'var(--font-family)'
        }}>
          <p>{error}</p>
          <button
            onClick={loadPointsData}
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--error-500)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
      <div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-family)'
        }}>
          포인트 충전
        </h2>

        {/* 현재 포인트 표시 */}
        <div style={{
          background: 'linear-gradient(135deg, var(--mint-50), var(--mint-100))',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          border: '1px solid var(--mint-200)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
            fontFamily: 'var(--font-family)'
          }}>
            <FaGem style={{ marginRight: 'var(--space-2)', color: 'var(--primary)' }} />
            현재 보유 포인트
          </div>
          <div style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--mint-700)',
            marginBottom: 'var(--space-4)',
            fontFamily: 'var(--font-family)'
          }}>
            {userPoints.toLocaleString()}P
          </div>
          <button
              onClick={handleChargeClick}
              style={{
                padding: 'var(--space-3) var(--space-6)',
                background: 'var(--mint-500)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-medium)',
                fontFamily: 'var(--font-family)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--mint-600)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--mint-500)';
                e.target.style.transform = 'translateY(0)';
              }}
          >
            포인트 충전하기
          </button>
        </div>

        {/* 포인트 사용 내역 */}
        <div>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
            fontFamily: 'var(--font-family)'
          }}>
            포인트 사용 내역
          </h3>

          {recentTransactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-family)'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                marginBottom: 'var(--space-4)', 
                display: 'flex', 
                justifyContent: 'center' 
              }}>
                <FaMoneyBillWave />
              </div>
              <h4 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-medium)',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-secondary)'
              }}>
                포인트 사용 내역이 없습니다
              </h4>
              <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
                포인트를 충전하고 경매에 참여해보세요!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: transaction.type === 'charge' ? 'var(--mint-100)' : 'var(--orange-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--text-lg)'
                    }}>
                      {transaction.type === 'charge' ? <FaGem style={{ color: 'var(--primary)' }} /> : <FaMoneyBillWave style={{ color: 'var(--success)' }} />}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--weight-medium)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-family)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        {transaction.description}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-family)'
                      }}>
                        {transaction.date}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-bold)',
                    color: transaction.type === 'charge' ? 'var(--mint-600)' : 'var(--orange-500)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {transaction.type === 'charge' ? '+' : ''}{transaction.amount.toLocaleString()}P
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}

// 구매 내역 섹션
function PurchaseSection({ history }) {
  return (
      <div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-family)'
        }}>
          구매 내역
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {history.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                gap: 'var(--space-4)',
                padding: 'var(--space-4)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)'
              }}>
                <img
                    src={item.image}
                    alt={item.productName}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)'
                    }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--text-primary)',
                    margin: '0 0 var(--space-1) 0',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {item.productName}
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    margin: '0 0 var(--space-2) 0',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {item.brand}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                <span style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  {item.price.toLocaleString()}원
                </span>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: item.status === '배송완료' ? 'var(--success)' : 'var(--warning)',
                      fontFamily: 'var(--font-family)',
                      fontWeight: 'var(--weight-medium)'
                    }}>
                  {item.status}
                </span>
                  </div>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                    margin: 'var(--space-1) 0 0 0',
                    fontFamily: 'var(--font-family)'
                  }}>
                    구매일: {item.date}
                  </p>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}

// 판매 내역 섹션
function SaleSection({ history }) {
  return (
      <div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-family)'
        }}>
          판매 내역
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {history.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-12)',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-family)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'center', color: 'var(--text-tertiary)' }}><FaBox /></div>
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--weight-medium)',
                  marginBottom: 'var(--space-2)'
                }}>
                  판매 내역이 없습니다
                </h3>
                <p>첫 판매를 시작해보세요!</p>
              </div>
          ) : (
              history.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <img
                        src={item.image}
                        alt={item.productName}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)'
                        }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--text-primary)',
                        margin: '0 0 var(--space-1) 0',
                        fontFamily: 'var(--font-family)'
                      }}>
                        {item.productName}
                      </h3>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        margin: '0 0 var(--space-2) 0',
                        fontFamily: 'var(--font-family)'
                      }}>
                        {item.brand}
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                  <span style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {item.price.toLocaleString()}원
                  </span>
                        <span style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--success)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 'var(--weight-medium)'
                        }}>
                    {item.status}
                  </span>
                      </div>
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                        margin: 'var(--space-1) 0 0 0',
                        fontFamily: 'var(--font-family)'
                      }}>
                        판매일: {item.date}
                      </p>
                    </div>
                  </div>
              ))
          )}
        </div>
      </div>
  );
}

// 관심 상품 섹션
function WishlistSection({ wishlist, getConditionColor }) {
  const [wishlistItems, setWishlistItems] = useState(wishlist);

  // TODO: 백엔드 연동 시 실시간 찜 목록 업데이트
  // WebSocket 또는 상태 관리 라이브러리를 사용하여 실시간 동기화
  // GET /api/user/wishlist - 사용자 찜 목록 조회
  // Response: { items: Array<WishlistItem> }

  useEffect(() => {
    // 로컬스토리지 변경 감지하여 찜 목록 실시간 업데이트
    const handleStorageChange = () => {
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      // TODO: 백엔드 연동 시 상품 상세 정보를 API로 조회
      // Promise.all(storedWishlist.map(id => fetch(`/api/products/${id}`)))

      const updatedWishlist = wishlist.filter(item => storedWishlist.includes(item.id));
      setWishlistItems(updatedWishlist);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // 초기 로드

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [wishlist]);

  const handleRemoveFromWishlist = async (itemId) => {
    if (window.confirm('찜 목록에서 제거하시겠습니까?')) {
      try {
        // TODO: 백엔드 API 호출
        // DELETE /api/wishlist/{itemId}

        const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const newWishlist = currentWishlist.filter(id => id !== itemId);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));

        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        alert('찜 목록에서 제거되었습니다.');
      } catch (error) {
        console.error('찜 목록 제거 중 오류:', error);
        alert('찜 목록 제거 중 오류가 발생했습니다.');
      }
    }
  };

  if (wishlistItems.length === 0) {
    return (
        <div>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            fontFamily: 'var(--font-family)'
          }}>
            관심 상품
          </h2>

          <div style={{
            textAlign: 'center',
            padding: 'var(--space-12)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-family)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'center', color: 'var(--text-tertiary)' }}><FaGift /></div>
            <h3 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-medium)',
              marginBottom: 'var(--space-2)'
            }}>
              관심 상품이 없습니다
            </h3>
            <p>마음에 드는 상품에 하트를 눌러보세요!</p>
          </div>
        </div>
    );
  }

  return (
      <div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-family)'
        }}>
          관심 상품
        </h2>

        <div className="product-grid">
          {wishlistItems.map((item) => (
              <div key={item.id} style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-2px)';
                     e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.boxShadow = 'none';
                   }}>
                <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
                  <img
                      src={item.image}
                      alt={item.productName}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)'
                      }}
                  />
                  <span
                      style={{
                        position: 'absolute',
                        top: 'var(--space-2)',
                        right: 'var(--space-2)',
                        background: getConditionColor(item.condition).bg,
                        color: getConditionColor(item.condition).text,
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--weight-bold)',
                        padding: 'var(--space-1) var(--space-2)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                  >
                {item.condition}급
              </span>

                  {/* 찜 제거 버튼 */}
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(item.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: 'var(--space-2)',
                        left: 'var(--space-2)',
                        width: '28px',
                        height: '28px',
                        background: 'rgba(255, 107, 107, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#ff5252';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 107, 107, 0.9)';
                        e.target.style.transform = 'scale(1)';
                      }}
                      title="찜 목록에서 제거"
                  >
                    <FaHeart style={{ color: 'var(--error)' }} />
                  </button>
                </div>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-primary)',
                  margin: '0 0 var(--space-1) 0',
                  fontFamily: 'var(--font-family)'
                }}>
                  {item.productName}
                </h3>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  margin: '0 0 var(--space-2) 0',
                  fontFamily: 'var(--font-family)'
                }}>
                  {item.brand}
                </p>
                <div style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  {item.price.toLocaleString()}원
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}
