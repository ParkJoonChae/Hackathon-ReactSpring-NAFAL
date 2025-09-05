import React, { useState, useEffect } from 'react';
import {
  FaChartBar,
  FaUsers,
  FaUserTie,
  FaCog,
  FaCrown,
  FaPlus,
  FaTimes,
  FaCheck,
  FaCheckCircle,
  FaEye,
  FaUserMd,
  FaUserShield,
  FaEyeSlash
} from 'react-icons/fa';
import {
  MdDashboard,
  MdSupportAgent
} from 'react-icons/md';
import Header from '../components/Header';
import Footer from '../components/Footer';

import axios from 'axios';
const api = axios.create({
  // TODO: NAFAL.STORE 배포 시 환경변수 설정 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
  withCredentials: true,
});
const ACT_KEY = 'nafal:activities';
const MILE_KEY = 'nafal:lastUserMilestone';

// 운영은 100, 로컬 개발은 3 (환경변수로도 바꿀 수 있게)
const USER_MILESTONE =
    Number(process.env.REACT_APP_USER_MILESTONE || (process.env.NODE_ENV === 'development' ? 3 : 100));

function loadActivities() {
  try { return JSON.parse(localStorage.getItem(ACT_KEY) || '[]'); } catch { return []; }
}
function saveActivities(list) {
  localStorage.setItem(ACT_KEY, JSON.stringify(list.slice(0, 50))); // 최근 50개만 유지
}
function pushActivity(message) {
  const item = { id: Date.now(), message, at: new Date().toISOString() };
  const list = [item, ...loadActivities()];
  saveActivities(list);
  // 같은 탭/다른 섹션에도 반영되도록 커스텀 이벤트 발행
  window.dispatchEvent(new CustomEvent('nafal:activity', { detail: item }));
}
/**
 * NafalMypage - NAFAL 대표자 페이지
 * 대표자만 접근 가능한 최고 관리 페이지
 * AdminMypage.js와 동일한 디자인 패턴 사용
 */
export default function NafalMypage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // 대표자 전용 네비게이션 메뉴
  const navItems = [
    { id: 'overview', name: '대시보드', icon: <FaChartBar /> },
    { id: 'admin-create', name: '관리자 생성', icon: <FaUserTie /> },
    { id: 'account-management', name: '계정 관리', icon: <FaUserShield /> },
    { id: 'system-settings', name: '시스템 설정', icon: <FaCog /> }
  ];

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = () => {
    // 로컬 스토리지에서 사용자 정보 로드
    const userData = localStorage.getItem('user');
    if (userData) {
      const userInfo = JSON.parse(userData);
      // userType 필드를 사용하고 NAFAL을 대표자로 인식
      const userType = (userInfo.userType || userInfo.role || '').toString().toUpperCase();

      setUser(userInfo);
    }

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
        <div className="owner-page">
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

  if (!user || (user.userType || user.role || '').toString().toUpperCase() !== 'NAFAL') {
    return (
        <div className="owner-page">
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
              <h2>대표자 권한이 필요합니다</h2>
              <a href="/" className="btn btn--primary">홈으로 돌아가기</a>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="owner-page">
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
                  background: 'linear-gradient(135deg, var(--mint-500), var(--mint-400))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'white',
                  margin: '0 auto var(--space-3)'
                }}>
                  <FaCrown style={{ color: 'var(--mint-100)' }} />
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
                  color: 'var(--mint-600)',
                  margin: 0,
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--weight-bold)'
                }}>
                  대표자
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
                        <span style={{ fontSize: '1.2em', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
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
              {activeSection === 'overview' && <OwnerDashboardSection />}
              {activeSection === 'admin-create' && <AdminCreateSection />}
              {activeSection === 'account-management' && <AccountManagementSection />}
              {activeSection === 'system-settings' && <SystemSettingsSection />}
            </main>
          </div>
        </div>

        {/* 푸터 */}
        <Footer />
      </div>
  );
}

