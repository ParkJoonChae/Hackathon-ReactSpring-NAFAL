import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBullseye, FaLightbulb } from 'react-icons/fa';
import Header from '../components/Header';
import axios from 'axios';

/**
 * LoginPage - NAFAL 로그인 페이지
 * 스타일 가이드 기반 디자인 + 카카오 소셜로그인
 */
export default function LoginPage() {
  const navigate = useNavigate();
  // TODO: NAFAL.STORE 배포 시 변경 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
    withCredentials: true,
  });
  const REST_KEY = process.env.REACT_APP_KAKAO_REST_KEY;
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = '아이디(또는 이메일)를 입력해주세요';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요';
    else if (formData.password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("▶ handleSubmit 호출됨");
    console.log("▶ 요청 보낼 URL:", api.defaults.baseURL + "/api/login");
    console.log("▶ 요청 보낼 데이터:", {
      username: formData.username,
      passwordHash: formData.password
    });

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      // ✅ 백엔드와 실제 통신
      const res = await api.post('/api/login', {
        username: formData.username,
        passwordHash: formData.password,
      });

      if (res.data?.success) {
        alert('로그인 성공!');
        const user = res.data.user;
        localStorage.setItem('user', JSON.stringify(user));

// userType 우선, role 백업으로 안전하게 처리
        const userType = user?.userType || user?.role || 'USER';
        const type = String(userType).toUpperCase();


         // 이전 SSE 연결이 있다면 종료
        if (window.nafalEventSource) {
          window.eventSource.close();
          console.log('이전 SSE 연결 종료');
        }

         // SSE 연결 설정
window.nafalEventSource  = new EventSource('/NAFAL/api/sse/', {
    withCredentials: true
});
        
        // 연결 성공 시
        window.nafalEventSource.onopen = () => {
          console.log('SSE 연결 성공');
        };
        
        // 에러 발생 시
       window.nafalEventSource.onerror = (error) => {
          console.error('SSE 연결 에러:', error);
          window.nafalEventSource.close();
        };
        
        // 메시지 수신 시
        window.nafalEventSource.addEventListener('notification_connection', (event) => {
  console.log('연결 상태:', event.data);
  console.log('이벤트 ID:', event.lastEventId);
});
       // 알림 메시지 수신 시
window.nafalEventSource.addEventListener('notification', (event) => {
  const decodedData = decodeURIComponent(escape(event.data));
  console.log('알림 데이터:', decodedData);
  // 전역 알림 상태 업데이트
  window.dispatchEvent(new CustomEvent('nafalNotification', { 
    detail: { data: decodedData } 
  }));
});



        // 일반 메시지 수신 (이벤트 이름이 없는 경우)
        window.nafalEventSource.onmessage = (event) => {
          console.log('SSE 메시지 수신:', event.data);
        };

         localStorage.setItem('sseConnection', 'active');



        console.log('로그인 성공 후 user 객체:', user);
        console.log('userType:', user?.userType);
        console.log('role:', user?.role);
        console.log('최종 결정된 type:', type);

        const to =
            type === 'NAFAL' ? '/nafal-mypage' :
                '/';

        console.log('리다이렉트할 페이지:', to);

        navigate(to);
        return;
      } else {
        setErrors({
          username: '아이디 또는 비밀번호가 올바르지 않습니다',
          password: ' ',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        username: '로그인 중 오류가 발생했습니다',
        password: ' ',
      });
    } finally {
      setIsLoading(false);
    }
  };

