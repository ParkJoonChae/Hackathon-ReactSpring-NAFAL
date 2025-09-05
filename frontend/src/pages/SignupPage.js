import React, { useState } from 'react';
import Header from '../components/Header';
import axios from "axios";

/**
 * SignupPage - NAFAL 회원가입 페이지
 * 스타일 가이드 기반 디자인 + 카카오 소셜로그인
 */
export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const normalizePhone = (s) => (s || '').replace(/[^0-9]/g, '');
  const [dupHint, setDupHint] = useState({ email: "", phone: "" });
  // 이메일 인증 추가
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [countdown, setCountdown] = useState(180); // 3분 = 180초
  const timerRef = React.useRef(null);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/NAFAL",
    withCredentials: true,
  });


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다';
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.phone) newErrors.phone = '휴대폰 번호를 입력해주세요';
    else if (!/^01[0-9][0-9]{7,8}$/.test(normalizePhone(formData.phone))) {
      newErrors.phone = '올바른 휴대폰 번호 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)){
      newErrors.password = '비밀번호는 영문과 숫자를 포함해야 합니다';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '이용약관에 동의해주세요';
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = '개인정보처리방침에 동의해주세요';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 1) 클라이언트 검증
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // 2) 서버 중복 재확인 (이메일/전화 모두)
      const payload = {
        username: formData.email,
        phoneNumber: normalizePhone(formData.phone),
      };
      const { data } = await api.post("/api/check-id-or-phone", {
        username: formData.email,
        phoneNumber: normalizePhone(formData.phone),
      });
      const idDup    = !!data.checkId;
      const phoneDup = !!data.checkPhoneNumber;

      if (idDup || phoneDup) {
        setErrors(prev => ({
          ...prev,
          email: idDup ? (data.message || "이미 존재하는 아이디(이메일)입니다.") : "",
          phone: phoneDup ? (data.message || "이미 존재하는 전화번호입니다.") : "",
        }));
        setIsLoading(false);
        return;
      }

       // 이메일 검증 추가
       if (!isEmailVerified) {
            setErrors(prev => ({ ...prev, email: '이메일 인증을 완료해주세요' }));
            setIsLoading(false);
            return;
        }

      // 3) 가입 요청 (백엔드 기대 키와 매핑)
      const signupBody = {
        username: formData.email,
        passwordHash: formData.password,         // 해시는 백엔드에서!
        name: formData.name,
        phoneNumber: normalizePhone(formData.phone),
        userType: "USER",
        agreeToTerms: formData.agreeToTerms,
        agreeToPrivacy: formData.agreeToPrivacy,
        agreeToMarketing: formData.agreeToMarketing,
      };

      const res = await api.post("/api/signup", signupBody, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.success) {
        alert("회원가입 성공!");
        window.location.href = "/login";
      } else {
        alert(res.data?.message || "회원가입 실패");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };


  const checkDuplicateField = async (field) => {
    try {
      const payload = {
        username: formData.email,
        phoneNumber: normalizePhone(formData.phone),
      };
      const { data } = await api.post("/api/check-id-or-phone", payload);

      const idDup    = !!data.checkId;
      const phoneDup = !!data.checkPhoneNumber;

      // 필드별로 에러/힌트 갱신
      if (field === "email") {
        setErrors(prev => ({ ...prev, email: idDup ? (data.message || "이미 존재하는 아이디(이메일)입니다.") : "" }));
        setDupHint(prev => ({ ...prev, email: !idDup && formData.email ? "사용 가능한 아이디(이메일)입니다." : "" }));
      }
      if (field === "phone") {
        setErrors(prev => ({ ...prev, phone: phoneDup ? (data.message || "이미 존재하는 전화번호입니다.") : "" }));
        setDupHint(prev => ({ ...prev, phone: !phoneDup && formData.phone ? "사용 가능한 전화번호입니다." : "" }));
      }
    } catch (e) {
      console.error("중복 확인 오류:", e);
    }
  };



  const handleKakaoSignup = () => {
    console.log('Kakao signup clicked');
    alert('카카오 회원가입 (개발 중)');
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
    alert('구글 회원가입 (개발 중)');
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      agreeToTerms: checked,
      agreeToPrivacy: checked,
      agreeToMarketing: checked
    }));
  };

  // 추가: 타이머 시작/정지
  const startTimer = () => {
    clearInterval(timerRef.current);
    setCountdown(180);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  const stopTimer = () => clearInterval(timerRef.current);

// 이메일 바뀌면 인증상태 초기화
  React.useEffect(() => {
    setVerificationSent(false);
    setIsEmailVerified(false);
    setEmailCode('');
    stopTimer();
    setCountdown(180);
    return () => stopTimer();
  }, [formData.email]);

  // 추가: 인증코드 발송
  const sendEmailCode = async () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: '이메일을 입력해주세요' }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다' }));
      return;
    }
    
    try {
      // 즉시 UI 업데이트 - 인증코드 입력 칸을 바로 표시
      setIsSendingCode(true);
      setVerificationSent(true); // 즉시 입력 칸 표시
      setIsEmailVerified(false);
      setEmailCode(''); // 기존 코드 초기화

      // 중복검사 선행 (선택) — 이미 가입된 이메일이면 발송 안 함
      const { data: dup } = await api.post('/api/check-id-or-phone', {
        username: formData.email,
        phoneNumber: normalizePhone(formData.phone),
      });
      if (dup.checkId) {
        setErrors(prev => ({ ...prev, email: dup.message || '이미 존재하는 아이디(이메일)입니다.' }));
        setIsSendingCode(false);
        setVerificationSent(false); // 에러 시 입력 칸 숨김
        return;
      }

      // 실제 발송
      const res = await api.post('/api/email/send-code', { email: formData.email });
      if (res.data?.success) {
        // 발송 성공 시 타이머 시작
        startTimer();
        setErrors(prev => ({ ...prev, email: '' })); // 에러 메시지 클리어
      } else {
        setErrors(prev => ({ ...prev, email: res.data?.message || '인증코드 발송에 실패했습니다' }));
        setVerificationSent(false); // 실패 시 입력 칸 숨김
      }
    } catch (e) {
      console.error(e);
      setErrors(prev => ({ ...prev, email: '서버 오류로 인증코드 발송에 실패했습니다' }));
      setVerificationSent(false); // 에러 시 입력 칸 숨김
    } finally {
      setIsSendingCode(false);
    }
  };