// 대표자 대시보드 섹션
// 대표자 대시보드 섹션 (백엔드 연동 버전)
function OwnerDashboardSection() {
  const [stats, setStats] = React.useState({
    adminCount: 0,
    totalUsers: 0,
    systemStatus: '정상',
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState(null);
  const [activities, setActivities] = React.useState(() => loadActivities());
    // 커스텀 이벤트로 다른 섹션에서 생긴 활동도 즉시 반영
        React.useEffect(() => {
            const onActivity = (e) => setActivities(prev => [e.detail, ...prev]);
            window.addEventListener('nafal:activity', onActivity);
            return () => window.removeEventListener('owner:activity', onActivity);
          }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/api/owner/dashboard-stats');
        if (!mounted) return;
        setStats({
          adminCount: Number(data?.adminCount ?? 0),
          totalUsers: Number(data?.totalUsers ?? 0),
          systemStatus: data?.systemStatus ?? '정상',
        });
         // ------- 마일스톤 체크 -------
        const total = Number(data?.totalUsers ?? 0);
        const lastMilestone = Number(localStorage.getItem(MILE_KEY) || 0);
        const currentMilestone = Math.floor(total / USER_MILESTONE);
        if (currentMilestone > lastMilestone) {
        // 예: 3명/100명, 200명 ... 돌파 메시지
        const humanStep = USER_MILESTONE;
        pushActivity(`전체 사용자 수가 ${currentMilestone * humanStep}명을 돌파했습니다.`);
        localStorage.setItem(MILE_KEY, String(currentMilestone));
                  }
      } catch (e) {
        if (!mounted) return;
        console.error(e);
        setError('대시보드 통계를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const cards = [
    { label: '전체 관리자', value: loading ? '—' : stats.adminCount.toLocaleString(), icon: <FaUserTie />,    color: 'var(--orange-500)' },
    { label: '시스템 상태', value: loading ? '—' : stats.systemStatus,                icon: <FaUserShield />, color: 'var(--success)' },
    { label: '총 사용자',   value: loading ? '—' : stats.totalUsers.toLocaleString(), icon: <FaUserShield />, color: 'var(--primary)' }
  ];

  return (
      <div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-family)'
        }}>
          대표자 대시보드
        </h2>

        {error && (
            <div style={{
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              background: 'rgba(255,0,0,0.05)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-sm)'
            }}>
              {error}
            </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)'
        }}>
          {cards.map((stat, index) => (
              <div key={index} style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius-lg)',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
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
          ))}
        </div>

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
            시스템 현황
          </h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
             {activities.length === 0 ? (
                 <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                     아직 활동 내역이 없습니다.
                   </div>
               ) : activities.map((a, index) => (
                 <div key={a.id} style={{
                       fontSize: 'var(--text-sm)',
                     color: 'var(--text-secondary)',
                     fontFamily: 'var(--font-family)',
                     padding: 'var(--space-2) 0',
                     borderBottom: index < activities.length - 1 ? '1px solid var(--border-primary)' : 'none'
                   }}>
                     • {a.message}
                     <span style={{ marginLeft: 8, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
         {new Date(a.at).toLocaleString()}
                     </span>
                   </div>
               ))}
           </div>
        </div>
      </div>
  );
}