// 핵심: response_type=code 로 요청, scope는 콘솔 설정과 일치
  const handleKakaoLogin = () => {
    const REST_KEY = process.env.REACT_APP_KAKAO_REST_KEY;
    // TODO: NAFAL.STORE 배포 시 변경 필요
    // 개발환경: http://localhost:3000/kakao/callback
    // 운영환경: https://nafal.store/kakao/callback
    const redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI || 'http://localhost:3000/kakao/callback';
    const state = 'kakao_' + Date.now();

    // 이메일까지 원하면 ['profile_nickname','account_email']
    const scopes = ['profile_nickname'];
    const authUrl =
        `https://kauth.kakao.com/oauth/authorize` +
        `?client_id=${encodeURIComponent(REST_KEY)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes.join(','))}` +
        `&state=${encodeURIComponent(state)}` +
        `&prompt=login`;

    window.location.href = authUrl;
  };



  useEffect(() => {
    // Kakao SDK가 로드되었는지 확인
    if (window.Kakao && typeof window.Kakao.isInitialized === 'function') {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init("2d522acc1b3c88c120dac49960c3c794"); // JavaScript 키
        console.log("Kakao SDK 초기화:", window.Kakao.isInitialized());
      }
    } else {
      console.log("Kakao SDK가 아직 로드되지 않았습니다.");
    }
  }, []);

  const handleGoogleLogin = () => {
    alert('구글 로그인 (개발 중)');
  };

  return (
      <div className="login-page">
        <Header />

        <div style={{ height: 'var(--header-height)' }} />

        {/* 로그인 폼 */}
        <div style={{
          minHeight: 'calc(100vh - var(--header-height))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          background: 'linear-gradient(135deg, var(--mint-50) 0%, var(--bg-primary) 100%)'
        }}>
          <div className="form-container">
            {/* 헤더 */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <h1 style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)',
                fontFamily: 'var(--font-family)'
              }}>
                NAFAL 로그인
              </h1>
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)'
              }}>
                지속가능한 경매 플랫폼에 오신 것을 환영합니다
              </p>
            </div>

            {/* 이메일 로그인 폼 */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  이메일
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="이메일을 입력하세요"
                    className="text-field"
                    required
                />
                {errors.username && (
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--orange-500)',
                      marginTop: 'var(--space-1)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {errors.username}
                    </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  비밀번호
                </label>
                <div className="password-field-container">
                  <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="비밀번호를 입력하세요"
                      className="text-field"
                      required
                  />
                  <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? (
                        <svg className="icon-eye-close" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    ) : (
                        <svg className="icon-eye-open" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.45703 12C3.73128 7.94288 7.52159 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C20.2672 16.0571 16.4769 19 11.9992 19C7.52159 19 3.73128 16.0571 2.45703 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--orange-500)',
                      marginTop: 'var(--space-1)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {errors.password}
                    </div>
                )}
              </div>

              <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-styleguide"
                  style={{
                    marginBottom: 'var(--space-4)',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
              >
                {isLoading ? (
                    <>
                      <div className="loading" style={{ width: '16px', height: '16px' }} />
                      로그인 중...
                    </>
                ) : (
                    '로그인'
                )}
              </button>
            </form>



            {/* 구분선 */}
            <div className="form-divider">
              또는 소셜 계정으로 로그인
            </div>

            {/* 소셜 로그인 */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <button
                  type="button"
                  onClick={handleKakaoLogin}
                  className="btn-social btn-social--kakao"
                  style={{ marginBottom: 'var(--space-3)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                </svg>
                카카오로 시작하기
              </button>

              <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="btn-social"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                구글로 시작하기
              </button>
            </div>

            {/* 링크들 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)'
            }}>
              <Link
                  to="/find-password"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                비밀번호 찾기
              </Link>
              <Link
                  to="/signup"
                  style={{
                    color: '#8A38F5',
                    textDecoration: 'none',
                    fontWeight: 'var(--weight-medium)',
                    transition: 'opacity var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                회원가입
              </Link>
            </div>

            {/* 게스트 로그인 */}
            <div style={{
              textAlign: 'center',
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--border-primary)'
            }}>
              <button
                  type="button"
                  onClick={() => {
                    console.log('Guest login');
                    alert('게스트로 둘러보기 (개발 중)');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    fontSize: 'var(--text-sm)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-tertiary)'}
              >
                게스트로 둘러보기
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
