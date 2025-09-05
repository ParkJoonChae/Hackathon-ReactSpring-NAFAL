import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaGem,
  FaCreditCard,
  FaStar
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * PurchasePage - NAFAL 포인트 구매 페이지
 * 카드 결제 및 간편결제(삼성페이, 카카오페이 등) 지원
 * style-guide.css 기반 디자인 시스템 적용
 */
export default function PurchasePage() {
  const [user, setUser] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(10000);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [iamportReady, setIamportReady] = useState(false);
  const isIamportMethod = (method) => ['easy', 'kakao', 'naver', 'payco', 'toss', 'samsung'].includes(method);
  const TOSS_CHANNEL_KEY = process.env.REACT_APP_TOSS_CHANNEL_KEY || 'channel-key-135ad149-7c67-4c74-8408-8b91b2ea9cd5';
  const PORTONE_STORE_ID = process.env.REACT_APP_PORTONE_STORE_ID || 'store-503c45e1-9346-41a5-90d5-e08f7ae76590';

  // Stripe Checkout 세션 생성 → 리다이렉트
  const handleStripeCheckout = async () => {
    try {

      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      const { data } = await axios.post(`${apiBase}/api/stripe/create-checkout-session`, {
        amount: selectedAmount,
        email: user?.email,
        successUrl: window.location.origin + '/mypage',
        cancelUrl: window.location.origin + '/purchase'
      });
      if (!data?.url) throw new Error(data?.error || '세션 생성 실패');
      window.location.href = data.url;
    } catch (err) {
      alert(`Stripe 결제 준비 중 오류: ${err.message}`);
    }
  };

  // 포인트 패키지 옵션
  const pointPackages = [
    { amount: 10000, bonus: 0, popular: false },
    { amount: 30000, bonus: 1000, popular: true },
    { amount: 50000, bonus: 2500, popular: false },
    { amount: 100000, bonus: 7000, popular: false },
    { amount: 200000, bonus: 20000, popular: false },
    { amount: 500000, bonus: 75000, popular: false }
  ];

  // 간편결제 옵션 제거(요청에 따라 버튼만 표시)

  useEffect(() => {
    // 로그인 상태 확인
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);


  // 아임포트 스크립트 로드 및 초기화 (간편결제 선택 시에만)
  useEffect(() => {
    if (!isIamportMethod(paymentMethod)) return;
    let script;
    const initImp = () => {
      if (!window.IMP) return;
      try {
        // 고객사 식별코드로 초기화
        const merchantCode = 'imp21132478';
        window.IMP.init(merchantCode);
        setIamportReady(true);
      } catch (e) {
        console.error('IMP init error:', e);
      }
    };
    if (window.IMP) {
      initImp();
    } else {
      script = document.createElement('script');
      script.src = 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js';
      script.async = true;
      script.onload = initImp;
      document.head.appendChild(script);
    }
    return () => {
      setIamportReady(false);
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [paymentMethod]);

  const requestIamportPay = async () => {
    if (!iamportReady || !window.IMP) {
      alert('결제 모듈 초기화 중입니다. 잠시 후 다시 시도해주세요.');
      throw new Error('IMP not ready');
    }

    const imp = window.IMP;

    // 간편결제: 일반결제(uplus)로 테스트
    let pg = 'uplus';
    // channelKey는 uplus 일반결제에서는 사용하지 않음

    const merchantUid = `mid_${Date.now()}`;
    const amount = selectedAmount;

    // 사전 등록

    const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
    await axios.post(`${apiBase}/api/iamport/prepare`, { merchant_uid: merchantUid, amount });

    const rsp = await new Promise((resolve, reject) => {
      imp.request_pay(
        {
          pg,
          pay_method: 'card',
          merchant_uid: merchantUid,
          name: `NAFAL 포인트 충전 ${amount.toLocaleString()}P`,
          amount,
          buyer_email: user?.email || 'test@nafal.com',
          buyer_name: user?.name || '테스트유저',
          // 일반결제(uplus)에서는 channelKey 불필요
          custom_data: JSON.stringify({ storeId: PORTONE_STORE_ID })
        },
        (resp) => (resp.success ? resolve(resp) : reject(new Error(resp.error_msg || '결제에 실패했습니다.')))
      );
    });

    // 검증
    const { data: verifyRes } = await axios.post(`${apiBase}/api/iamport/verify`, { imp_uid: rsp.imp_uid, amount });
    if (!verifyRes?.verified) throw new Error('결제 검증에 실패했습니다.');
    return rsp;
  };

  // 간편결제 버튼 즉시 실행 핸들러: 클릭 즉시 아임포트 결제창 호출
  const handleIamportQuick = async () => {
    try {
      if (!iamportReady) {
        alert('결제 모듈 초기화 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      setLoading(true);
      const rsp = await requestIamportPay();
      
      // 아임포트 결제 완료 후 실제 지갑 충전
      const selectedPackage = pointPackages.find(pkg => pkg.amount === selectedAmount);
      const totalPoints = selectedPackage.amount + selectedPackage.bonus;
      
      // 세션에서 사용자 정보 확인
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      const { data: sessionData } = await axios.get(`${apiBase}/api/user/session`, { withCredentials: true });
      
      if (!sessionData.success) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
      }
      
      // 기존 포인트 충전 API 호출
      const { data: chargeData } = await axios.post(`${apiBase}/api/user/${sessionData.userId}/wallet/charge`, {
        amount: totalPoints
      }, { withCredentials: true });
      
      if (chargeData.success) {
        alert(
          `포인트 충전이 완료되었습니다! 💰\n\n` +
          `결제번호: ${rsp.merchant_uid}\n` +
          `기본 포인트: ${selectedAmount.toLocaleString()}P\n` +
          `보너스 포인트: ${selectedPackage.bonus.toLocaleString()}P\n` +
          `총 충전: ${totalPoints.toLocaleString()}P\n` +
          `현재 잔액: ${chargeData.newBalance.toLocaleString()}P`
        );
        window.location.href = '/mypage';
      } else {
        throw new Error(chargeData.message || '포인트 충전에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert(e.message || '결제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카드 입력 폼 제거에 따라 핸들러 미사용 → 안전하게 no-op 유지
  const handleCardInputChange = () => {};

  const handlePurchase = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setLoading(true);

    // 카드 입력 검증 제거 (Stripe Checkout 사용)

    try {
      if (paymentMethod === 'stripe' || paymentMethod === 'card') {
        // 결제 API 경로로 테스트: Stripe Checkout 세션 생성 후 리다이렉트
        setLoading(false);
        handleStripeCheckout();
        return;
      }
      // 아임포트 테스트 결제 (간편결제 선택 시)
      if (['kakao', 'naver', 'payco', 'toss', 'samsung'].includes(paymentMethod)) {
        const rsp = await requestIamportPay();

        // 아임포트 결제 완료 후 실제 지갑 충전
        const selectedPackage = pointPackages.find(pkg => pkg.amount === selectedAmount);
        const totalPoints = selectedPackage.amount + selectedPackage.bonus;
        
        // 세션에서 사용자 정보 확인
        const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
        const { data: sessionData } = await axios.get(`${apiBase}/api/user/session`, { withCredentials: true });
        
        if (!sessionData.success) {
          alert('로그인이 필요합니다.');
          window.location.href = '/login';
          return;
        }
        
        // 기존 포인트 충전 API 호출
        const { data: chargeData } = await axios.post(`${apiBase}/api/user/${sessionData.userId}/wallet/charge`, {
          amount: totalPoints
        }, { withCredentials: true });
        
        if (chargeData.success) {
          alert(
            `포인트 충전이 완료되었습니다! 💰\n\n` +
            `결제번호: ${rsp.merchant_uid}\n` +
            `기본 포인트: ${selectedAmount.toLocaleString()}P\n` +
            `보너스 포인트: ${selectedPackage.bonus.toLocaleString()}P\n` +
            `총 충전: ${totalPoints.toLocaleString()}P\n` +
            `현재 잔액: ${chargeData.newBalance.toLocaleString()}P`
          );
          window.location.href = '/mypage';
        } else {
          throw new Error(chargeData.message || '포인트 충전에 실패했습니다.');
        }
        return;
      }

      // 테스트 결제 처리 (실제 지갑 충전)
      const selectedPackage = pointPackages.find(pkg => pkg.amount === selectedAmount);
      const totalPoints = selectedPackage.amount + selectedPackage.bonus;
      const merchantUid = `default_${Date.now()}`;
      
      // 세션에서 사용자 정보 확인
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      const { data: sessionData } = await axios.get(`${apiBase}/api/user/session`, { withCredentials: true });
      
      if (!sessionData.success) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
      }
      
      // 기존 포인트 충전 API 호출
      const { data: chargeData } = await axios.post(`${apiBase}/api/user/${sessionData.userId}/wallet/charge`, {
        amount: totalPoints
      }, { withCredentials: true });
      
      if (chargeData.success) {
        alert(
          `포인트 충전이 완료되었습니다! 💰\n\n` +
          `기본 포인트: ${selectedAmount.toLocaleString()}P\n` +
          `보너스 포인트: ${selectedPackage.bonus.toLocaleString()}P\n` +
          `총 충전: ${totalPoints.toLocaleString()}P\n` +
          `현재 잔액: ${chargeData.newBalance.toLocaleString()}P\n\n` +
          `결제번호: ${merchantUid}`
        );
        window.location.href = '/mypage';
      } else {
        throw new Error(chargeData.message || '포인트 충전에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert(`결제 중 오류가 발생했습니다. 다시 시도해주세요.\n${error.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="purchase-page">
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
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              로그인이 필요합니다
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              포인트를 구매하려면 먼저 로그인해주세요
            </p>
            <a href="/login" className="btn btn--primary">로그인하기</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-page">
      <Header />
      <div style={{ height: 'var(--header-height)' }} />

      <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '800px' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-8)'
        }}>
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
            fontFamily: 'var(--font-family)'
          }}>
            포인트 구매
          </h1>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-family)'
          }}>
            경매 참여에 필요한 포인트를 구매하세요
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)'
        }}>
          {/* 포인트 패키지 선택 */}
          <div>
            <h2 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)',
              fontFamily: 'var(--font-family)'
            }}>
              <FaGem style={{ marginRight: 'var(--space-2)', color: 'var(--primary)' }} />
              포인트 패키지
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {pointPackages.map((pkg) => (
                <div
                  key={pkg.amount}
                  onClick={() => setSelectedAmount(pkg.amount)}
                  style={{
                    padding: 'var(--space-4)',
                    border: `2px solid ${selectedAmount === pkg.amount ? 'var(--mint-400)' : 'var(--border-primary)'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: selectedAmount === pkg.amount ? 'var(--mint-50)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    position: 'relative'
                  }}
                >
                  {pkg.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: 'var(--space-4)',
                      background: 'var(--orange-500)',
                      color: 'var(--white)',
                      padding: 'var(--space-1) var(--space-3)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--weight-bold)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      인기
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <div style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {pkg.amount.toLocaleString()}P
                    </div>
                    <div style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      ₩{pkg.amount.toLocaleString()}
                    </div>
                  </div>
                  
                  {pkg.bonus > 0 && (
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--mint-700)',
                      fontWeight: 'var(--weight-medium)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      <FaStar style={{ marginRight: 'var(--space-1)', color: 'var(--orange-500)' }} />
                      보너스 {pkg.bonus.toLocaleString()}P
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 결제 방법 선택 */}
          <div>
            <h2 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)',
              fontFamily: 'var(--font-family)'
            }}>
              <FaCreditCard style={{ marginRight: 'var(--space-2)', color: 'var(--text-primary)' }} />
              결제 방법
            </h2>

            {/* 결제 방법 탭 */}
            <div style={{
              display: 'flex',
              marginBottom: 'var(--space-6)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setPaymentMethod('card')}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  background: paymentMethod === 'card' ? 'var(--mint-400)' : 'var(--bg-secondary)',
                  color: paymentMethod === 'card' ? 'var(--white)' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  fontFamily: 'var(--font-family)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                신용/체크카드(Stripe 테스트)
              </button>
              <button
                onClick={() => setPaymentMethod('easy')}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  background: paymentMethod === 'easy' ? 'var(--mint-400)' : 'var(--bg-secondary)',
                  color: paymentMethod === 'easy' ? 'var(--white)' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  fontFamily: 'var(--font-family)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                간편결제(아임포트 테스트)
              </button>
              <button
                onClick={() => setPaymentMethod('stripe')}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  background: paymentMethod === 'stripe' ? 'var(--mint-400)' : 'var(--bg-secondary)',
                  color: paymentMethod === 'stripe' ? 'var(--white)' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  fontFamily: 'var(--font-family)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Mock 서버 테스트
              </button>
            </div>

            {/* 카드 결제 폼 제거 → Stripe 테스트 버튼만 표시 */}
            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-family)' }}>
                  Stripe 테스트 결제로 이동합니다. (테스트 카드번호: 4242 4242 4242 4242 등)
                </p>
                <button
                  onClick={handleStripeCheckout}
                  className="btn-styleguide"
                  style={{ alignSelf: 'flex-start' }}
                >
                  Stripe Checkout로 이동
                </button>
              </div>
            )}

            {/* 간편결제: 버튼 하나만 표시 → 아임포트 테스트 */}
            {paymentMethod === 'easy' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <button
                  onClick={handleIamportQuick}
                  disabled={loading || !iamportReady}
                  className="btn-styleguide"
                  style={{ alignSelf: 'flex-start', opacity: (loading || !iamportReady) ? 0.7 : 1 }}
                >
                  아임포트 테스트 결제 열기
                </button>
              </div>
            )}

            {paymentMethod === 'stripe' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-family)' }}>
                  테스트 결제로 실제 지갑에 포인트가 충전됩니다. (실제 결제는 발생하지 않음)
                </p>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      
                      // 1. 먼저 세션에서 사용자 정보 확인
                      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
                      const { data: sessionData } = await axios.get(`${apiBase}/api/user/session`, { withCredentials: true });
                      
                      if (!sessionData.success) {
                        alert('로그인이 필요합니다.');
                        window.location.href = '/login';
                        return;
                      }
                      
                      // 2. 선택된 패키지 정보
                      const selectedPackage = pointPackages.find(pkg => pkg.amount === selectedAmount);
                      const totalPoints = selectedPackage.amount + selectedPackage.bonus;
                      
                      // 3. 기존 포인트 충전 API 호출 (총 포인트로)
                      const { data: chargeData } = await axios.post(`${apiBase}/api/user/${sessionData.userId}/wallet/charge`, {
                        amount: totalPoints
                      }, { withCredentials: true });
                      
                      if (chargeData.success) {
                        const merchantUid = `test_${Date.now()}`;
                        alert(
                          `포인트 충전이 완료되었습니다! 💰\n\n` +
                          `기본 포인트: ${selectedAmount.toLocaleString()}P\n` +
                          `보너스 포인트: ${selectedPackage.bonus.toLocaleString()}P\n` +
                          `총 충전: ${totalPoints.toLocaleString()}P\n` +
                          `현재 잔액: ${chargeData.newBalance.toLocaleString()}P\n\n` +
                          `결제번호: ${merchantUid}`
                        );
                        window.location.href = '/mypage';
                      } else {
                        alert('포인트 충전에 실패했습니다: ' + chargeData.message);
                      }
                    } catch (e) {
                      console.error('포인트 충전 오류:', e);
                      if (e.response?.data?.message) {
                        alert('충전 실패: ' + e.response.data.message);
                      } else {
                        alert('포인트 충전 중 오류가 발생했습니다.');
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="btn-styleguide"
                  style={{ alignSelf: 'flex-start' }}
                  disabled={loading}
                >
                  {loading ? '충전 진행 중...' : '테스트 결제로 포인트 충전'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 주문 요약 및 결제 */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
            fontFamily: 'var(--font-family)'
          }}>
            주문 요약
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)'
              }}>
                기본 포인트
              </span>
              <span style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)'
              }}>
                {selectedAmount.toLocaleString()}P
              </span>
            </div>

            {pointPackages.find(pkg => pkg.amount === selectedAmount)?.bonus > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--mint-700)',
                  fontFamily: 'var(--font-family)'
                }}>
                  보너스 포인트
                </span>
                <span style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--mint-700)',
                  fontFamily: 'var(--font-family)'
                }}>
                  +{pointPackages.find(pkg => pkg.amount === selectedAmount)?.bonus.toLocaleString()}P
                </span>
              </div>
            )}

            <div style={{
              borderTop: '1px solid var(--border-primary)',
              paddingTop: 'var(--space-3)',
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
                결제 금액
              </span>
              <span style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)'
              }}>
                ₩{selectedAmount.toLocaleString()}
              </span>
            </div>

            <div style={{
              borderTop: '1px solid var(--border-primary)',
              paddingTop: 'var(--space-3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--mint-700)',
                fontFamily: 'var(--font-family)'
              }}>
                총 획득 포인트
              </span>
              <span style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--mint-700)',
                fontFamily: 'var(--font-family)'
              }}>
                {(selectedAmount + (pointPackages.find(pkg => pkg.amount === selectedAmount)?.bonus || 0)).toLocaleString()}P
              </span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="btn-styleguide"
            style={{
              width: '100%',
              marginTop: 'var(--space-6)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '결제 진행 중...' : `₩${selectedAmount.toLocaleString()} 결제하기`}
          </button>

          <div style={{
            marginTop: 'var(--space-4)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            fontFamily: 'var(--font-family)'
          }}>
            결제 시 NAFAL 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
          </div>
        </div>
      </div>
      
      {/* 푸터 */}
      <Footer />
    </div>
  );
}