// 관리자 생성 섹션
function AdminCreateSection() {
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    position: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAdmin = async () => {
    // 1) 클라이언트 유효성
    if (adminForm.password !== adminForm.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!adminForm.name?.trim() || !adminForm.email?.trim() || !adminForm.password) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }
    // (선택) 간단 이메일 형식 체크
    const emailOk = /\S+@\S+\.\S+/.test(adminForm.email);
    if (!emailOk) {
      alert('이메일 형식이 올바르지 않습니다.');
      return;
    }

    // 2) 서버에 보낼 페이로드 (백엔드 DTO 필드명과 매핑)
    const payload = {
      name: adminForm.name.trim(),
      username: adminForm.email.trim(),      // 서버의 UserDTO.username
      passwordHash: adminForm.password,      // 서버에서 BCrypt 인코딩하도록(권장)
      phoneNumber: adminForm.phone?.trim() || null,
      // userType은 서버에서 ADMIN으로 세팅됨
    };

    try {
      setSubmitting(true);
      const res = await api.post('/api/user/insertManager', payload);

      // 현재 컨트롤러는 ResponseEntity<Void>로 200만 내려줌
      if (res.status === 200) {
        alert('관리자 계정이 성공적으로 생성되었습니다.');
        pushActivity(`새 관리자 "${adminForm.name.trim()}"가 생성되었습니다.`);
        setShowForm(false);
        setAdminForm({
          name: '', email: '', password: '', confirmPassword: '', phone: '', position: ''
        });
      } else {
        alert('관리자 생성 실패');
      }
    } catch (e) {
      console.error('관리자 생성 오류:', e);
      // 서버에서 500만 내려오는 구조라면 여기로 들어옴
      alert(e.response?.data?.message || '관리자 생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
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
            관리자 계정 생성
          </h2>
          <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn--primary"
          >
            <FaPlus style={{ marginRight: 'var(--space-2)' }} /> 관리자 추가
          </button>
        </div>

        {showForm && (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-6)',
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
                  새 관리자 생성
                </h3>
                <button
                    onClick={() => setShowForm(false)}
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
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-2)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    이름 *
                  </label>
                  <input
                      type="text"
                      name="name"
                      value={adminForm.name}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="관리자 이름"
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
                    이메일 *
                  </label>
                  <input
                      type="email"
                      name="email"
                      value={adminForm.email}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="admin@nafal.com"
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
                    비밀번호 *
                  </label>
                  <input
                      type="password"
                      name="password"
                      value={adminForm.password}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="8자 이상"
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
                    비밀번호 확인 *
                  </label>
                  <input
                      type="password"
                      name="confirmPassword"
                      value={adminForm.confirmPassword}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="비밀번호 재입력"
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
                    연락처
                  </label>
                  <input
                      type="tel"
                      name="phone"
                      value={adminForm.phone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="010-0000-0000"
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
                    담당 업무
                  </label>
                  <input
                      type="text"
                      name="position"
                      value={adminForm.position}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="상품 관리, 경매 운영 등"
                  />
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
                    onClick={() => setShowForm(false)}
                    className="btn btn--ghost"
                >
                  취소
                </button>
                <button
                    onClick={handleCreateAdmin}
                    className="btn btn--primary"
                    disabled={submitting}
                >
                  {submitting ? '생성 중...' : '관리자 생성'}
                </button>
              </div>
            </div>
        )}

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
            관리자 생성 가이드
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            <div style={{
              padding: 'var(--space-4)',
              background: 'var(--mint-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--mint-200)'
            }}>
              <h4 style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--mint-700)',
                marginBottom: 'var(--space-2)',
                fontFamily: 'var(--font-family)'
              }}>
                관리자 권한
              </h4>
              <ul style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)',
                paddingLeft: 'var(--space-4)',
                lineHeight: 1.6
              }}>
                <li>상품 등록 및 수정</li>
                <li>경매 설정 및 관리</li>
                <li>배송/결제 관리</li>
                <li>고객 문의 답변</li>
                <li>통계 및 정산 조회</li>
              </ul>
            </div>
            <div style={{
              padding: 'var(--space-4)',
              background: 'var(--orange-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--orange-200)'
            }}>
              <h4 style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--orange-700)',
                marginBottom: 'var(--space-2)',
                fontFamily: 'var(--font-family)'
              }}>
                주의사항
              </h4>
              <ul style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)',
                paddingLeft: 'var(--space-4)',
                lineHeight: 1.6
              }}>
                <li>강력한 비밀번호 설정 필수</li>
                <li>정기적인 권한 검토 권장</li>
                <li>개인정보 보호 준수</li>
                <li>계정 공유 금지</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
}