// 추가: 인증코드 검증
  const verifyEmailCode = async () => {
    if (!verificationSent) return;
    if (!emailCode) {
      setErrors(prev => ({ ...prev, email: '인증코드를 입력하세요' }));
      return;
    }
    if (countdown === 0) {
      setErrors(prev => ({ ...prev, email: '인증시간이 만료되었습니다. 다시 발송해주세요' }));
      return;
    }
    try {
      const res = await api.post('/api/email/verify-code' 
          , {
        email: formData.email,
        code: emailCode,
      });
      if (res.data?.success) {
        setIsEmailVerified(true);
        stopTimer();
        setDupHint(prev => ({ ...prev, email: '이메일 인증 완료' }));
      } else {
        setErrors(prev => ({ ...prev, email: res.data?.message || '인증코드가 올바르지 않습니다' }));
      }
    } catch (e) {
      console.error(e);
      setErrors(prev => ({ ...prev, email: '서버 오류로 인증에 실패했습니다' }));
    }
  };


  return (
      <div className="signup-page">
        <Header />

        <div style={{ height: 'var(--header-height)' }} />

        {/* 회원가입 폼 */}
        <div style={{
          minHeight: 'calc(100vh - var(--header-height))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          background: 'var(--paper)' /* 하얀색 배경으로 변경 */
        }}>
          <div className="form-container" style={{ maxWidth: '460px' }}>
            {/* 헤더 */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <h1 style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)',
                fontFamily: 'var(--font-family)'
              }}>
                NAFAL 회원가입
              </h1>
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)'
              }}>
                지속가능한 경매 플랫폼에서 새로운 가치를 발견하세요
              </p>
            </div>

            {/* 소셜 회원가입 */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <button
                  type="button"
                  onClick={handleKakaoSignup}
                  className="btn-social btn-social--kakao"
                  style={{ marginBottom: 'var(--space-3)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                </svg>
                카카오로 빠른 가입
              </button>

              <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="btn-social"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                구글로 빠른 가입
              </button>
            </div>

            {/* 구분선 */}
            <div className="form-divider">
              또는 이메일로 회원가입
            </div>

            {/* 회원가입 폼 */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  이름 *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="실명을 입력하세요"
                    className="text-field"
                    required
                />
                {errors.name && (
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--orange-500)',
                      marginTop: 'var(--space-1)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {errors.name}
                    </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  이메일 *
                </label>

                {/* 이메일 + 버튼 한 줄 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => checkDuplicateField("email")}
                      placeholder="이메일을 입력하세요"
                      className="text-field"
                      required
                      disabled={isEmailVerified} // 인증완료 후 잠금
                      style={{ flex: 1 }}
                  />
                  <button
                      type="button"
                      onClick={sendEmailCode}
                      disabled={isSendingCode || isEmailVerified}
                      className="btn-styleguide"
                      style={{ whiteSpace: 'nowrap' }}
                      title={isEmailVerified ? '이미 인증 완료됨' : '인증코드 발송'}
                  >
                    {isEmailVerified ? '인증완료' : (isSendingCode ? '발송중…' : '인증코드 발송')}
                  </button>
                </div>

                {/* 발송중 텍스트 + 로딩 */}
                {isSendingCode && (
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      <span className="loading" style={{ width: 14, height: 14 }} />
                      인증코드 발송중입니다…
                    </div>
                )}

                {/* 힌트/에러 */}
                {!errors.email && dupHint.email && (
                    <div style={{ fontSize: 'var(--text-xs)', color: isEmailVerified ? 'var(--green-600)' : 'var(--text-secondary)', marginTop: 4 }}>
                      {dupHint.email}
                    </div>
                )}
                {errors.email && (
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--orange-500)', marginTop: 4 }}>
                      {errors.email}
                    </div>
                )}

                {/* 인증 입력/카운트다운 */}
                {verificationSent && !isEmailVerified && (
                    <div style={{ marginTop: 10 }}>
                      <label htmlFor="emailCode" className="form-label" style={{ fontSize: 'var(--text-sm)' }}>
                        이메일로 전송된 인증코드
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            id="emailCode"
                            name="emailCode"
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value)}
                            placeholder="6자리 코드"
                            className="text-field"
                            maxLength={10}
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={verifyEmailCode}
                            className="btn-styleguide"
                        >
                          인증하기
                        </button>
                      </div>

                      {/* 타이머 & 재발송 */}
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 'var(--text-sm)', color: countdown > 0 ? 'var(--text-secondary)' : 'var(--orange-600)' }}>
                          남은 시간: {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                        </div>
                        <button
                            type="button"
                            onClick={sendEmailCode}
                            className="btn-link"
                            style={{ fontSize: 'var(--text-sm)', textDecoration: 'underline', color: '#8A38F5' }}
                        >
                          재발송
                        </button>
                      </div>
                    </div>
                )}
              </div>


              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  휴대폰 번호 *
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={() => checkDuplicateField("phone")}
                    placeholder="010-1234-5678"
                    className="text-field"
                    required
                />
                {errors.phone && (
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--orange-500)', marginTop: 'var(--space-1)' }}>
                      {errors.phone}
                    </div>
                )}
                {!errors.phone && dupHint.phone && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--green-600)', marginTop: '4px' }}>
                      {dupHint.phone}
                    </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  비밀번호 *
                </label>
                <div className="password-field-container">
                  <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="영문, 숫자 조합 8자 이상"
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

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  비밀번호 확인 *
                </label>
                <div className="password-field-container">
                  <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="비밀번호를 다시 입력하세요"
                      className="text-field"
                      required
                  />
                  <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                  >
                    {showConfirmPassword ? (
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
                {errors.confirmPassword && (
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--orange-500)',
                      marginTop: 'var(--space-1)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {errors.confirmPassword}
                    </div>
                )}
              </div>

              {/* 약관 동의 */}
              <div style={{
                marginBottom: 'var(--space-6)',
                padding: 'var(--space-4)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)'
              }}>
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--weight-medium)'
                  }}>
                    <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={formData.agreeToTerms && formData.agreeToPrivacy && formData.agreeToMarketing}
                        style={{ accentColor: '#8A38F5' }}
                    />
                    전체 동의
                  </label>
                </div>

                <div style={{
                  paddingLeft: 'var(--space-6)',
                  borderTop: '1px solid var(--border-primary)',
                  paddingTop: 'var(--space-3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        style={{ accentColor: '#8A38F5' }}
                    />
                    [필수] 이용약관 동의
                  </label>
                  {errors.agreeToTerms && (
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--orange-500)',
                        marginLeft: '24px',
                        fontFamily: 'var(--font-family)'
                      }}>
                        {errors.agreeToTerms}
                      </div>
                  )}

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    <input
                        type="checkbox"
                        name="agreeToPrivacy"
                        checked={formData.agreeToPrivacy}
                        onChange={handleInputChange}
                        style={{ accentColor: '#8A38F5' }}
                    />
                    [필수] 개인정보처리방침 동의
                  </label>
                  {errors.agreeToPrivacy && (
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--orange-500)',
                        marginLeft: '24px',
                        fontFamily: 'var(--font-family)'
                      }}>
                        {errors.agreeToPrivacy}
                      </div>
                  )}

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    <input
                        type="checkbox"
                        name="agreeToMarketing"
                        checked={formData.agreeToMarketing}
                        onChange={handleInputChange}
                        style={{ accentColor: '#8A38F5' }}
                    />
                    [선택] 마케팅 정보 수신 동의
                  </label>
                </div>
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
                      가입 중...
                    </>
                ) : (
                    '회원가입'
                )}
              </button>
            </form>

            {/* 로그인 링크 */}
            <div style={{
              textAlign: 'center',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)'
            }}>
              이미 계정이 있으신가요?{' '}
              <a
                  href="/login"
                  style={{
                    color: '#8A38F5',
                    textDecoration: 'none',
                    fontWeight: 'var(--weight-medium)',
                    transition: 'opacity var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                로그인
              </a>
            </div>
          </div>
        </div>
      </div>
  );
}
