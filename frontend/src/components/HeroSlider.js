import React, { useState, useEffect } from 'react';

/**
 * HeroSlider Component - NAFAL Full-Screen Hero
 * 짜릿한 감정을 주는 풀스크린 히어로 섹션
 */
export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 더욱 임팩트 있는 슬라이드 데이터
  const slides = [
    {
      id: 1,
      image: '/1.png',
      title: '폐기물이 예술이 되는 순간',
      subtitle: '버려진 것들의 새로운 시작, NAFAL과 함께하세요',
      cta: '지금 시작하기',
      accentText: '특별 경매',
      stats: '2,456개 상품'
    },
    {
      id: 2,
      image: '/2.png',
      title: '당신의 선택이 지구를 구합니다',
      subtitle: '하나의 구매로 만드는 지속가능한 미래',
      cta: '컬렉션 탐험',
      accentText: '프리미엄',
      stats: '12.4톤 CO₂ 절약'
    },
    {
      id: 3,
      image: '/3.png',
      title: '투명하고 안전한 거래의 혁신',
      subtitle: '신뢰할 수 있는 플랫폼에서 특별한 가치를 만나보세요',
      cta: '안전성 확인',
      accentText: '신뢰 보장',
      stats: '98% 만족도'
    },
    {
      id: 4,
      image: '/4.png',
      title: '지금 이 순간, 경매가 열립니다',
      subtitle: '실시간으로 펼쳐지는 흥미진진한 경매의 세계',
      cta: '실시간 참여',
      accentText: 'LIVE',
      stats: '24시간 운영'
    }
  ];

  // 자동 슬라이드 (6초마다) + 로딩 효과
  useEffect(() => {
    // 컴포넌트 마운트 시 로딩 애니메이션
    const loadTimeout = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => {
      clearTimeout(loadTimeout);
      clearInterval(interval);
    };
  }, [slides.length]);

  const handleSlideClick = (index) => {
    setCurrentSlide(index);
  };

  const handleCTAClick = (slide) => {
    console.log('CTA clicked:', slide.title);
    // TODO: Implement navigation based on slide with smooth transition
  };

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div 
      className={`hero-fullscreen ${isLoaded ? 'hero-fullscreen--loaded' : ''}`}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)'
      }}
    >
      {/* 배경 슬라이드들 */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === currentSlide ? 'hero-slide--active' : ''}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            zIndex: 1
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.4) contrast(1.2)',
              transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 8s ease-out'
            }}
          />
          
          {/* 다층 그라데이션 오버레이 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(circle at center bottom, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%),
              linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)
            `,
            zIndex: 2
          }} />
        </div>
      ))}

      {/* 메인 콘텐츠 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 var(--space-6)',
        zIndex: 10,
        transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
        opacity: isLoaded ? 1 : 0,
        transition: 'all 1s ease-out'
      }}>
        
        {/* 메인 타이틀 */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 'var(--weight-bold)',
          color: 'white',
          lineHeight: '1.1',
          marginBottom: 'var(--space-6)',
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          fontFamily: 'var(--font-family)',
          maxWidth: '900px',
          animation: 'heroTitleSlide 1s ease-out'
        }}>
          {slides[currentSlide].title}
        </h1>

        {/* 서브타이틀 */}
        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          color: 'rgba(255,255,255,0.9)',
          lineHeight: '1.6',
          marginBottom: 'var(--space-8)',
          fontFamily: 'var(--font-family)',
          fontWeight: 'var(--weight-medium)',
          maxWidth: '600px',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          {slides[currentSlide].subtitle}
        </p>

        {/* 메인 CTA 버튼 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'var(--space-8)'
        }}>
          <button
            onClick={scrollToContent}
            style={{
              padding: 'var(--space-4) var(--space-8)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--mint-900)',
              background: 'linear-gradient(135deg, var(--mint-400) 0%, var(--mint-300) 100%)',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(var(--mint-400-rgb), 0.4)',
              backdropFilter: 'blur(10px)',
              fontFamily: 'var(--font-family)',
              transform: 'translateY(0)',
              minWidth: '180px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.05)';
              e.target.style.boxShadow = '0 12px 35px rgba(var(--mint-400-rgb), 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 8px 25px rgba(var(--mint-400-rgb), 0.4)';
            }}
          >
            둘러보기
          </button>
        </div>
      </div>

      {/* 스크롤 다운 힌트 */}
      <div style={{
        position: 'absolute',
        bottom: 'var(--space-6)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-family)',
        animation: 'bounce 2s infinite',
        cursor: 'pointer',
        zIndex: 15
      }}
      onClick={scrollToContent}>
        <span>스크롤하여 더보기</span>
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* CSS 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes heroTitleSlide {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-8px);
          }
          60% {
            transform: translateX(-50%) translateY(-4px);
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(var(--mint-400-rgb), 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(var(--mint-400-rgb), 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(var(--mint-400-rgb), 0);
          }
        }
      `}</style>
    </div>
  );
}