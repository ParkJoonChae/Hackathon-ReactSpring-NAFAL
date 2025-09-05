import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaGift,
  FaBox,
  FaTrophy,
  FaCreditCard
} from 'react-icons/fa';
import Header from '../components/Header';


/**
 * PaymentPage - NAFAL 낙찰 상품 결제 확인 페이지
 * 낙찰된 상품의 최종 결제를 처리하는 페이지
 * style-guide.css 기반 디자인 시스템 적용
 */
export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [auctionItem, setAuctionItem] = useState(null);
  // usePoints 상태 제거 - 전체 금액을 포인트로 결제
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState('pending'); // 주문 상태 추가
  // 지갑 정보 상태 추가
  const [wallet, setWallet] = useState({
    balance: 0,
    locked: 0,
    availableBalance: 0,
    totalBalance: 0
  });
  
  // TODO: NAFAL.STORE 배포 시 변경 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
    withCredentials: true,
  });



  useEffect(() => {
    loadPaymentData();
  }, []);

  // 지갑 정보 로드 함수
  const loadWalletInfo = async (userId) => {
    try {
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      const { data } = await axios.get(`${apiBase}/api/user/${userId}/wallet`, { withCredentials: true });
      
      if (data.success) {
        setWallet({
          balance: data.balance || 0,
          locked: data.locked || 0,
          availableBalance: data.availableBalance || 0,
          totalBalance: data.totalBalance || 0
        });
        console.log('💰 지갑 정보 로드:', data);
      } else {
        console.error('지갑 정보 로드 실패:', data.message);
      }
    } catch (error) {
      console.error('지갑 정보 로드 중 오류:', error);
    }
  };

  const loadPaymentData = async () => {
    const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
    
    // 1. 로그인 상태 확인 (세션 API 사용)
    let currentUserId = null;
    try {
      const { data: sessionData } = await axios.get(`${apiBase}/api/user/session`, { withCredentials: true });
      console.log('세션 정보:', sessionData);
      
      if (sessionData.success && sessionData.userId) {
        currentUserId = sessionData.userId; // userId를 로컬 변수에 저장
        setUser({
          userId: sessionData.userId,
          username: sessionData.username,
          name: sessionData.name,
          userType: sessionData.userType,
          phoneNumber: sessionData.phoneNumber
        });
        
        // 지갑 정보 로드
        await loadWalletInfo(sessionData.userId);
        
        console.log('✅ 로그인된 사용자:', sessionData.username, '(ID:', sessionData.userId, ')');
      } else {
        console.warn('❌ 세션이 유효하지 않습니다:', sessionData.message);
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('세션 정보 조회 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login';
        return;
      } else {
        alert('세션 정보를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        return;
      }
    }

    // 2. URL 파라미터에서 상품 정보 가져오기
    const productId = searchParams.get('productId');

    if (!productId) {
      console.error('상품 ID가 없습니다');
      alert('상품 정보가 없습니다. 경매 페이지로 이동합니다.');
      window.location.href = '/auction';
      return;
    }

    try {
      // productId와 userId로 주문 조회
      const { data } = await axios.get(`${apiBase}/api/order/by-product/${productId}/user/${currentUserId}`, { withCredentials: true });
      
      if (data.success && data.order) {
        const order = data.order;
        
        // 상품 이미지 매핑
        const getProductImage = (productId) => {
          switch (productId) {
            case 'NAFAL-0002': return '/items/dptable.png';
            case 'NAFAL-0003': return '/items/sofa.png';
            default: return '/items/sofa.png';
          }
        };

        // 상품 상태 매핑
        const getConditionText = (status) => {
          switch (status) {
            case 'S': return 'S';
            case 'A': return 'A';
            case 'B': return 'B';
            case 'C': return 'C';
            default: return 'S';
          }
        };

        const auctionData = {
          orderId: order.orderId,
          id: order.productId,
          productName: order.productName || '상품명',
          brand: order.brand || 'NAFAL',
          condition: getConditionText(order.productCondition),
          image: getProductImage(order.productId),
          finalPrice: Number(order.orderTotal || 0),
          originalPrice: Number(order.orderTotal || 0) + Number(order.shippingFee || 3000),
          winningBid: Number(order.orderTotal || 0),
          auctionEndTime: order.createdAt || new Date().toISOString(),
          shippingFee: Number(order.shippingFee || 3000),
          description: '낙찰받은 상품입니다.',
          co2Saved: Number(order.co2EffectKg || 0),
          seller: {
            name: '판매자' + order.sellerId,
            rating: 4.8,
            reviews: 127
          },
          specifications: {
            size: '표준 사이즈',
            material: order.material || '고품질 소재',
            color: '기본 색상',
            year: '2023'
          }
        };

        // 주문 상태 저장
        setOrderStatus(order.status || 'pending');
        setAuctionItem(auctionData);
        console.log('주문 정보 로드 성공:', auctionData);
        console.log('주문 상태:', order.status);
      } else {
        console.error('주문 정보를 찾을 수 없습니다:', data.message);
        alert(data.message || '주문 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('주문 정보 로드 실패:', error);
      alert('주문 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      'S': { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', text: '#8B4513' },
      'A': { bg: 'linear-gradient(135deg,rgb(235, 124, 134),rgb(212, 66, 66))', text: '#f5352f' },
      'B': { bg: 'linear-gradient(135deg, #87CEEB, #4169E1)', text: '#000080' },
      'C': { bg: 'linear-gradient(135deg,rgb(150, 235, 124),rgb(121, 219, 112))', text: '#006400' }
    };
    return colors[condition] || { bg: '#f3f4f6', text: '#374151' };
  };

  // 주문 상태에 따른 버튼 텍스트 반환
  const getPaymentButtonText = (status) => {
    switch (status) {
      case 'pending': return '결제하기';
      case 'paid': return '결제완료';
      case 'canceled': return '취소됨';
      case 'shipped': return '배송중';
      case 'delivered': return '배송완료';
      case 'completed': return '거래완료';
      default: return '결제하기';
    }
  };

  // 주문 상태에 따른 버튼 활성화 여부
  const isPaymentButtonEnabled = (status) => {
    return status === 'pending';
  };

  // 주문 상태 한글 변환
  const getOrderStatusText = (status) => {
    switch (status) {
      case 'pending': return '결제 대기';
      case 'paid': return '결제 완료';
      case 'canceled': return '취소됨';
      case 'shipped': return '판매자가 발송';
      case 'delivered': return '구매자에게 도착';
      case 'completed': return '거래 완료';
      default: return '알 수 없음';
    }
  };

  // 주문 상태에 따른 색상
  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF6B6B';
      case 'paid': return '#4ECDC4';
      case 'canceled': return '#95A5A6';
      case 'shipped': return '#F39C12';
      case 'delivered': return '#27AE60';
      case 'completed': return '#8E44AD';
      default: return '#95A5A6';
    }
  };



  const handlePayment = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!auctionItem) {
      alert('결제할 상품 정보를 찾을 수 없습니다.');
      return;
    }

    // 주문 상태 확인
    if (orderStatus !== 'pending') {
      alert(`이미 ${getOrderStatusText(orderStatus)} 상태입니다.`);
      return;
    }

    const totalAmount = auctionItem.finalPrice + auctionItem.shippingFee;

    // 포인트 잔액 확인
    if (totalAmount > wallet.availableBalance) {
      alert(`포인트가 부족합니다.\n사용 가능한 포인트: ${wallet.availableBalance.toLocaleString()}원\n필요한 금액: ${totalAmount.toLocaleString()}원\n\n포인트를 충전해주세요.`);
      return;
    }

    setProcessing(true);

    try {
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      
      // 실제 결제 API 호출 (주문 상태 업데이트 + 포인트 차감)
      const paymentData = {
        orderId: auctionItem.orderId,
        userId: user.userId,
        totalAmount: totalAmount,
        usePoints: totalAmount, // 전체 금액을 포인트로 결제
        paymentMethod: 'POINTS'
      };

      const { data: paymentResult } = await axios.post(
        `${apiBase}/api/order/${auctionItem.orderId}/complete-payment`,
        paymentData,
        { withCredentials: true }
      );

      if (paymentResult.success) {
        // 주문 상태 업데이트
        setOrderStatus('paid');
        
        // 지갑 정보 다시 로드 (포인트 차감 반영)
        await loadWalletInfo(user.userId);
        
        alert(`결제가 완료되었습니다! 🎉\n\n상품: ${auctionItem.productName}\n결제금액: ${totalAmount.toLocaleString()}원\n포인트 차감: ${totalAmount.toLocaleString()}원\n\n판매자에게 배송 요청이 전송됩니다.`);
        
        // 결제 완료 후 경매 페이지로 이동
        window.location.href = '/auction';
      } else {
        alert('결제 처리에 실패했습니다: ' + (paymentResult.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('결제 처리 오류:', error);
      if (error.response?.data?.message) {
        alert('결제 실패: ' + error.response.data.message);
      } else {
        alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
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
      <div className="payment-page">
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
              낙찰 상품 결제를 위해 먼저 로그인해주세요
            </p>
            <a href="/login" className="btn btn--primary">로그인하기</a>
          </div>
        </div>
      </div>
    );
  }

  if (!auctionItem) {
    return (
      <div className="payment-page">
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
              상품 정보를 찾을 수 없습니다
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              결제할 경매 상품이 존재하지 않습니다
            </p>
            <a href="/auction" className="btn btn--primary">경매 페이지로 이동</a>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = auctionItem.finalPrice + auctionItem.shippingFee;

  return (
    <div className="payment-page">
      <Header />
      <div style={{ height: 'var(--header-height)' }} />

      <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '1000px' }}>
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
            <FaGift style={{ marginRight: 'var(--space-2)', color: 'var(--orange-500)' }} />
            낙찰 상품 결제
          </h1>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-family)'
          }}>
            축하합니다! 경매에서 낙찰받은 상품의 결제를 진행하세요
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)'
        }}>
          {/* 상품 정보 */}
          <div>
            <h2 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)',
              fontFamily: 'var(--font-family)'
            }}>
              <FaBox style={{ marginRight: 'var(--space-2)', color: 'var(--primary)' }} />
              낙찰 상품 정보
            </h2>

            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={auctionItem.image}
                    alt={auctionItem.productName}
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-lg)'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 'var(--space-2)',
                      right: 'var(--space-2)',
                      background: getConditionColor(auctionItem.condition).bg,
                      color: getConditionColor(auctionItem.condition).text,
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--weight-bold)',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {auctionItem.condition}급
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-1)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {auctionItem.productName}
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-2)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {auctionItem.brand}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <span style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      ₩{auctionItem.finalPrice.toLocaleString()}
                    </span>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-tertiary)',
                      textDecoration: 'line-through',
                      fontFamily: 'var(--font-family)'
                    }}>
                      ₩{auctionItem.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    padding: 'var(--space-2)',
                    background: 'var(--mint-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--mint-200)'
                  }}>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--mint-700)',
                      fontWeight: 'var(--weight-medium)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      <FaTrophy style={{ marginRight: 'var(--space-2)', color: 'var(--orange-500)' }} />
                      낙찰가: ₩{auctionItem.winningBid.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-primary)',
                paddingTop: 'var(--space-4)'
              }}>
                <h4 style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-3)',
                  fontFamily: 'var(--font-family)'
                }}>
                  상품 정보
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      크기
                    </span>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {auctionItem.specifications.size}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      재질
                    </span>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {auctionItem.specifications.material}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      색상
                    </span>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {auctionItem.specifications.color}
                    </span>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* 결제 방법 */}
          <div>
            <h2 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)',
              fontFamily: 'var(--font-family)'
            }}>
              <FaCreditCard style={{ marginRight: 'var(--space-2)', color: 'var(--text-primary)' }} />
              결제 정보
            </h2>

            {/* 포인트 결제 정보 */}
            <div style={{
              background: 'var(--mint-50)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              border: '1px solid var(--mint-200)',
              marginBottom: 'var(--space-6)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    총 보유 포인트:
                  </span>
                  <span style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {wallet.balance.toLocaleString()}원
                  </span>
                </div>
                {wallet.locked > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--orange-600)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      잠긴 포인트 (입찰 중):
                    </span>
                    <span style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--orange-600)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      {wallet.locked.toLocaleString()}원
                    </span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 'var(--space-2)',
                  borderTop: '1px solid var(--mint-200)'
                }}>
                  <span style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--mint-700)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    사용 가능:
                  </span>
                  <span style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--mint-700)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {wallet.availableBalance.toLocaleString()}원
                  </span>
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)'
              }}>
                💳 결제 시 전체 금액이 포인트로 차감됩니다
              </div>
            </div>
          </div>
        </div>

        {/* 결제 요약 및 최종 결제 */}
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
            결제 요약
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)'
              }}>
                상품 가격
              </span>
              <span style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)'
              }}>
                ₩{auctionItem.finalPrice.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)'
              }}>
                배송비
              </span>
              <span style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)'
              }}>
                ₩{auctionItem.shippingFee.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: 'var(--text-base)',
                color: 'var(--mint-700)',
                fontFamily: 'var(--font-family)'
              }}>
                결제 방법
              </span>
              <span style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--mint-700)',
                fontFamily: 'var(--font-family)'
              }}>
                NAFAL 포인트
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
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)'
              }}>
                최종 결제 금액
              </span>
              <span style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)'
              }}>
                ₩{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing || !isPaymentButtonEnabled(orderStatus)}
            className="btn-styleguide"
            style={{
              width: '100%',
              marginTop: 'var(--space-6)',
              opacity: (processing || !isPaymentButtonEnabled(orderStatus)) ? 0.7 : 1,
              cursor: (processing || !isPaymentButtonEnabled(orderStatus)) ? 'not-allowed' : 'pointer',
              backgroundColor: isPaymentButtonEnabled(orderStatus) ? 'var(--primary-color)' : getOrderStatusColor(orderStatus),
              color: '#000000', // 폰트 색상을 검은색으로 설정
              fontWeight: 'var(--weight-bold)',
              transition: 'all 0.3s ease', // 부드러운 호버 효과를 위한 transition
              border: 'none',
              fontSize: 'var(--text-lg)'
            }}
            onMouseEnter={(e) => {
              if (isPaymentButtonEnabled(orderStatus) && !processing) {
                e.target.style.backgroundColor = 'var(--mint-700)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(145, 196, 188, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (isPaymentButtonEnabled(orderStatus) && !processing) {
                e.target.style.backgroundColor = 'var(--primary-color)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {processing ? '결제 진행 중...' : 
             isPaymentButtonEnabled(orderStatus) ? 
             `₩${totalAmount.toLocaleString()} ${getPaymentButtonText(orderStatus)}` : 
             getPaymentButtonText(orderStatus)}
          </button>

          {/* 주문 상태 표시 (paid 이상일 때만) */}
          {orderStatus !== 'pending' && (
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              backgroundColor: getOrderStatusColor(orderStatus) + '20',
              border: `1px solid ${getOrderStatusColor(orderStatus)}`,
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-1)',
                fontFamily: 'var(--font-family)'
              }}>
                주문 현황
              </div>
              <div style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-medium)',
                color: getOrderStatusColor(orderStatus),
                fontFamily: 'var(--font-family)'
              }}>
                {getOrderStatusText(orderStatus)}
              </div>
            </div>
          )}

          <div style={{
            marginTop: 'var(--space-4)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            fontFamily: 'var(--font-family)'
          }}>
            결제 완료 후 판매자에게 배송 요청이 전송되며, 일반적으로 1-3일 내에 배송됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
