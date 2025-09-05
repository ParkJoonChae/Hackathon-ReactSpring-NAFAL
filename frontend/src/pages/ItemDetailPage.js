import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { 
  FaFire,
  FaSeedling,
  FaHome,
  FaTruck,
  FaMoneyBillWave,
  FaFileAlt
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';


/**
 * ItemDetailPage - KREAM 스타일 아이템 상세보기 페이지
 * 2025년 트렌드에 맞는 경매 상세 페이지
 */
export default function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [loading, setLoading] = useState(true);

  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [maxBidAmount, setMaxBidAmount] = useState('');
  // 지갑 정보 상태 추가
  const [wallet, setWallet] = useState({
    balance: 0,           // 전체 보유 포인트
    locked: 0,            // 잠긴 포인트
    availableBalance: 0,  // 사용 가능한 포인트 (balance - locked)
    totalBalance: 0       // 총 포인트 (balance + locked)
  });
  const [walletLoading, setWalletLoading] = useState(true);

  // TODO: NAFAL.STORE 배포 시 변경 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
    withCredentials: true,
  });

  const [serverBids, setServerBids] = useState([]); // 서버 입찰 내역(최신 10개)
  const [bidTabType, setBidTabType] = useState('manual'); // 'manual' | 'auto'
  const [isWishlisted, setIsWishlisted] = useState(false); // 찜하기 상태
  const [isAuctionEnded, setIsAuctionEnded] = useState(false); // 경매 종료 여부
  const [currentUserId, setCurrentUserId] = useState(null); // 현재 로그인한 사용자 ID
  const [winner, setWinner] = useState(null); // 낙찰자 정보
  const [canBid, setCanBid] = useState(false); // 입찰 자격 여부
  const [showVerificationModal, setShowVerificationModal] = useState(false); // 본인인증 모달 표시 여부
  const [sessionPhoneNumber, setSessionPhoneNumber] = useState(''); // 세션에 저장된 휴대폰 번호
  const [showNiceModal, setShowNiceModal] = useState(false);
  const [niceVerificationStep, setNiceVerificationStep] = useState('phone'); // 'phone', 'code', 'success'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null); // NICE 인증 요청 ID

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
    } finally {
      setWalletLoading(false);
    }
  };

  // 서버에서 경매 상태/메타 정보 로드
  useEffect(() => {
    const load = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
        
        // 현재 세션 사용자 정보 조회
        let userId = null;
        try {
          const { data: sessionData } = await axios.get(`${apiBase}/api/user/session`, { withCredentials: true });
          console.log('세션 정보:', sessionData);
          
          if (sessionData.success && sessionData.userId) {
            userId = String(sessionData.userId);
            setCurrentUserId(userId);
            
            // canBid 정보 설정 (명시적으로 처리)
            const userCanBid = sessionData.canBid === true;
            setCanBid(userCanBid);
            
            // 세션에 저장된 휴대폰 번호 설정
            if (sessionData.phoneNumber) {
              setSessionPhoneNumber(sessionData.phoneNumber);
              console.log('📱 세션 휴대폰 번호 설정됨:', sessionData.phoneNumber);
            } else {
              console.warn('⚠️ 세션에 phoneNumber가 없습니다:', sessionData);
            }
            
            console.log('✅ 로그인된 사용자:', sessionData.username, '(ID:', userId, ')');
            console.log('🔐 canBid 상태:', {
              sessionData: sessionData.canBid,
              type: typeof sessionData.canBid,
              parsed: userCanBid,
              finalState: userCanBid,
              rawValue: sessionData.canBid
            });
            console.log('📱 세션 휴대폰 번호:', sessionData.phoneNumber);
            
            // canBid가 true인 경우 즉시 확인
            if (userCanBid) {
              console.log('🎯 입찰 자격 확인됨 - 입찰 버튼 활성화');
            } else {
              console.log('⚠️ 입찰 자격 미확인 - 본인인증 필요');
            }
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
            return;
          }
        }

        // 지갑 정보 로드
        await loadWalletInfo(userId);
        
        // 상품 기본 정보 로드
        const { data: productResponse } = await axios.get(`${apiBase}/api/auction/product/${id}`, { withCredentials: true });
        console.log('상품 기본 정보 응답:', productResponse);
        
        let productData = null;
        if (productResponse.success && productResponse.product) {
            productData = productResponse.product;
        } else {
            console.warn('상품 기본 정보 로드 실패:', productResponse.error);
        }
        
        // 경매 상태 및 입찰 내역 로드
        const [{ data: state }, { data: bids }] = await Promise.all([
          axios.get(`${apiBase}/api/auction/${id}/state`, { withCredentials: true }),
          axios.get(`${apiBase}/api/auction/${id}/bids`, { params: { limit: 10 }, withCredentials: true })
        ]);

        console.log('🔍 API 응답 데이터:', {
          productData: productData,
          state: state,
          bids: bids,
          auctionInstantPrice: state.auctionInstantPrice,
          productInstantPrice: state.productInstantPrice,
          bidsArray: Array.isArray(bids),
          bidsLength: bids?.length,
          sampleBidTime: bids?.[0]?.bidTime,
          sampleBidTimeType: typeof bids?.[0]?.bidTime
        });

        console.log('🔍 API URL 호출:', {
          productURL: `${apiBase}/api/auction/product/${id}`,
          stateURL: `${apiBase}/api/auction/${id}/state`,
          bidsURL: `${apiBase}/api/auction/${id}/bids`,
          productId: id
        });

        console.log('🔍 최종 item 객체:', {
          instantPrice: Number(state.auctionInstantPrice || state.productInstantPrice || 0),
          auctionInstantPrice: state.auctionInstantPrice,
          productInstantPrice: state.productInstantPrice,
          fallbackValue: Number(state.auctionInstantPrice || state.productInstantPrice || 0)
        });

        const endTimeMs = Number(state.endTime || 0);
        const maxBidAmount = Array.isArray(bids) && bids.length > 0
          ? Math.max(...bids.map((b) => Number(b.bidAmount || 0)))
          : 0;
        const currentFromState = Number(state.currentPrice || state.startPrice || 0);
        // 입찰내역이 존재하면 그 최대값을 우선 신뢰, 없으면 상태값 사용
        const effectiveCurrent = maxBidAmount > 0 ? maxBidAmount : currentFromState;
        
        // 상품 기본 정보와 경매 정보를 합쳐서 item 객체 생성
        const next = {
          id,
          name: productData?.title || state.title || id,
          brand: productData?.brand || state.brand || 'NAFAL',
          category: productData?.category || state.category || '-',
          startPrice: Number(state.startPrice || 1000),
          currentPrice: Number(effectiveCurrent || 1000),
          instantPrice: Number(state.auctionInstantPrice || state.productInstantPrice || productData?.instantPrice || 0),
          entryFee: Number(state.minimunPrice || 0),
          bidCount: Number(state.bidCount || (Array.isArray(bids) ? bids.length : 0) || 0),
          endTime: endTimeMs ? new Date(endTimeMs) : new Date(),
          image: productData?.image || '/items/default.png',
          images: productData?.images || ['/items/default.png'],
          condition: productData?.productCondition || 'S',
          material: productData?.meterial || state.meterial || 'N/A',
          size: { width: 0, height: 0, depth: 0 },
          co2Saved: productData?.co2EffectKg || 0,
          description: productData?.description || '',
          historyText: productData?.history || '',
          detailInfo: productData?.sizeInfo || '',
          shippingMethod: productData?.deliveryType || '화물배송',
          shippingCost: productData?.deliveryPrice || 0,
          shippingNote: productData?.deliveryOpt || '',
          seller: 'NAFAL',
          registrationDate: productData?.registerDate || '',
          tags: productData?.tag ? productData.tag.split(',').map(tag => tag.trim()) : [],
          eventName: productData?.eventName || '',
          currency: 'KRW',
          bidUnit: Number(state.bidUnit || 1000), // 서버에서 가져온 bidUnit 사용
          errorRange: ''
        };
        setItem(next);
        setServerBids(Array.isArray(bids) ? bids : []);
      } catch (e) {
        console.error('데이터 로드 실패:', e);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  // 타이머 업데이트 (1분 연장 규칙 포함)
  useEffect(() => {
    if (!item) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = item.endTime - now;
      
      if (diff <= 0) {
        setTimeRemaining('경매 종료');
        if (!isAuctionEnded) {
          handleAuctionEnd();
        }
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // 1분 이내일 때 특별 표시
      if (diff <= 60000) { // 1분 = 60,000ms
        setTimeRemaining(`⚡ ${minutes}분 ${seconds}초 (마감임박)`);
      } else if (days > 0) {
        setTimeRemaining(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초`);
      } else {
        setTimeRemaining(`${hours}시간 ${minutes}분 ${seconds}초`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [item]);

  // 찜하기 상태 로드
  useEffect(() => {
    if (item) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(wishlist.includes(item.id));
    }
  }, [item]);

  // 경매 종료 처리
  const handleAuctionEnd = async () => {
    setIsAuctionEnded(true);
    
    try {
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      const { data: winnerData } = await axios.get(`${apiBase}/api/auction/${item.id}/winner`, { withCredentials: true });
      console.log('🏆 낙찰자 정보:', winnerData);
      console.log('🆔 현재 사용자:', currentUserId);
      console.log('🏁 경매 종료 여부:', isAuctionEnded);
      setWinner(winnerData);
    } catch (error) {
      console.error('낙찰자 정보 조회 실패:', error);
    }
  };

  // 찜하기 토글 함수
  const handleWishlistClick = async (e) => {
    console.log('찜하기 버튼 클릭됨'); // 디버깅용 로그
    e.preventDefault();
    e.stopPropagation();
    
    // TODO: 로그인 확인
    const user = localStorage.getItem('user');
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      // TODO: 백엔드 API 호출 - POST /api/wishlist/toggle
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const isCurrentlyWishlisted = currentWishlist.includes(item.id);
      
      let newWishlist;
      if (isCurrentlyWishlisted) {
        newWishlist = currentWishlist.filter(id => id !== item.id);
        console.log('찜하기에서 제거됨'); // 디버깅용 로그
      } else {
        newWishlist = [...currentWishlist, item.id];
        console.log('찜하기에 추가됨'); // 디버깅용 로그
      }
      
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setIsWishlisted(!isCurrentlyWishlisted);
      
    } catch (error) {
      console.error('찜하기 처리 중 오류:', error);
      alert('찜하기 처리 중 오류가 발생했습니다.');
    }
  };

  // 입찰 API
  const handleBid = async () => {
    const amount = parseInt(bidAmount);
    
    if (!amount || amount <= item.currentPrice) {
      alert('현재가보다 높은 금액을 입력해주세요.');
      return;
    }

    // 사용 가능한 포인트 확인 (잠긴 포인트 제외한 실제 사용 가능한 포인트)
    const actualAvailableBalance = wallet.balance - wallet.locked;
    if (amount > actualAvailableBalance) {
      alert(`포인트가 부족합니다.\n\n보유 포인트: ${wallet.balance.toLocaleString()}원\n잠긴 포인트: ${wallet.locked.toLocaleString()}원\n실제 사용 가능: ${actualAvailableBalance.toLocaleString()}원\n필요한 금액: ${amount.toLocaleString()}원`);
      return;
    }

    // 마감 2시간 전인지 확인
    const timeLeft = item.endTime - new Date();
    const twoHours = 2 * 60 * 60 * 1000;
    
    if (timeLeft < twoHours) {
      if (!window.confirm('마감 2시간 전에는 입찰 취소가 불가능합니다. 계속하시겠습니까?')) {
        return;
      }
    }

    // 1분 연장 규칙 확인
    const timeLeftForExtension = item.endTime - new Date();
    const oneMinute = 60 * 1000;
    let extendedEndTime = item.endTime;
    
    if (timeLeftForExtension <= oneMinute) {
      // 마감 1분 전 입찰 시 1분 연장
      extendedEndTime = new Date(Date.now() + oneMinute);
      alert('마감 1분 전 입찰로 경매가 1분 연장되었습니다!');
    }

    try {
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      const res = await axios.post(
        `${apiBase}/api/auction/${item.id}/bid`,
        { amount, userId: currentUserId || '1' },
        { withCredentials: true }
      );
      const data = res.data || {};
      if (data.error) {
        if (data.reason === 'increment') {
          const currentPrice = Number(data.currentPrice || 0);
          const minRequired = currentPrice + Number(item.bidUnit || 1000);
          alert(`최소 입찰 금액을 확인해주세요.\n\n현재가: ${currentPrice.toLocaleString()}원\n최소인상폭: ${(item.bidUnit || 1000).toLocaleString()}원\n필요한 최소 금액: ${minRequired.toLocaleString()}원`);
          return;
        }
        alert('입찰 실패. 잠시 후 다시 시도해주세요.');
        return;
      }



      const updatedItem = { ...item };
      updatedItem.currentPrice = Number(data.currentPrice || amount);
      updatedItem.bidCount = Number(data.bidCount || (item.bidCount + 1));
      if (data.endTime) updatedItem.endTime = new Date(Number(data.endTime));
      setItem(updatedItem);

      // 입찰 성공 후 최신 데이터 업데이트
      try {
        const [bidsRes] = await Promise.all([
          axios.get(`${apiBase}/api/auction/${item.id}/bids?limit=10`, { withCredentials: true }),
          loadWalletInfo(currentUserId) // 지갑 정보 다시 로드 (잠긴 포인트 반영)
        ]);
        setServerBids(bidsRes.data);
        
        // 디버깅: 지갑 정보 업데이트 확인
        console.log('💰 입찰 후 지갑 정보 업데이트 완료:', {
          currentUserId,
          bidAmount: amount,
          updatedWallet: wallet
        });
      } catch (error) {
        console.error('데이터 업데이트 실패:', error);
      }

      setBidAmount('');
      alert(`${updatedItem.currentPrice.toLocaleString()}원으로 입찰이 완료되었습니다.`);
    } catch (e) {
      console.error(e);
      alert('입찰 처리 중 오류가 발생했습니다.');
    }
  };

  // 입찰 금액 입력 보정: 1,000원 단위 증감, 최소 (현재가 + 최소인상폭)
  const handleBidAmountChange = (raw) => {
    if (!item) return;
    const min = Number(item.currentPrice || 0) + Number(item.bidUnit || 1000);
    let val = parseInt(raw || '');
    if (isNaN(val)) {
      setBidAmount('');
      return;
    }
    if (val < min) val = min;
    // 1000원 단위로 내림 정규화
    const step = 1000;
    const normalized = min + Math.floor((val - min) / step) * step;
    setBidAmount(String(normalized));
    
    console.log('💰 입찰 금액 검증:', {
      currentPrice: item.currentPrice,
      bidUnit: item.bidUnit,
      minRequired: min,
      inputValue: val,
      normalizedValue: normalized
    });
  };

  // 자동 입찰 설정
  const handleMaxBid = () => {
    const maxAmount = parseInt(maxBidAmount);
    
    if (!maxAmount || maxAmount <= item.currentPrice) {
      alert('현재가보다 높은 금액을 입력해주세요.');
      return;
    }

    // 사용 가능한 포인트 확인 (잠긴 포인트 제외한 실제 사용 가능한 포인트)
    const actualAvailableBalance = wallet.balance - wallet.locked;
    if (maxAmount > actualAvailableBalance) {
      alert(`포인트가 부족합니다.\n\n보유 포인트: ${wallet.balance.toLocaleString()}원\n잠긴 포인트: ${wallet.locked.toLocaleString()}원\n실제 사용 가능: ${actualAvailableBalance.toLocaleString()}원\n필요한 금액: ${maxAmount.toLocaleString()}원`);
      return;
    }

    // MAX 안내 팝업
    const confirmMessage = `자동 입찰을 설정하시겠습니까?\n\n설정 금액: ${maxAmount.toLocaleString()}원\n\n자동 입찰이 설정되면 다른 사용자가 입찰할 때마다 설정하신 최대 금액 한도 내에서 1,000원씩 자동으로 상향 입찰됩니다.\n\n※ 주의사항:\n- 마감 2시간 전부터는 취소 불가\n- 최고가일 때는 취소 불가\n- 마감 1분 전 입찰 시 1분 연장`;
    
    if (window.confirm(confirmMessage)) {
      setAutoBidEnabled(true);
      alert(`자동 입찰이 설정되었습니다.\n최대 금액: ${maxAmount.toLocaleString()}원`);
    }
  };



  const handleEntryFeePayment = () => {
    // 사용 가능한 포인트 확인 (잠긴 포인트 제외한 실제 사용 가능한 포인트)
    const actualAvailableBalance = wallet.balance - wallet.locked;
    if (item.entryFee > actualAvailableBalance) {
      alert(`포인트가 부족합니다.\n\n보유 포인트: ${wallet.balance.toLocaleString()}원\n잠긴 포인트: ${wallet.locked.toLocaleString()}원\n실제 사용 가능: ${actualAvailableBalance.toLocaleString()}원\n필요한 금액: ${item.entryFee.toLocaleString()}원`);
      return;
    }
    
    if (window.confirm(`경매 입장료 ${item.entryFee.toLocaleString()}원을 결제하시겠습니까?\n입장료 결제 후 경매에 참여할 수 있습니다.`)) {
      alert('입장료 결제가 완료되었습니다. 경매에 참여할 수 있습니다.');
      // TODO: 백엔드 API 호출 - POST /api/auction/entry-payment
      // 지갑 정보 다시 로드
      loadWalletInfo(currentUserId);
    }
  };

  // 즉시구매 API
  const handleInstantPurchase = () => {
    // 사용 가능한 포인트 확인 (잠긴 포인트 제외한 실제 사용 가능한 포인트)
    const actualAvailableBalance = wallet.balance - wallet.locked;
    if (item.instantPrice > actualAvailableBalance) {
      alert(`포인트가 부족합니다.\n\n보유 포인트: ${wallet.balance.toLocaleString()}원\n잠긴 포인트: ${wallet.locked.toLocaleString()}원\n실제 사용 가능: ${actualAvailableBalance.toLocaleString()}원\n필요한 금액: ${item.instantPrice.toLocaleString()}원`);
      return;
    }
    
    if (window.confirm(`즉시구매가 ${item.instantPrice.toLocaleString()}원으로 즉시 결제하시겠습니까?\n즉시 결제 시 경매가 종료되고 상품을 바로 구매할 수 있습니다.`)) {
      alert('즉시 결제가 완료되었습니다. 상품 구매가 확정되었습니다.');
      // TODO: 백엔드 API 호출 - POST /api/auction/instant-purchase
      // 지갑 정보 다시 로드
      loadWalletInfo(currentUserId);
    }
  };

  // 포인트 충전 (테스트용)
  const handlePointCharge = async (amount) => {
    try {
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      const { data } = await axios.post(
        `${apiBase}/api/user/${currentUserId}/wallet/charge`,
        { amount },
        { withCredentials: true }
      );
      
      if (data.success) {
        alert(`${amount.toLocaleString()}원이 충전되었습니다.`);
        // 지갑 정보 다시 로드
        await loadWalletInfo(currentUserId);
      } else {
        alert('충전에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('포인트 충전 오류:', error);
      alert('충전 중 오류가 발생했습니다.');
    }
  };

  // 낙찰자 결제 처리
  const handleWinnerCheckout = async () => {
    if (!winner?.hasWinner || winner?.winnerId !== currentUserId) {
      alert('낙찰자가 아닙니다.');
      return;
    }
    
      try {
        const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      
      // 1. 먼저 기존 주문이 있는지 확인
      console.log('🔍 기존 주문 확인 중...', `productId: ${item.id}, userId: ${currentUserId}`);
      const { data: existingOrderData } = await axios.get(
        `${apiBase}/api/order/by-product/${item.id}/user/${currentUserId}`, 
        { withCredentials: true }
      );
      
      if (existingOrderData.success && existingOrderData.order) {
        // 기존 주문이 있으면 바로 결제 페이지로 이동
        console.log('✅ 기존 주문 발견:', existingOrderData.order);
        alert(`이미 주문이 생성되어 있습니다.\n주문번호: ${existingOrderData.order.orderId}\n결제 페이지로 이동합니다.`);
        window.location.href = `/payment?productId=${item.id}`;
        return;
      }
      
      // 2. 기존 주문이 없으면 새 주문 생성 확인
      if (window.confirm(`축하합니다! 낙찰되었습니다.\n낙찰가: ${winner.winningAmount.toLocaleString()}원\n주문을 생성하고 결제 페이지로 이동하시겠습니까?`)) {
        console.log('🆕 새 주문 생성 중...');
        const { data } = await axios.post(
          `${apiBase}/api/auction/${item.id}/create-order`,
          { userId: currentUserId },
          { withCredentials: true }
        );
        
        if (data.success) {
          alert(`주문이 생성되었습니다.\n주문번호: ${data.orderId}\n결제 페이지로 이동합니다.`);
          // PaymentPage로 이동 (productId를 URL 파라미터로 전달)
          window.location.href = `/payment?productId=${item.id}`;
        } else {
          alert(data.message || '주문 생성에 실패했습니다.');
        }
        }
      } catch (error) {
      console.error('주문 처리 실패:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('찾을 수 없습니다')) {
        // 기존 주문이 없는 경우 - 새 주문 생성 진행
        console.log('📝 기존 주문 없음, 새 주문 생성 진행');
        if (window.confirm(`축하합니다! 낙찰되었습니다.\n낙찰가: ${winner.winningAmount.toLocaleString()}원\n주문을 생성하고 결제 페이지로 이동하시겠습니까?`)) {
          try {
            const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
            const { data } = await axios.post(
              `${apiBase}/api/auction/${item.id}/create-order`,
              { userId: currentUserId },
              { withCredentials: true }
            );
            
            if (data.success) {
              alert(`주문이 생성되었습니다.\n주문번호: ${data.orderId}\n결제 페이지로 이동합니다.`);
              window.location.href = `/payment?productId=${item.id}`;
            } else {
              alert(data.message || '주문 생성에 실패했습니다.');
            }
          } catch (createError) {
            console.error('주문 생성 실패:', createError);
        alert('주문 생성 중 오류가 발생했습니다.');
          }
        }
      } else {
        alert('주문 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // NICE 본인인증 모달 상태

     // 본인인증 모달 열기
   const handleIdentityVerification = () => {
     console.log('🔍 본인인증 모달 열기 시 현재 상태:', {
       sessionPhoneNumber,
       canBid,
       currentUserId
     });
     
     setShowNiceModal(true);
     setNiceVerificationStep('phone');
     setPhoneNumber('');
     setVerificationCode('');
     setCountdown(0);
     setIsResendDisabled(false);
   };

     // NICE 본인인증 시작 (시뮬레이션 모드)
   const handleNiceVerificationStart = async () => {
     if (!phoneNumber || phoneNumber.length < 10) {
       alert('올바른 휴대폰 번호를 입력해주세요.');
       return;
     }

     // 세션의 휴대폰 번호가 없으면 경고
     if (!sessionPhoneNumber) {
       console.error('❌ sessionPhoneNumber가 설정되지 않음:', {
         sessionPhoneNumber,
         sessionData: '세션 데이터 확인 필요'
       });
       alert('세션 정보를 불러올 수 없습니다. 페이지를 새로고침하거나 다시 로그인해주세요.');
       return;
     }

     // 세션의 휴대폰 번호와 일치하는지 검증 (강화)
     if (phoneNumber !== sessionPhoneNumber) {
       alert(`본인인증이 불가능합니다.\n\n입력한 번호: ${phoneNumber}\n세션에 등록된 번호: ${sessionPhoneNumber}\n\n본인인증은 가입 시 등록한 휴대폰 번호로만 가능합니다.`);
       return;
     }

     try {
       console.log('📱 NICE 본인인증 시작 (시뮬레이션):', phoneNumber);
       console.log('📱 세션 휴대폰 번호와 일치 확인:', phoneNumber === sessionPhoneNumber);
       
       // 시뮬레이션 모드로 동작
       await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 지연
       
       // 테스트용: 특정 번호는 실패 처리
       if (phoneNumber === '01012345678') {
         alert('테스트용 번호입니다. 다른 번호를 사용해주세요.');
         return;
       }
      
      // 성공 시뮬레이션
      const requestId = 'sim_' + Date.now();
      setCurrentRequestId(requestId);
      setNiceVerificationStep('code');
      setCountdown(180); // 3분 타이머 시작
      startCountdown();
      alert('인증번호가 발송되었습니다. SMS를 확인해주세요. (시뮬레이션 모드)');
      
    } catch (error) {
      console.error('NICE 인증 시작 오류:', error);
      alert('본인인증 시작 중 오류가 발생했습니다.');
    }
  };

  // 인증번호 확인 (시뮬레이션 모드)
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('6자리 인증번호를 입력해주세요.');
      return;
    }

    try {
      console.log('🔐 인증번호 확인 (시뮬레이션):', verificationCode);
      
      // 시뮬레이션 모드로 동작
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 지연
      
      // 테스트용: 123456만 성공
      if (verificationCode === '123456') {
        setNiceVerificationStep('success');
        
        // 백엔드에 본인인증 완료 상태 업데이트 요청 (필수)
        try {
          const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
          const { data } = await axios.post(
            `${apiBase}/api/user/verify-identity`,
            {}, // 빈 객체 (세션에서 사용자 정보 자동 추출)
            { withCredentials: true }
          );
          
          if (data.success) {
            console.log('✅ 백엔드 canBid 상태 업데이트 성공:', data.canBid);
            setNiceVerificationStep('success');
            loadSessionInfo(); // 세션 정보 다시 로드하여 canBid 상태 동기화
            setCanBid(true); // 프론트엔드 상태 업데이트
          } else {
            alert(`본인인증 완료 처리 중 오류가 발생했습니다: ${data.message}`);
            console.error('백엔드 canBid 상태 업데이트 실패:', data.message);
            // 실패 시 모달 닫거나 에러 상태 유지
            setShowNiceModal(false);
          }
        } catch (dbError) {
          console.error('DB 업데이트 API 호출 오류:', dbError);
          alert('본인인증 완료 처리 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.');
          setShowNiceModal(false);
        }
        
        // 백엔드 성공 시에만 성공 단계로 진행
        // (위의 백엔드 API 호출에서 이미 처리됨)
      } else {
        alert('인증번호가 올바르지 않습니다. 테스트용 인증번호: 123456');
      }
    } catch (error) {
      console.error('인증번호 확인 오류:', error);
      alert('인증번호 확인 중 오류가 발생했습니다.');
    }
  };

  // 인증번호 재발송 (시뮬레이션 모드)
  const handleResendCode = async () => {
    try {
      console.log('📱 인증번호 재발송 (시뮬레이션)');
      
      // 시뮬레이션 모드로 동작
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 지연
      
      // 성공 시뮬레이션
      const newRequestId = 'sim_' + Date.now();
      setCurrentRequestId(newRequestId);
      setCountdown(180);
      startCountdown();
      setIsResendDisabled(true);
      setTimeout(() => setIsResendDisabled(false), 60000); // 1분 후 재발송 가능
      alert('인증번호가 재발송되었습니다. (시뮬레이션 모드)');
      
    } catch (error) {
      console.error('인증번호 재발송 오류:', error);
      alert('인증번호 재발송 중 오류가 발생했습니다.');
    }
  };

  // 타이머 시작
  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // NICE API 시뮬레이션 (테스트용) - 이제 사용하지 않음
  const simulateNiceAPI = async (action, data) => {
    // 실제 NICE API 호출을 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 지연
    
    switch (action) {
      case 'sendCode':
        // 휴대폰 번호 유효성 검사 (테스트용)
        if (data.phoneNumber === '01012345678') {
          return { success: false, message: '테스트용 번호입니다. 다른 번호를 사용해주세요.' };
        }
        return { success: true, message: '인증번호 발송 성공' };
        
      case 'verifyCode':
        // 인증번호 검증 (테스트용: 123456)
        if (data.code === '123456') {
          return { success: true, message: '인증 성공' };
        }
        return { success: false, message: '인증번호 불일치' };
        
      case 'resendCode':
        return { success: true, message: '재발송 성공' };
        
      default:
        return { success: false, message: '알 수 없는 오류' };
    }
  };

  // 세션 정보 로드 함수 (재사용)
  const loadSessionInfo = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:8080/NAFAL';
      const { data: sessionData } = await axios.get(`${apiBase}/api/user/session`, { withCredentials: true });
      console.log('🔄 세션 정보 재로드:', sessionData);
      
             if (sessionData.success && sessionData.userId) {
         // canBid 정보 설정 (명시적으로 처리)
         const userCanBid = sessionData.canBid === true;
         setCanBid(userCanBid);
         
         // 세션에 저장된 휴대폰 번호 설정
         if (sessionData.phoneNumber) {
           setSessionPhoneNumber(sessionData.phoneNumber);
           console.log('📱 세션 휴대폰 번호 재설정됨:', sessionData.phoneNumber);
         } else {
           console.warn('⚠️ 세션 재로드 시 phoneNumber가 없습니다:', sessionData);
         }
         
         console.log('✅ 세션 정보 재로드 완료:', {
           userId: sessionData.userId,
           username: sessionData.username,
           canBid: userCanBid,
           phoneNumber: sessionData.phoneNumber
         });
       }
    } catch (error) {
      console.error('세션 정보 재로드 실패:', error);
    }
  };

  // 현재 로그인한 유저가 최고가를 입찰한 상태인지 확인
  const isCurrentUserHighestBidder = () => {
    if (!currentUserId || !serverBids || serverBids.length === 0) return false;
    
    // 최고가 입찰 찾기
    const highestBid = serverBids.reduce((max, bid) => {
      return Number(bid.bidAmount || 0) > Number(max.bidAmount || 0) ? bid : max;
    }, serverBids[0]);
    
    // 현재 유저가 최고가 입찰자인지 확인
    return highestBid && String(highestBid.userId) === String(currentUserId);
  };

  // 입찰하기 버튼 비활성화 조건 업데이트
  const isBidButtonDisabled = () => {
    const actualAvailableBalance = wallet.balance - wallet.locked;
    return isAuctionEnded || 
           parseInt(bidAmount) > actualAvailableBalance || 
           !bidAmount || 
           !canBid || 
           isCurrentUserHighestBidder(); // 최고가 입찰자면 비활성화
  };

  // 입찰하기 버튼 텍스트 업데이트
  const getBidButtonText = () => {
    const actualAvailableBalance = wallet.balance - wallet.locked;
    if (isAuctionEnded) return '경매종료';
    if (!canBid) return '본인인증 필요';
    if (parseInt(bidAmount) > actualAvailableBalance) return '포인트 부족';
    if (!bidAmount) return '입찰 금액을 입력해주세요';
    if (isCurrentUserHighestBidder()) return '현재 최고가 입니다.';
    return '입찰하기';
  };

  // 입찰하기 버튼 툴팁 텍스트 업데이트
  const getBidButtonTitle = () => {
    const actualAvailableBalance = wallet.balance - wallet.locked;
    if (isAuctionEnded) return '경매가 종료되었습니다';
    if (!canBid) return '본인인증이 필요합니다';
    if (parseInt(bidAmount) > actualAvailableBalance) return '포인트가 부족합니다';
    if (!bidAmount) return '입찰 금액을 입력해주세요';
    if (isCurrentUserHighestBidder()) return '이미 최고가 입찰자입니다';
    return '입찰하기';
  };

  if (loading || !item) {
    return (
      <div className="item-detail-page">
        <Header />
        <div style={{ height: 'var(--header-height)' }} />
        <div className="container" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div className="loading-spinner">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="item-detail-page">
      <Header />
      <div style={{ height: 'var(--header-height)' }} />

      {/* 메인 콘텐츠 */}
      <div className="container" style={{ maxWidth: '1200px', padding: 'var(--space-6) var(--space-4)' }}>
        {/* 상단: 이미지 갤러리 (전체 폭) */}
        <div className="item-images-section" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="item-detail-layout">
            {/* 좌측: 이미지 갤러리 */}
            <div className="item-images">
              <div className="main-image" style={{ position: 'relative' }}>
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="main-image-img"
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    display: 'block',
                    userSelect: 'none' // 이미지 드래그 방지
                  }}
                />
                
                {/* 찜하기 버튼 - 완전히 개선된 버전 */}
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  onMouseDown={(e) => {
                    console.log('찜하기 버튼 마우스다운'); // 디버깅용
                    e.preventDefault();
                  }}
                  style={{
                    position: 'absolute',
                    top: 'var(--space-2)',
                    right: 'var(--space-2)',
                    width: '40px', // 클릭 영역 더 확대
                    height: '40px', // 클릭 영역 더 확대
                    cursor: 'pointer',
                    zIndex: 50, // z-index 더 증가
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isWishlisted ? 'rgba(255, 81, 66, 0.9)' : 'rgba(0, 0, 0, 0.4)',
                    border: 'none',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    // 터치 디바이스 지원
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isWishlisted ? 'rgba(255, 81, 66, 1)' : 'rgba(0, 0, 0, 0.6)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isWishlisted ? 'rgba(255, 81, 66, 0.9)' : 'rgba(0, 0, 0, 0.4)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '2px solid #FF5142';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  title={isWishlisted ? '찜 목록에서 제거' : '찜 목록에 추가'}
                  aria-label={isWishlisted ? '찜 목록에서 제거' : '찜 목록에 추가'}
                >
                  <svg
                    style={{
                      width: '22px',
                      height: '22px',
                      pointerEvents: 'none',
                      transition: 'all 0.2s ease',
                      filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4))'
                    }}
                    viewBox="0 0 24 24"
                    fill={isWishlisted ? '#ffffff' : 'none'}
                    stroke={isWishlisted ? '#ffffff' : '#ffffff'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
              <div className="thumbnail-list">
                {item.images.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`${item.name} ${index + 1}`}
                    className="thumbnail"
                  />
                ))}
              </div>
            </div>

            {/* 우측: 상품 기본 정보만 */}
            <div className="item-info">
            {/* 상품 기본 정보 */}
            <div className="item-header">
              <div className="item-brand">{item.brand}</div>
              <h1 className="item-title">{item.name}</h1>
              <div className="item-subtitle">{item.category}</div>
            </div>

            {/* 가격 정보 */}
            <div className="price-section">
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <div style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  현재가 {item.currentPrice.toLocaleString()}원
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  즉시구매 {item.instantPrice.toLocaleString()}원
                </div>
              </div>

              <div className="auction-info">
                <div className="auction-bids">
                  <span className="label">입찰 횟수</span>
                  <span className="count">{item.bidCount}회</span>
                </div>
              </div>
            </div>

            {/* 모든 사이즈 (KREAM 스타일) */}
            <div className="size-section">
              <h3 className="section-title">모든 사이즈</h3>
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-primary)'
              }}>
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
                    ONE SIZE
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    <FaFire style={{ color: 'var(--orange-500)', fontSize: 'var(--text-sm)' }} />
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--orange-600)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      입찰중
                    </span>
                  </div>
                </div>
                <div style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {item.currentPrice.toLocaleString()}원
                </div>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  입장료 {item.entryFee.toLocaleString()}원 (최소금액)
                </div>
              </div>
            </div>

            {/* 경매 타이머 */}
            <div className="timer-section">
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)'
              }}>
                남은 시간
              </div>
              <div style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--orange-600)',
                fontFamily: 'var(--font-family)'
              }}>
                {timeRemaining}
              </div>
            </div>

            {/* 추가 혜택 */}
            <div className="benefits-section">
              <h4>추가 혜택</h4>
              <div className="benefit-item">
                <span className="benefit-icon">⚡</span>
                <span>빠른배송 {item.shippingCost === 0 ? '무료' : `${item.shippingCost.toLocaleString()}원`}</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon"><FaSeedling style={{ color: 'var(--mint-600)' }} /></span>
                <span>CO₂ {item.co2Saved}kg 절약 효과</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon"><FaHome style={{ color: 'var(--primary)' }} /></span>
                <span>집고픈 3,000원 무료</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 입찰 영역 (좌우 2열) */}
        <div className="bidding-layout" style={{ 
          marginBottom: 'var(--space-8)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-6)'
        }}>
          {/* 좌측: 구매 입찰 리스트 */}
          <div className="bid-history-container">
            <BidHistorySection currentPrice={item.currentPrice} serverBids={serverBids} />
          </div>

          {/* 우측: 입찰 탭과 버튼 */}
          <div className="action-section" style={{
            display: 'flex',
            gap: 'var(--space-4)'
          }}>
            {/* 좌측: 입찰 영역 */}
            <div style={{ flex: '2' }}>
              <div style={{
                display: 'flex',
                marginBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--border-primary)'
              }}>
                <button
                  onClick={() => setBidTabType('manual')}
                  style={{
                    flex: 1,
                    padding: 'var(--space-3)',
                    background: 'none',
                    border: 'none',
                    borderBottom: bidTabType === 'manual' ? '2px solid var(--orange-500)' : '2px solid transparent',
                    fontSize: 'var(--text-sm)',
                    fontWeight: bidTabType === 'manual' ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                    color: bidTabType === 'manual' ? 'var(--orange-600)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  일반 입찰
                </button>
                {/* 자동 입찰 탭 제거 */}
              </div>

              {/* 탭 콘텐츠 */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                {/* 입장료 안내 */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-family)',
                    textAlign: 'center',
                    lineHeight: 1.4
                  }}>
                    💡 경매 참여를 위해 입장료 {item.entryFee.toLocaleString()}원이 필요합니다 (최소 금액)
                  </div>
                </div>

                {/* 본인인증 버튼 */}
                {!canBid && (
                  <div style={{
                    background: 'var(--orange-50)',
                    border: '1px solid var(--orange-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                    marginBottom: 'var(--space-4)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--orange-700)',
                      fontFamily: 'var(--font-family)',
                      marginBottom: 'var(--space-2)'
                    }}>
                      ⚠️ 입찰 자격 검증이 필요합니다
                    </div>
                    <button
                      onClick={handleIdentityVerification}
                      style={{
                        padding: 'var(--space-2) var(--space-4)',
                        background: 'var(--orange-500)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-medium)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        fontFamily: 'var(--font-family)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--orange-600)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'var(--orange-500)';
                      }}
                    >
                      📱 본인인증하기
                    </button>
                  </div>
                )}

                {/* 본인인증 완료 표시 */}
                {canBid && (
                  <div style={{
                    background: 'var(--mint-50)',
                    border: '1px solid var(--mint-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                    marginBottom: 'var(--space-4)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--mint-700)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      ✅ 본인인증 완료 - 입찰 가능
                    </div>
                  </div>
                )}

                {bidTabType === 'manual' && (
                  <div>
                    <div style={{
                      marginBottom: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      background: 'var(--mint-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--mint-200)'
                    }}>
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--mint-700)',
                        fontFamily: 'var(--font-family)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        💡 일반 입찰 안내
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-family)',
                        lineHeight: 1.4
                      }}>
                        원하는 금액을 직접 입력하여 입찰합니다. 다른 사용자가 더 높은 금액으로 입찰하면 추월당할 수 있습니다.
                      </div>
                    </div>
                    
                    <div className="bid-input-section" style={{
                      display: 'flex',
                      gap: 'var(--space-2)'
                    }}>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => handleBidAmountChange(e.target.value)}
                        step={1000}
                        min={(item.currentPrice + item.bidUnit)}
                        placeholder={`${(item.currentPrice + item.bidUnit).toLocaleString()}원 이상 (최소인상폭: ${item.bidUnit.toLocaleString()}원, 실제사용가능: ${(wallet.balance - wallet.locked).toLocaleString()}원)`}
                        className="bid-input"
                        style={{
                          flex: 1,
                          padding: 'var(--space-3)',
                          border: parseInt(bidAmount) > (wallet.balance - wallet.locked) ? '1px solid var(--orange-500)' : '1px solid var(--border-primary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-base)',
                          fontFamily: 'var(--font-family)',
                          backgroundColor: parseInt(bidAmount) > (wallet.balance - wallet.locked) ? 'var(--orange-50)' : 'transparent'
                        }}
                        onKeyDown={(e) => {
                          // 화살표 키로 1,000원 단위 증감
                          const step = 1000;
                          const min = Number(item.currentPrice || 0) + Number(item.bidUnit || 1000);
                          const current = parseInt(bidAmount || min);
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setBidAmount(String((isNaN(current) ? min : current) + step));
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const next = (isNaN(current) ? min : current) - step;
                            setBidAmount(String(next < min ? min : next));
                          }
                        }}
                      />
                      <button 
                        onClick={handleBid} 
                        className="bid-button"
                        disabled={isBidButtonDisabled()}
                        style={{
                          padding: 'var(--space-3) var(--space-4)',
                          background: (() => {
                            if (isBidButtonDisabled()) {
                              if (isCurrentUserHighestBidder()) {
                                return 'var(--mint-400)'; // 최고가 입찰자일 때 민트색
                              }
                              return 'var(--gray-400)'; // 다른 비활성화 상태
                            }
                            return 'var(--orange-500)'; // 활성화 상태
                          })(),
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--weight-medium)',
                          cursor: (isBidButtonDisabled()) ? 'not-allowed' : 'pointer',
                          transition: 'all var(--transition-fast)',
                          fontFamily: 'var(--font-family)',
                          opacity: (isBidButtonDisabled()) ? 0.8 : 1
                        }}
                        onMouseEnter={(e) => {
                          // 디버깅: 버튼 상태 정보 표시
                          console.log('🔍 입찰 버튼 상태:', {
                            isAuctionEnded,
                            bidAmount: parseInt(bidAmount),
                            walletAvailable: wallet.availableBalance,
                            canBid,
                            isHighestBidder: isCurrentUserHighestBidder(),
                            disabled: isBidButtonDisabled()
                          });
                          
                          if (!isBidButtonDisabled()) {
                            e.target.style.background = 'var(--orange-600)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isBidButtonDisabled()) {
                            e.target.style.background = 'var(--orange-500)';
                          }
                        }}
                        title={getBidButtonTitle()}
                      >
                        {getBidButtonText()}
                      </button>
                    </div>
                  </div>
                )}

                {/* 자동 입찰 UI 제거 */}
              </div>
              </div>

            {/* 우측: 지갑 정보 */}
            <div style={{ flex: '1' }}>
                      <div style={{
                background: 'var(--mint-50)',
                border: '1px solid var(--mint-200)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                height: 'fit-content'
              }}>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--mint-700)',
                  marginBottom: 'var(--space-3)',
                  fontFamily: 'var(--font-family)'
                }}>
                  💰 내 포인트
                </div>
                {walletLoading ? (
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    로딩 중...
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>보유 포인트:</span>
                      <span style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                        {wallet.balance.toLocaleString()}원
                      </span>
                    </div>
                    {wallet.locked > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ color: 'var(--orange-600)' }}>잠긴 포인트:</span>
                        <span style={{ fontWeight: 'var(--weight-medium)', color: 'var(--orange-600)' }}>
                          {wallet.locked.toLocaleString()}원
                        </span>
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: 'var(--space-1)',
                      borderTop: '1px solid var(--mint-200)',
                      marginTop: 'var(--space-1)'
                    }}>
                      <span style={{ color: 'var(--mint-700)', fontWeight: 'var(--weight-semibold)' }}>사용 가능:</span>
                      <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--mint-700)' }}>
                        {wallet.availableBalance.toLocaleString()}원
                      </span>
                    </div>

                  </div>
                )}
              </div>
                
              {/* 즉시 결제 / 낙찰하기 / 경매종료 버튼 - 지갑 정보 아래 */}
              <button 
                onClick={isAuctionEnded && winner?.hasWinner && winner?.winnerId === currentUserId ? handleWinnerCheckout : handleInstantPurchase} 
                className="instant-purchase-button"
                  disabled={
                    isAuctionEnded 
                      ? (!winner?.hasWinner || winner?.winnerId !== currentUserId)
                      : (item.instantPrice > (wallet.balance - wallet.locked))
                  }
                style={{
                  width: '100%',
                    padding: 'var(--space-3)',
                    marginTop: 'var(--space-3)',
                    background: (() => {
                      if (isAuctionEnded) {
                        return winner?.hasWinner && winner?.winnerId === currentUserId 
                        ? 'var(--mint-500)' 
                          : 'var(--gray-400)';
                      } else {
                        return item.instantPrice > (wallet.balance - wallet.locked)
                          ? 'var(--gray-400)' 
                          : 'var(--orange-500)';
                      }
                    })(),
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--weight-bold)',
                    cursor: (() => {
                      if (isAuctionEnded) {
                        return (!winner?.hasWinner || winner?.winnerId !== currentUserId) ? 'not-allowed' : 'pointer';
                      } else {
                        return item.instantPrice > (wallet.balance - wallet.locked) ? 'not-allowed' : 'pointer';
                      }
                    })(),
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'var(--font-family)',
                  marginBottom: 'var(--space-4)',
                    opacity: (() => {
                      if (isAuctionEnded) {
                        return (!winner?.hasWinner || winner?.winnerId !== currentUserId) ? 0.6 : 1;
                      } else {
                        return item.instantPrice > (wallet.balance - wallet.locked) ? 0.6 : 1;
                      }
                    })()
                  }}
                  title={
                    isAuctionEnded 
                      ? (winner?.hasWinner && winner?.winnerId === currentUserId ? '낙찰자 결제' : '경매 종료')
                      : (item.instantPrice > (wallet.balance - wallet.locked) ? '포인트가 부족합니다' : '즉시 결제')
                  }
                onMouseEnter={(e) => {
                  if (!isAuctionEnded) {
                    e.target.style.background = 'var(--orange-600)';
                    e.target.style.transform = 'translateY(-1px)';
                  } else if (winner?.hasWinner && winner?.winnerId === currentUserId) {
                    e.target.style.background = 'var(--mint-600)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAuctionEnded) {
                    e.target.style.background = 'var(--orange-500)';
                    e.target.style.transform = 'translateY(0)';
                  } else if (winner?.hasWinner && winner?.winnerId === currentUserId) {
                    e.target.style.background = 'var(--mint-500)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {(() => {
                  if (isAuctionEnded) {
                    if (winner?.hasWinner && winner?.winnerId === currentUserId) {
                      return `낙찰하기 ${winner?.winningAmount?.toLocaleString()}원`;
                    } else {
                      return '경매종료';
                    }
                      } else {
                        const actualAvailableBalance = wallet.balance - wallet.locked;
                        if (item.instantPrice > actualAvailableBalance) {
                          return `포인트 부족 (${(item.instantPrice - actualAvailableBalance).toLocaleString()}원 부족)`;
                  } else {
                    return `즉시 결제 ${item.instantPrice.toLocaleString()}원`;
                        }
                  }
                })()}
              </button>
            </div>
          </div> {/* action-section 닫기 */}
        </div>


                </div>

             {/* NICE 본인인증 모달 */}
       {showNiceModal && (
                <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000,
           padding: 'var(--space-4)'
         }}>
           <div style={{
             background: 'white',
             borderRadius: 'var(--radius-lg)',
             padding: 'var(--space-6)',
             maxWidth: '400px',
             width: '100%',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
           }}>
             {/* 모달 헤더 */}
             <div style={{
               textAlign: 'center',
                  marginBottom: 'var(--space-6)'
                }}>
               <div style={{
                 fontSize: 'var(--text-2xl)',
                 fontWeight: 'var(--weight-bold)',
                 color: 'var(--text-primary)',
                 marginBottom: 'var(--space-2)',
                    fontFamily: 'var(--font-family)'
                  }}>
                 📱 NICE 본인인증
               </div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                 fontFamily: 'var(--font-family)'
               }}>
                 {niceVerificationStep === 'phone' && '휴대폰 번호를 입력해주세요'}
                 {niceVerificationStep === 'code' && 'SMS로 발송된 인증번호를 입력해주세요'}
                 {niceVerificationStep === 'success' && '본인인증이 완료되었습니다!'}
                  </div>
                </div>

                           {/* 1단계: 휴대폰 번호 입력 */}
              {niceVerificationStep === 'phone' && (
                <div>
                  {/* 세션 휴대폰 번호 안내 */}
                  {sessionPhoneNumber && (
                  <div style={{
                    background: 'var(--mint-50)',
                    border: '1px solid var(--mint-200)',
                    borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3)',
                      marginBottom: 'var(--space-4)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--mint-700)',
                      fontFamily: 'var(--font-family)',
                    textAlign: 'center'
                  }}>
                      📱 회원가입 시 등록한 휴대폰 번호: <strong>{sessionPhoneNumber}</strong>
                    </div>
                  )}
                  
                    <div style={{
                    marginBottom: 'var(--space-4)'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      휴대폰 번호
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="01012345678"
                      maxLength={11}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-base)',
                        fontFamily: 'var(--font-family)'
                      }}
                    />
                    </div>
                 
                    <div style={{
                   display: 'flex',
                   gap: 'var(--space-3)'
                 }}>
                   <button
                     onClick={() => setShowNiceModal(false)}
                     style={{
                       flex: 1,
                       padding: 'var(--space-3)',
                       background: 'var(--gray-500)',
                       color: 'white',
                       border: 'none',
                       borderRadius: 'var(--radius-md)',
                       fontSize: 'var(--text-sm)',
                       fontWeight: 'var(--weight-medium)',
                       cursor: 'pointer',
                       fontFamily: 'var(--font-family)'
                     }}
                   >
                     취소
                   </button>
                   <button
                     onClick={handleNiceVerificationStart}
                     style={{
                       flex: 1,
                       padding: 'var(--space-3)',
                       background: 'var(--orange-500)',
                       color: 'white',
                       border: 'none',
                       borderRadius: 'var(--radius-md)',
                       fontSize: 'var(--text-sm)',
                       fontWeight: 'var(--weight-medium)',
                       cursor: 'pointer',
                       fontFamily: 'var(--font-family)'
                     }}
                   >
                     인증번호 발송
                   </button>
                    </div>
                  </div>
             )}
                  
             {/* 2단계: 인증번호 입력 */}
             {niceVerificationStep === 'code' && (
               <div>
                  <div style={{
                   marginBottom: 'var(--space-4)'
                 }}>
                   <label style={{
                     display: 'block',
                      fontSize: 'var(--text-sm)',
                     fontWeight: 'var(--weight-medium)',
                     color: 'var(--text-primary)',
                     marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                     인증번호 (6자리)
                   </label>
                   <input
                     type="text"
                     value={verificationCode}
                     onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                     placeholder="123456"
                     maxLength={6}
                     style={{
                       width: '100%',
                       padding: 'var(--space-3)',
                       border: '1px solid var(--border-primary)',
                       borderRadius: 'var(--radius-md)',
                       fontSize: 'var(--text-base)',
                       fontFamily: 'var(--font-family)'
                     }}
                   />
                   
                   {/* 타이머 및 재발송 */}
                    <div style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     marginTop: 'var(--space-2)',
                     fontSize: 'var(--text-xs)',
                     color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)'
                    }}>
                     <span>
                       남은 시간: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                     </span>
                     <button
                       onClick={handleResendCode}
                       disabled={isResendDisabled}
                       style={{
                         background: 'none',
                         border: 'none',
                         color: isResendDisabled ? 'var(--gray-400)' : 'var(--orange-500)',
                         cursor: isResendDisabled ? 'not-allowed' : 'pointer',
                         fontSize: 'var(--text-xs)',
                         textDecoration: 'underline',
                         fontFamily: 'var(--font-family)'
                       }}
                     >
                       {isResendDisabled ? '1분 후 재발송' : '재발송'}
                     </button>
                    </div>
                  </div>
                  
                 <div style={{
                   display: 'flex',
                   gap: 'var(--space-3)'
                 }}>
                   <button
                     onClick={() => setShowNiceModal(false)}
                     style={{
                       flex: 1,
                       padding: 'var(--space-3)',
                       background: 'var(--gray-500)',
                       color: 'white',
                       border: 'none',
                       borderRadius: 'var(--radius-md)',
                       fontSize: 'var(--text-sm)',
                       fontWeight: 'var(--weight-medium)',
                       cursor: 'pointer',
                       fontFamily: 'var(--font-family)'
                     }}
                   >
                     취소
                   </button>
                   <button
                     onClick={handleVerifyCode}
                     style={{
                       flex: 1,
                       padding: 'var(--space-3)',
                       background: 'var(--orange-500)',
                       color: 'white',
                       border: 'none',
                       borderRadius: 'var(--radius-md)',
                       fontSize: 'var(--text-sm)',
                       fontWeight: 'var(--weight-medium)',
                       cursor: 'pointer',
                       fontFamily: 'var(--font-family)'
                     }}
                   >
                     인증 확인
                   </button>
                </div>
               </div>
             )}

             {/* 3단계: 인증 완료 */}
             {niceVerificationStep === 'success' && (
                  <div style={{
                 textAlign: 'center'
               }}>
                 <div style={{
                   fontSize: '4rem',
                   marginBottom: 'var(--space-4)'
                 }}>
                   ✅
                 </div>
                 <div style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--mint-700)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: 'var(--font-family)'
                    }}>
                   본인인증 완료!
                 </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                   marginBottom: 'var(--space-4)',
                      fontFamily: 'var(--font-family)'
                    }}>
                   이제 경매에 입찰할 수 있습니다.
                    </div>
                 
                 <button
                   onClick={() => setShowNiceModal(false)}
                   style={{
                     width: '100%',
                     padding: 'var(--space-3)',
                     background: 'var(--mint-500)',
                     color: 'white',
                     border: 'none',
                     borderRadius: 'var(--radius-md)',
                     fontSize: 'var(--text-sm)',
                     fontWeight: 'var(--weight-medium)',
                     cursor: 'pointer',
                     fontFamily: 'var(--font-family)'
                   }}
                 >
                   확인
                 </button>
                  </div>
                )}

                                                       {/* 테스트 안내 */}
                              <div style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-3)',
                  background: 'var(--orange-50)',
                  border: '1px solid var(--orange-200)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--orange-700)',
                  fontFamily: 'var(--font-family)'
                }}>
                  <strong>🧪 시뮬레이션 모드 안내:</strong><br/>
                  • 휴대폰 번호: <strong>회원가입 시 등록한 번호만 입력 가능</strong><br/>
                  • 인증번호: <strong>123456</strong> 입력<br/>
                  • 세션 휴대폰 번호와 일치해야 인증번호 발송 가능<br/>
                  • 백엔드 연결 없이 프론트엔드에서 시뮬레이션 동작
              </div>
          </div>
        </div>
       )}
      
      {/* 푸터 */}
      <Footer />
    </div>
     </div>
  );
}

/**
 * 구매 입찰 내역 섹션 컴포넌트
 * 크림 스타일의 입찰 내역 표시
 */
function BidHistorySection({ currentPrice, serverBids = [] }) {
  const [bidHistory, setBidHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBidHistory();
  }, [serverBids, currentPrice]);

  // TODO: 백엔드 연동 - 입찰 내역 API 호출
  // GET /api/auctions/:id/bids?limit=10
  const loadBidHistory = () => {
    setLoading(true);
    console.log('🔍 입찰 내역 로딩:', {
      serverBidsLength: serverBids?.length,
      sampleBidTime: serverBids?.[0]?.bidTime,
      sampleBidTimeType: typeof serverBids?.[0]?.bidTime
    });
    
    const mapped = (serverBids || []).map((b) => ({
      id: b.bidId || Math.random(),
      amount: Number(b.bidAmount || 0),
      size: 'ONE SIZE',
        time: b.bidTime ? new Date(Number(b.bidTime)) : new Date(), // 타임스탬프를 UTC 시간으로 변환
      isHighest: false
    }));
    
    console.log('🔍 매핑된 입찰 내역:', {
      mappedLength: mapped.length,
      sampleBidTime: serverBids?.[0]?.bidTime,
      parsedTime: mapped?.[0]?.time
    });
    
    if (mapped.length > 0) {
      const top = Math.max(...mapped.map(m => m.amount));
      mapped.forEach(m => { m.isHighest = (m.amount === top); });
    }
    setBidHistory(mapped);
    setLoading(false);
  };

  const formatTime = (date) => {
    // UTC 시간으로 표시
    return date.toLocaleString('ko-KR', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  if (loading) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-4)',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-family)',
          textAlign: 'center'
        }}>
          입찰 내역을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-4)',
      border: '1px solid var(--border-primary)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-3)',
        paddingBottom: 'var(--space-2)',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <h4 style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--text-primary)',
          margin: 0,
          fontFamily: 'var(--font-family)'
        }}>
          구매 입찰
        </h4>
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-family)'
        }}>
          <span>거래가</span>
          <span>•</span>
          <span>거래일</span>
        </div>
      </div>

      <div style={{
        maxHeight: '200px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      }}>
        {bidHistory.map((bid, index) => (
          <div
            key={bid.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-2)',
              background: bid.isHighest ? 'var(--mint-50)' : 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: bid.isHighest ? '1px solid var(--mint-300)' : '1px solid transparent',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-1)'
              }}>
                <span style={{
                  fontWeight: 'var(--weight-bold)',
                  color: bid.isHighest ? 'var(--mint-700)' : 'var(--text-primary)'
                }}>
                  {bid.amount.toLocaleString()}원
                </span>
                {bid.isHighest && (
                  <span style={{
                    background: 'var(--mint-500)',
                    color: 'white',
                    padding: 'var(--space-0) var(--space-1)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-bold)'
                  }}>
                    최고가
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)'
              }}>
                {bid.size}
              </div>
            </div>
            
            <div style={{
              textAlign: 'right',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ 
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-secondary)'
              }}>
                {formatTime(bid.time)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {bidHistory.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-6)',
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)'
        }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: 'var(--space-2)',
            opacity: 0.5
          }}>
            📋
          </div>
          <div>아직 입찰 내역이 없습니다</div>
          <div style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
            첫 번째 입찰자가 되어보세요!
          </div>
        </div>
      )}

      <div style={{
        marginTop: 'var(--space-3)',
        paddingTop: 'var(--space-2)',
        borderTop: '1px solid var(--border-primary)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)',
        fontFamily: 'var(--font-family)',
        textAlign: 'center'
      }}>
        💡 모든 입찰은 실시간으로 업데이트됩니다
      </div>
    </div>
  );
}

/**
 * 상품 상태별 색상 매핑 함수 (AuctionPage.js와 동일)
 */
function getConditionColor(condition) {
  const colors = {
    'S': { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', text: '#8B4513' }, // 골드
    'A': { bg: 'linear-gradient(135deg,rgb(235, 124, 134),rgb(212, 66, 66))', text: '#000000' }, // 검은색으로 변경
    'B': { bg: 'linear-gradient(135deg, #87CEEB, #4169E1)', text: '#000080' }, // 블루
    'C': { bg: 'linear-gradient(135deg,rgb(150, 235, 124),rgb(121, 219, 112))', text: '#006400' }  // 그린
  };
  return colors[condition] || { bg: '#f3f4f6', text: '#374151' };
}
