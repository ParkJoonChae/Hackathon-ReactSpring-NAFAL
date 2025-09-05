import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaGavel,
  FaSearch
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

/**
 * AuctionPage - NAFAL 경매 페이지
 * 폐기물 경매 목록 및 필터링
 */
export default function AuctionPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ending_soon');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  
  // TODO: NAFAL.STORE 배포 시 변경 필요
  // 개발환경: http://localhost:8080/NAFAL
  // 운영환경: https://api.nafal.store 또는 백엔드 서버 도메인
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/NAFAL',
    withCredentials: true,
  });

  useEffect(() => {
    loadCategories();
    loadAuctions();
  }, [filter, sortBy]);

  // 카테고리 로드
  const loadCategories = async () => {
    try {
      const response = await api.get('/api/post/getCategory');
      console.log('카테고리 API 응답:', response.data);
      
      let categoryData = response.data;
      if (!Array.isArray(categoryData)) {
        console.warn('카테고리 데이터가 배열이 아닙니다:', categoryData);
        categoryData = [];
      }
      
      // 카테고리 데이터 구조 정규화
      const normalizedCategories = categoryData.map(category => {
        console.log('카테고리 원본 데이터:', category);
        return {
          id: category.categoryId || category.id,
          name: category.name || category.categoryName || '이름 없음',
          icon: category.icon || 'FaBox'
        };
      });
      
      console.log('정규화된 카테고리 데이터:', normalizedCategories);
      setCategories(normalizedCategories);
      
    } catch (error) {
      console.error('카테고리 목록 로딩 실패:', error);
      // 기본 카테고리로 폴백
      setCategories([
        { id: 'all', name: '전체' },
        { id: 'furniture', name: '가구/테이블' },
        { id: 'fabric', name: '소품/패브릭' },
        { id: 'appliances', name: '가전/커피머신' },
        { id: 'tumbler', name: '소품/텀블러' },
        { id: 'art', name: '예술작품/오브제' },
        { id: 'cup', name: '소품/머그컵' }
      ]);
    }
  };

  const loadAuctions = async () => {
    setLoading(true);
    
    try {
      // DB에서 경매 상품 목록 가져오기
      const response = await api.get('/api/auction/list');
      console.log('경매 상품 목록 API 응답:', response.data);
      
      if (response.data.success) {
        let auctionData = response.data.products || [];
        
        // DB 데이터를 프론트엔드 형식으로 변환 (단순하게)
        const transformedData = auctionData.map(product => {
          // 날짜를 안전하게 변환
          let endTime;
          try {
            if (product.auctionEnd) {
              endTime = new Date(product.auctionEnd);
              if (isNaN(endTime.getTime())) {
                endTime = new Date();
              }
            } else {
              endTime = new Date();
            }
          } catch (error) {
            console.warn('날짜 변환 실패:', product.auctionEnd, error);
            endTime = new Date();
          }

          return {
            id: product.productId,
            title: product.title,
            category: product.category?.toLowerCase().replace(/[^a-zA-Z]/g, '') || 'furniture',
            categoryId: product.categoryId,
            categoryName: product.category,
            brand: product.brand || 'NAFAL',
            currentPrice: Number(product.currentPrice || product.ori_price || 1000),
            instantPrice: Number(product.instantPrice || 5000),
            bidCount: product.bidCount || 0,
            endTime: endTime,
            image: product.image || '/items/default.png',
            status: product.auctionStatus || 'ongoing',
            condition: product.productCondition || 'S',
            description: product.description || '설명 없음',
            tags: product.tag ? product.tag.split(',').map(tag => tag.trim()) : [],
            material: product.meterial || '재질 정보 없음'
          };
        });

        // 필터링
        let filteredData = transformedData;
        if (filter !== 'all') {
          console.log('필터링 전 데이터:', transformedData.length, '개');
          console.log('선택된 필터:', filter, '타입:', typeof filter);
          
          filteredData = transformedData.filter(item => {
            console.log(`상품 ${item.id}: categoryId=${item.categoryId} (${typeof item.categoryId}), filter=${filter} (${typeof filter})`);
            
            // 카테고리 ID로 필터링 (문자열과 숫자 모두 처리)
            if (item.categoryId !== undefined && item.categoryId !== null) {
              const itemCategoryId = item.categoryId.toString();
              const filterStr = filter.toString();
              const matches = itemCategoryId === filterStr;
              console.log(`  → categoryId 비교: ${itemCategoryId} === ${filterStr} = ${matches}`);
              return matches;
            }
            
            // 카테고리명으로 필터링 (fallback)
            const matches = item.category === filter;
            console.log(`  → category명 비교: ${item.category} === ${filter} = ${matches}`);
            return matches;
          });
          
          console.log('필터링 후 데이터:', filteredData.length, '개');
        }

        // 정렬
        switch (sortBy) {
          case 'ending_soon':
            filteredData.sort((a, b) => a.endTime - b.endTime);
            break;
          case 'price_low':
            filteredData.sort((a, b) => a.currentPrice - b.currentPrice);
            break;
          case 'price_high':
            filteredData.sort((a, b) => b.currentPrice - a.currentPrice);
            break;
          case 'bid_count':
            filteredData.sort((a, b) => b.bidCount - a.bidCount);
            break;
          default:
            break;
        }

        setAuctions(filteredData);
      } else {
        console.error('경매 상품 목록 조회 실패:', response.data.error);
        // 에러 시 기본 데이터로 폴백
        setAuctions([]);
      }
    } catch (error) {
      console.error('경매 상품 목록 로딩 실패:', error);
      // 에러 시 기본 데이터로 폴백
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { id: 'ending_soon', name: '마감임박순' },
    { id: 'bid_count', name: '인기순' },
    { id: 'price_low', name: '낮은가격순' },
    { id: 'price_high', name: '높은가격순' }
  ];

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const diff = endTime - now;
    
    if (diff <= 0) return '종료';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}일 ${hours % 24}시간`;
    }
    
    return `${hours}시간 ${minutes}분`;
  };

  const handleAuctionClick = (auction) => {
    console.log('Auction clicked:', auction.title);
    navigate(`/item/${auction.id}`);
  };

  return (
    <div className="auction-page">
      <Header />
      
      <div style={{ height: 'var(--header-height)' }} />

      {/* 페이지 헤더 */}
      <section className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="section-header" style={{ marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-family)'
            }}>
              <FaGavel style={{ marginRight: 'var(--space-2)', color: 'var(--orange-500)' }} />
              실시간 경매
            </h1>
            <p style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)'
            }}>
              지속가능한 가치를 발견하고 새로운 주인을 찾아주세요
            </p>
          </div>
        </div>

        {/* 필터 및 정렬 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}>
          {/* 카테고리 필터 */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {/* 전체 카테고리 버튼 */}
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                border: `1px solid ${filter === 'all' ? '#8A38F5' : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-md)',
                background: filter === 'all' ? '#8A38F5' : 'var(--bg-primary)',
                color: filter === 'all' ? 'var(--white)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-family)'
              }}
            >
              전체
            </button>
            
            {/* 동적으로 로드된 카테고리들 */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  console.log('카테고리 클릭:', category.name, 'ID:', category.id, '타입:', typeof category.id);
                  setFilter(category.id);
                }}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  border: `1px solid ${filter === category.id ? '#8A38F5' : 'var(--border-primary)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: filter === category.id ? '#8A38F5' : 'var(--bg-primary)',
                  color: filter === category.id ? 'var(--white)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 정렬 옵션 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-family)'
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* 경매 목록 */}
        {loading ? (
          <AuctionGridSkeleton />
        ) : auctions.length > 0 ? (
          <div className="product-grid">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onClick={() => handleAuctionClick(auction)}
                timeRemaining={formatTimeRemaining(auction.endTime)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-12)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-family)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'center', color: 'var(--text-tertiary)' }}><FaSearch /></div>
            <h3 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-medium)',
              marginBottom: 'var(--space-2)'
            }}>
              {filter === 'all' ? '등록된 경매 상품이 없습니다' : '해당 카테고리의 경매 상품이 없습니다'}
            </h3>
            <p>다른 카테고리를 선택해보세요</p>
          </div>
        )}
      </section>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}

/**
 * 상품 상태별 색상 매핑 함수
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

/**
 * 찜하기 유틸리티 함수들 (HomePage.js와 동일)
 * TODO: 공통 유틸리티로 분리하여 재사용성 향상
 */
const WishlistUtils = {
  toggleWishlist: async (productId) => {
    // TODO: 백엔드 API 호출
    // POST /api/wishlist/toggle
    const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isWishlisted = currentWishlist.includes(productId);
    
    let newWishlist;
    if (isWishlisted) {
      newWishlist = currentWishlist.filter(id => id !== productId);
    } else {
      newWishlist = [...currentWishlist, productId];
    }
    
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    return !isWishlisted;
  },

  isWishlisted: (productId) => {
    // TODO: 백엔드에서 사용자 찜 목록 조회
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.includes(productId);
  },

  checkLogin: () => {
    const user = localStorage.getItem('user');
    return !!user;
  }
};

/**
 * AuctionCard Component - 찜하기 기능 + 호버 태그 표시 추가
 */
function AuctionCard({ auction, onClick, timeRemaining }) {
  const isEndingSoon = auction.endTime - new Date() < 60 * 60 * 1000; // 1시간 이내
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);

  // 경매 상태에 따른 스타일과 텍스트 반환
  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled':
        return { text: '경매 예정', color: '#3B82F6', bgColor: '#DBEAFE' }; // 파란색
      case 'ongoing':
        return { text: '경매 진행중', color: '#10B981', bgColor: '#D1FAE5' }; // 초록색
      case 'ended':
        return { text: '경매 종료', color: '#EF4444', bgColor: '#FEE2E2' }; // 빨간색
      default:
        return { text: '상태 미정', color: '#6B7280', bgColor: '#F3F4F6' }; // 회색
    }
  };

  useEffect(() => {
    setIsWishlisted(WishlistUtils.isWishlisted(auction.id));
  }, [auction.id]);

  const handleWishlistClick = async (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    if (!WishlistUtils.checkLogin()) {
      alert('로그인 후 사용 가능합니다.');
      return;
    }

    try {
      const newWishlistState = await WishlistUtils.toggleWishlist(auction.id);
      setIsWishlisted(newWishlistState);
    } catch (error) {
      console.error('찜하기 처리 중 오류:', error);
      alert('찜하기 처리 중 오류가 발생했습니다.');
    }
  };

  // 호버 시 태그 표시를 위한 이벤트 핸들러
  const handleMouseEnter = () => {
    // 2초 후에 태그 표시
    const timer = setTimeout(() => {
      setShowTags(true);
    }, 2000);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    // 호버 종료 시 타이머 클리어하고 태그 숨김
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    setShowTags(false);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
    };
  }, [hoverTimer]);

  return (
    <div
      className="product-card relative cursor-pointer"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        border: isEndingSoon ? '2px solid var(--orange-500)' : '1px solid var(--border-primary)'
      }}
    >
      {/* 반응형 경매 이미지 */}
      <div className="image-container">
        <img
          src={auction.image}
          alt={auction.title}
          className="responsive-image"
        />
        
        {/* 경매 상태 표시 */}
        <div className="auction-status" style={{
          backgroundColor: getStatusInfo(auction.status).bgColor,
          color: getStatusInfo(auction.status).color,
          position: 'absolute',
          top: 'var(--space-2)',
          right: 'var(--space-2)',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 4,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}>
          {getStatusInfo(auction.status).text}
        </div>

        {/* 찜하기 버튼 - 순수 하트 모양 */}
        <svg
          onClick={handleWishlistClick}
          style={{
            position: 'absolute',
            top: 'calc(var(--space-2) + 32px)',
            right: 'var(--space-2)',
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            zIndex: 3,
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.15)';
            e.target.style.filter = 'drop-shadow(0 2px 8px rgba(255, 81, 66, 0.8))';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.filter = 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))';
          }}
          viewBox="0 0 24 24"
          fill={isWishlisted ? '#FF5142' : 'none'}
          stroke={isWishlisted ? '#FF5142' : '#ffffff'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          title={isWishlisted ? '찜 목록에서 제거' : '찜 목록에 추가'}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>

        {/* 태그 오버레이 - 2초 호버 후 표시 */}
        {showTags && auction.tags && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 'var(--space-4)',
              zIndex: 2,
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-2)',
              width: '100%',
              maxWidth: '200px'
            }}>
              {auction.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    background: 'linear-gradient(135deg, var(--mint-400), var(--mint-300))',
                    color: 'var(--mint-900)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-medium)',
                    fontFamily: 'var(--font-family)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    animation: `tagFloat 2s ease-in-out infinite ${index * 0.2}s`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 배지 */}
      <div className="product-card__badges">
        {isEndingSoon && (
          <span className="badge" style={{
            background: 'var(--orange-500)',
            color: 'var(--white)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-bold)'
          }}>
            마감임박
          </span>
        )}
        {/* 상품 상태 배지 */}
        {auction.condition && (
          <span 
            className="badge" 
            style={{
              background: getConditionColor(auction.condition).bg,
              color: getConditionColor(auction.condition).text,
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-bold)'
            }}
          >
            {auction.condition}급
          </span>
        )}
      </div>

      {/* 경매 정보 */}
      <div className="product-card__content">
        <div className="product-card__brand">{auction.brand}</div>
        <div className="product-card__title">{auction.title}</div>
        
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
          }}>
            최고 입찰가 {auction.currentPrice.toLocaleString()}원
          </div>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-family)'
          }}>
            즉시구매가 {auction.instantPrice.toLocaleString()}원
          </div>
        </div>

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
            입찰 {auction.bidCount}회
          </span>
          <span style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            color: isEndingSoon ? 'var(--orange-500)' : 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
          }}>
            {timeRemaining}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton
 */
function AuctionGridSkeleton() {
  return (
    <div className="product-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="product-card">
          <div 
            className="product-card__image"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              animation: 'pulse 2s infinite'
            }}
          />
          <div className="product-card__content">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i}
                style={{ 
                  height: '16px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: '4px',
                  marginBottom: 'var(--space-2)',
                  animation: 'pulse 2s infinite'
                }} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