// 계정 관리 섹션
function AccountManagementSection() {
  const [accounts, setAccounts] = useState([
    { id: 1, name: '김관리', email: 'admin1@nafal.com', role: 'admin', status: 'active', lastLogin: '2024-12-16' },
    { id: 2, name: '이관리', email: 'admin2@nafal.com', role: 'admin', status: 'active', lastLogin: '2024-12-15' },
    { id: 3, name: '박매니저', email: 'manager1@nafal.com', role: 'manager', status: 'active', lastLogin: '2024-12-16' },
    { id: 4, name: '최매니저', email: 'manager2@nafal.com', role: 'manager', status: 'inactive', lastLogin: '2024-12-10' }
  ]);

  const handleToggleStatus = (id) => {
    setAccounts(accounts.map(account =>
        account.id === id ? {
          ...account,
          status: account.status === 'active' ? 'inactive' : 'active'
        } : account
    ));
    alert('계정 상태가 변경되었습니다.');
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setAccounts(accounts.filter(account => account.id !== id));
      alert('계정이 삭제되었습니다.');
    }
  };

  const getRoleInfo = (role) => {
    const roleMap = {
      'admin': { label: '관리자', color: 'var(--orange-600)', bg: 'var(--orange-100)' },
      'manager': { label: '매니저', color: 'var(--mint-600)', bg: 'var(--mint-100)' }
    };
    return roleMap[role] || { label: '알 수 없음', color: 'var(--text-tertiary)', bg: 'var(--bg-secondary)' };
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'active': { label: '활성', color: 'var(--success)', bg: 'var(--success-light)' },
      'inactive': { label: '비활성', color: 'var(--warning)', bg: 'var(--warning-light)' }
    };
    return statusMap[status] || { label: '알 수 없음', color: 'var(--text-tertiary)', bg: 'var(--bg-secondary)' };
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
          계정 관리
        </h2>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr auto',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-primary)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
          }}>
            <div>이름</div>
            <div>이메일</div>
            <div>역할</div>
            <div>상태</div>
            <div>최근 로그인</div>
            <div>작업</div>
          </div>
          {accounts.map((account) => (
              <div key={account.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr auto',
                gap: 'var(--space-4)',
                padding: 'var(--space-4)',
                borderBottom: '1px solid var(--border-primary)',
                alignItems: 'center',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)'
              }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)' }}>
                  {account.name}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {account.email}
                </div>
                <div>
              <span style={{
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                background: getRoleInfo(account.role).bg,
                color: getRoleInfo(account.role).color
              }}>
                {getRoleInfo(account.role).label}
              </span>
                </div>
                <div>
              <span style={{
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                background: getStatusInfo(account.status).bg,
                color: getStatusInfo(account.status).color
              }}>
                {getStatusInfo(account.status).label}
              </span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {account.lastLogin}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  <button
                      onClick={() => handleToggleStatus(account.id)}
                      className="btn btn--ghost"
                      style={{
                        fontSize: 'var(--text-xs)',
                        padding: 'var(--space-1) var(--space-2)',
                        color: account.status === 'active' ? 'var(--warning)' : 'var(--success)'
                      }}
                  >
                    {account.status === 'active' ? '비활성화' : '활성화'}
                  </button>
                  <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="btn btn--ghost"
                      style={{
                        fontSize: 'var(--text-xs)',
                        padding: 'var(--space-1) var(--space-2)',
                        color: 'var(--error)'
                      }}
                  >
                    삭제
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}

// 시스템 설정 섹션
function SystemSettingsSection() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newUserRegistration: true,
    emailNotifications: true,
    backupSchedule: 'daily',
    maxFileSize: '10',
    sessionTimeout: '30'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // TODO: 백엔드 연동 - 시스템 설정 저장 API
    // PUT /api/owner/system-settings
    // Request Body: settings object

    console.log('저장된 설정:', settings);
    alert('시스템 설정이 저장되었습니다.');
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
          시스템 설정
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-6)'
        }}>
          {/* 일반 설정 */}
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
              일반 설정
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    유지보수 모드
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    활성화 시 사용자 접근이 제한됩니다
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                      style={{ marginRight: 'var(--space-2)' }}
                  />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: settings.maintenanceMode ? 'var(--warning)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                  {settings.maintenanceMode ? '활성' : '비활성'}
                </span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    신규 사용자 가입
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    새로운 사용자의 회원가입을 허용합니다
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                      type="checkbox"
                      checked={settings.newUserRegistration}
                      onChange={(e) => handleSettingChange('newUserRegistration', e.target.checked)}
                      style={{ marginRight: 'var(--space-2)' }}
                  />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: settings.newUserRegistration ? 'var(--success)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                  {settings.newUserRegistration ? '허용' : '제한'}
                </span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-3)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    이메일 알림
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    시스템 알림을 이메일로 전송합니다
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      style={{ marginRight: 'var(--space-2)' }}
                  />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: settings.emailNotifications ? 'var(--success)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                  {settings.emailNotifications ? '활성' : '비활성'}
                </span>
                </label>
              </div>
            </div>
          </div>

          {/* 고급 설정 */}
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
              고급 설정
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-family)'
                }}>
                  백업 주기
                </label>
                <select
                    value={settings.backupSchedule}
                    onChange={(e) => handleSettingChange('backupSchedule', e.target.value)}
                    className="input"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
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
                  최대 파일 크기 (MB)
                </label>
                <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
                    className="input"
                    min="1"
                    max="100"
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
                  세션 타임아웃 (분)
                </label>
                <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    className="input"
                    min="5"
                    max="120"
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 'var(--space-6)'
        }}>
          <button
              onClick={handleSaveSettings}
              className="btn btn--primary"
          >
            <FaCheck style={{ marginRight: 'var(--space-2)' }} /> 설정 저장
          </button>
        </div>
      </div>
  );
}
