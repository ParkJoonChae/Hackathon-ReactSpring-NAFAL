import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaCheck, FaArrowLeft } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from "axios";

// TODO: NAFAL.STORE 배포 시 변경 필요
// 개발환경: http://localhost:8080/NAFAL/api
// 운영환경: https://api.nafal.store/api 또는 백엔드 서버 도메인
const API_BASE = process.env.REACT_APP_API_BASE_URL ? 
  `${process.env.REACT_APP_API_BASE_URL}/api` : 
  "http://localhost:8080/NAFAL/api";

/**
 * FindPassword - NAFAL 비밀번호 찾기 (이메일만)
 */
export default function FindPassword() {
  const [resetToken, setResetToken] = useState("");
  const [step, setStep] = useState(1); // 1: 정보입력, 2: 인증번호, 3: 새비밀번호설정, 4: 완료
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    userId: '',              // 이메일로 사용
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [timer, setTimer] = useState(180); // 3분 = 180초

  React.useEffect(() => {
    let interval = null;
    if (verificationSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setVerificationSent(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [verificationSent, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1 검증: 이름 + 이메일만
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요';

    if (!formData.userId.trim()) newErrors.userId = '아이디(이메일)를 입력해주세요';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userId)) {
      newErrors.userId = '올바른 이메일 형식이 아닙니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = '인증번호를 입력해주세요';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = '인증번호는 6자리입니다';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = '영문과 숫자를 포함해야 합니다';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const sendVerificationCode = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        userId: formData.userId,
        // 백엔드가 phone 필드를 요구한다면 아래 주석 해제
        // phone: ""
      };

      const { data } = await axios.post(`${API_BASE}/send-verification`, payload);
      if (!data?.success) {
        throw new Error(data?.message || "인증코드 발송 실패");
      }

      setVerificationSent(true);
      setTimer(180);
      setStep(2);
      alert("인증코드를 이메일로 발송했습니다.");
    } catch (err) {
      console.error(err);
      alert(err.message || "인증코드 발송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const payload = {
        userId: formData.userId,
        verificationCode: formData.verificationCode
      };

      const { data } = await axios.post(`${API_BASE}/verify-code`, payload);
      if (!data?.success || !data?.token) {
        throw new Error(data?.message || "인증 실패");
      }

      setResetToken(data.token);
      setStep(3);
      alert("인증이 완료되었습니다.");
    } catch (err) {
      console.error(err);
      setErrors({ verificationCode: err.message || "인증번호가 올바르지 않습니다" });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    try {
      const payload = {
        userId: formData.userId,
        newPassword: formData.newPassword,
        resetToken
      };

      const { data } = await axios.put(`${API_BASE}/reset-password`, payload);
      if (!data?.success) {
        throw new Error(data?.message || "비밀번호 재설정 실패");
      }
      setStep(4);
    } catch (err) {
      console.error(err);
      alert(err.message || "비밀번호 재설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    if (timer > 0) return;
    await sendVerificationCode();
  };

  return (
      <div className="find-password-page">
        <Header />
        <div style={{ height: 'var(--header-height)' }} />

        <div className="container" style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-4)',
          minHeight: 'calc(100vh - var(--header-height))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* 헤더 */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <h1 style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                margin: '0 0 var(--space-2) 0',
                fontFamily: 'var(--font-family)'
              }}>
                비밀번호 찾기
              </h1>
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                margin: 0,
                fontFamily: 'var(--font-family)'
              }}>
                {step === 1 && '계정 정보를 입력해주세요'}
                {step === 2 && '인증번호를 입력해주세요'}
                {step === 3 && '새 비밀번호를 설정해주세요'}
                {step === 4 && '비밀번호 재설정이 완료되었습니다'}
              </p>
            </div>

            {/* 진행 단계 표시 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 'var(--space-8)',
              position: 'relative'
            }}>
              {[1, 2, 3, 4].map((stepNum, index) => (
                  <React.Fragment key={stepNum}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: step >= stepNum ? 'var(--mint-500)' : 'var(--bg-secondary)',
                      border: `2px solid ${step >= stepNum ? 'var(--mint-500)' : 'var(--border-primary)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-bold)',
                      color: step >= stepNum ? 'white' : 'var(--text-tertiary)',
                      fontFamily: 'var(--font-family)',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      {step > stepNum ? <FaCheck /> : stepNum}
                    </div>
                    {index < 3 && (
                        <div style={{
                          width: '60px',
                          height: '2px',
                          background: step > stepNum ? 'var(--mint-500)' : 'var(--border-primary)',
                          alignSelf: 'center',
                          zIndex: 1
                        }} />
                    )}
                  </React.Fragment>
              ))}
            </div>

            {/* Step 1: 정보 입력 (이름 + 이메일만) */}
            {step === 1 && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* 이름 */}
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
                      <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="홍길동"
                            style={{
                              width: '100%',
                              padding: 'var(--space-3) var(--space-10) var(--space-3) var(--space-4)',
                              border: `1px solid ${errors.name ? 'var(--error)' : 'var(--border-primary)'}`,
                              borderRadius: 'var(--radius-md)',
                              fontSize: 'var(--text-base)',
                              fontFamily: 'var(--font-family)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)'
                            }}
                        />
                        <FaUser style={{
                          position: 'absolute',
                          right: 'var(--space-3)',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-tertiary)'
                        }} />
                      </div>
                      {errors.name && (
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--error)',
                            marginTop: 'var(--space-1)',
                            fontFamily: 'var(--font-family)'
                          }}>
                            {errors.name}
                          </div>
                      )}
                    </div>

                    {/* 아이디(이메일) */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-medium)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-2)',
                        fontFamily: 'var(--font-family)'
                      }}>
                        아이디 *
                      </label>
                      <input
                          type="text"
                          name="userId"
                          value={formData.userId}
                          onChange={handleInputChange}
                          placeholder="user@nafal.com"
                          style={{
                            width: '100%',
                            padding: 'var(--space-3) var(--space-4)',
                            border: `1px solid ${errors.userId ? 'var(--error)' : 'var(--border-primary)'}`,
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-base)',
                            fontFamily: 'var(--font-family)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)'
                          }}
                      />
                      {errors.userId && (
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--error)',
                            marginTop: 'var(--space-1)',
                            fontFamily: 'var(--font-family)'
                          }}>
                            {errors.userId}
                          </div>
                      )}
                    </div>
                  </div>

                  <button
                      onClick={sendVerificationCode}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: 'var(--space-4)',
                        background: loading ? 'var(--text-tertiary)' : 'var(--mint-500)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--weight-bold)',
                        fontFamily: 'var(--font-family)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all var(--transition-fast)',
                        marginTop: 'var(--space-6)'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.background = 'var(--mint-600)';
                          e.target.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.background = 'var(--mint-500)';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                  >
                    {loading ? '발송 중...' : '인증번호 발송'}
                  </button>
                </div>
            )}

            {/* Step 2: 인증번호 입력 */}
            {step === 2 && (
                <div>
                  <div style={{
                    background: 'var(--mint-50)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-6)',
                    border: '1px solid var(--mint-200)'
                  }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--mint-700)',
                      fontFamily: 'var(--font-family)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      ✉️ 인증번호가 이메일로 발송되었습니다
                    </div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {`${formData.userId} 로 인증번호를 발송했습니다`}
                    </div>
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
                      인증번호 (6자리) *
                    </label>
                    <input
                        type="text"
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={handleInputChange}
                        placeholder="123456"
                        maxLength={6}
                        style={{
                          width: '100%',
                          padding: 'var(--space-4)',
                          border: `1px solid ${errors.verificationCode ? 'var(--error)' : 'var(--border-primary)'}`,
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-lg)',
                          fontFamily: 'var(--font-family)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          letterSpacing: '0.5em'
                        }}
                    />
                    {errors.verificationCode && (
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--error)',
                          marginTop: 'var(--space-1)',
                          fontFamily: 'var(--font-family)'
                        }}>
                          {errors.verificationCode}
                        </div>
                    )}
                  </div>

                  {/* 타이머 및 재발송 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'var(--space-4)',
                    marginBottom: 'var(--space-6)'
                  }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: timer > 60 ? 'var(--text-secondary)' : 'var(--error)',
                      fontFamily: 'var(--font-family)',
                      fontWeight: 'var(--weight-medium)'
                    }}>
                      남은 시간: {formatTime(timer)}
                    </div>
                    <button
                        onClick={resendVerificationCode}
                        disabled={loading || timer > 0}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: timer > 0 ? 'var(--text-tertiary)' : 'var(--mint-600)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--weight-medium)',
                          fontFamily: 'var(--font-family)',
                          cursor: timer > 0 ? 'not-allowed' : 'pointer',
                          textDecoration: 'underline'
                        }}
                    >
                      {loading ? '발송 중...' : '재발송'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button
                        onClick={() => setStep(1)}
                        style={{
                          flex: 1,
                          padding: 'var(--space-4)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--weight-medium)',
                          fontFamily: 'var(--font-family)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'var(--space-2)'
                        }}
                        onMouseEnter={(e) => { e.target.style.background = 'var(--bg-primary)'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'var(--bg-secondary)'; }}
                    >
                      <FaArrowLeft /> 이전
                    </button>
                    <button
                        onClick={verifyCode}
                        disabled={loading}
                        style={{
                          flex: 2,
                          padding: 'var(--space-4)',
                          background: loading ? 'var(--text-tertiary)' : 'var(--mint-500)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'var(--weight-bold)',
                          fontFamily: 'var(--font-family)',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.background = 'var(--mint-600)';
                            e.target.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.background = 'var(--mint-500)';
                            e.target.style.transform = 'translateY(0)';
                          }
                        }}
                    >
                      {loading ? '확인 중...' : '인증번호 확인'}
                    </button>
                  </div>
                </div>
            )}

            {/* Step 3: 새 비밀번호 설정 */}
            {step === 3 && (
                <div>
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
                        새 비밀번호 *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="8자 이상, 영문+숫자 포함"
                            style={{
                              width: '100%',
                              padding: 'var(--space-3) var(--space-10) var(--space-3) var(--space-4)',
                              border: `1px solid ${errors.newPassword ? 'var(--error)' : 'var(--border-primary)'}`,
                              borderRadius: 'var(--radius-md)',
                              fontSize: 'var(--text-base)',
                              fontFamily: 'var(--font-family)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: 'var(--space-3)',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer'
                            }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.newPassword && (
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--error)',
                            marginTop: 'var(--space-1)',
                            fontFamily: 'var(--font-family)'
                          }}>
                            {errors.newPassword}
                          </div>
                      )}
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
                      <div style={{ position: 'relative' }}>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="비밀번호를 다시 입력해주세요"
                            style={{
                              width: '100%',
                              padding: 'var(--space-3) var(--space-10) var(--space-3) var(--space-4)',
                              border: `1px solid ${errors.confirmPassword ? 'var(--error)' : 'var(--border-primary)'}`,
                              borderRadius: 'var(--radius-md)',
                              fontSize: 'var(--text-base)',
                              fontFamily: 'var(--font-family)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                              position: 'absolute',
                              right: 'var(--space-3)',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer'
                            }}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--error)',
                            marginTop: 'var(--space-1)',
                            fontFamily: 'var(--font-family)'
                          }}>
                            {errors.confirmPassword}
                          </div>
                      )}
                    </div>
                  </div>

                  {/* 비밀번호 안내 */}
                  <div style={{
                    background: 'var(--orange-50)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    marginTop: 'var(--space-4)',
                    marginBottom: 'var(--space-6)',
                    border: '1px solid var(--orange-200)'
                  }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--orange-700)',
                      fontFamily: 'var(--font-family)',
                      marginBottom: 'var(--space-2)',
                      fontWeight: 'var(--weight-medium)'
                    }}>
                      🔐 비밀번호 설정 규칙
                    </div>
                    <ul style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)',
                      margin: 0,
                      paddingLeft: 'var(--space-4)'
                    }}>
                      <li>8자 이상 입력</li>
                      <li>영문과 숫자 조합 필수</li>
                      <li>특수문자 사용 권장</li>
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button
                        onClick={() => setStep(2)}
                        style={{
                          flex: 1,
                          padding: 'var(--space-4)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--weight-medium)',
                          fontFamily: 'var(--font-family)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'var(--space-2)'
                        }}
                        onMouseEnter={(e) => { e.target.style.background = 'var(--bg-primary)'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'var(--bg-secondary)'; }}
                    >
                      <FaArrowLeft /> 이전
                    </button>
                    <button
                        onClick={resetPassword}
                        disabled={loading}
                        style={{
                          flex: 2,
                          padding: 'var(--space-4)',
                          background: loading ? 'var(--text-tertiary)' : 'var(--mint-500)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'var(--weight-bold)',
                          fontFamily: 'var(--font-family)',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.background = 'var(--mint-600)';
                            e.target.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.background = 'var(--mint-500)';
                            e.target.style.transform = 'translateY(0)';
                          }
                        }}
                    >
                      {loading ? '설정 중...' : '비밀번호 재설정'}
                    </button>
                  </div>
                </div>
            )}

            {/* Step 4: 완료 */}
            {step === 4 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)', color: 'var(--success)' }}>
                    ✅
                  </div>
                  <h3 style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--text-primary)',
                    margin: '0 0 var(--space-2) 0',
                    fontFamily: 'var(--font-family)'
                  }}>
                    비밀번호 재설정이 완료되었습니다!
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-secondary)',
                    margin: '0 0 var(--space-8) 0',
                    fontFamily: 'var(--font-family)',
                    lineHeight: 1.6
                  }}>
                    새로운 비밀번호로 로그인해주세요.
                  </p>

                  <a
                      href="/login"
                      style={{
                        display: 'inline-block',
                        width: '100%',
                        padding: 'var(--space-4)',
                        background: 'var(--mint-500)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--weight-bold)',
                        fontFamily: 'var(--font-family)',
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
                    로그인 페이지로 이동
                  </a>
                </div>
            )}

            {/* 도움말 링크 (1-3단계에서만 표시) */}
            {step < 4 && (
                <div style={{
                  textAlign: 'center',
                  marginTop: 'var(--space-6)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--border-primary)'
                }}>
                  <a
                      href="/login"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-family)',
                        transition: 'color var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => { e.target.style.color = 'var(--mint-600)'; }}
                      onMouseLeave={(e) => { e.target.style.color = 'var(--text-tertiary)'; }}
                  >
                    로그인 페이지로 돌아가기
                  </a>
                </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
  );
}
