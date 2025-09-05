import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  FaLeaf, 
  FaRecycle, 
  FaSeedling, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaHandshake,
  FaBolt,
  FaFire,
  FaTachometerAlt
} from 'react-icons/fa';
import { 
  HiGlobeAlt,
  HiLightningBolt 
} from 'react-icons/hi';
import { 
  RiEarthFill,
  RiShieldCheckFill,
  RiLiveFill
} from 'react-icons/ri';
import Header from '../components/Header';
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';

/**
 * HomePage - NAFAL 폐기물 경매 플랫폼
 * 트렌디한 스크롤 애니메이션과 임팩트 중심의 메인페이지
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // 패럴랙스 효과를 위한 transform 값들
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const handleStartAuction = () => {
    navigate('/auction');
  };

  return (
    <div className="homepage" style={{ background: '#000000' }}>
      <Header />

      {/* 풀스크린 히어로 섹션 */}
      <HeroSlider />

      {/* 섹션 1 - 지속 가능성 & 임팩트 */}
      <SustainabilitySection />

      {/* 섹션 2 - 신뢰와 투명성 */}
      <TrustSection />

      {/* 섹션 3 - 실시간 몰입 경험 */}
      <AuctionExperienceSection onStartAuction={handleStartAuction} />

      {/* 푸터 */}
      <Footer />
    </div>
  );
}

/**
 * 섹션 1 - 지속 가능성 & 임팩트 🌍
 */
function SustainabilitySection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-6)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 배경 이미지 */}
      <motion.div
        initial={{ scale: 1.2 }}
        animate={isInView ? { scale: 1 } : { scale: 1.2 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/bg/earth_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
          zIndex: 0
        }}
      />
      
      {/* 그라데이션 오버레이 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
        zIndex: 1
      }} />

      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-12)',
          alignItems: 'center'
        }}>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={isInView ? { scale: 1 } : { scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                marginBottom: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
              }}
            >
              <RiEarthFill 
                style={{
                  fontSize: '4rem',
                  color: '#10B981',
                  filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))'
                }}
              />
            </motion.div>
            
            <motion.h2
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1.2',
                marginBottom: 'var(--space-6)',
                fontFamily: 'var(--font-family)'
              }}
            >
              작은 선택이<br />
              <span style={{ color: '#10B981' }}>만드는 큰 변화</span>
            </motion.h2>
            
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{
                fontSize: 'var(--text-xl)',
                color: '#D1D5DB',
                lineHeight: '1.6',
                marginBottom: 'var(--space-8)',
                fontFamily: 'var(--font-family)'
              }}
            >
              폐기물이 아닌, 새로운 가능성으로.<br />
              당신의 참여가 지구의 내일을 바꿉니다.
            </motion.p>

            {/* 임팩트 지표 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-6)'
              }}
            >
              <div style={{
                padding: 'var(--space-4)',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: '#10B981',
                  fontFamily: 'var(--font-family)'
                }}>12.4톤</div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: '#9CA3AF',
                  fontFamily: 'var(--font-family)'
                }}>CO₂ 절약</div>
              </div>
              <div style={{
                padding: 'var(--space-4)',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: '#10B981',
                  fontFamily: 'var(--font-family)'
                }}>2,456</div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: '#9CA3AF',
                  fontFamily: 'var(--font-family)'
                }}>재활용 제품</div>
              </div>
            </motion.div>
          </motion.div>

          {/* 오른쪽 시각적 요소 */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              position: 'relative',
              height: '500px'
            }}
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                top: '20%',
                right: '10%',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
              }}
            >
              <FaRecycle 
                style={{
                  fontSize: '2rem',
                  color: '#ffffff'
                }}
              />
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, 15, 0],
                x: [0, 5, 0]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                bottom: '30%',
                left: '20%',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #34D399, #10B981)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 15px 30px rgba(52, 211, 153, 0.3)'
              }}
            >
              <FaSeedling 
                style={{
                  fontSize: '1.5rem',
                  color: '#ffffff'
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

/**
 * 섹션 2 - 신뢰와 투명성 🤝
 */
function TrustSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        minHeight: '100vh',
        background: '#111111',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-6)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 배경 이미지 */}
      <motion.div
        initial={{ scale: 1.2, x: 100 }}
        animate={isInView ? { scale: 1, x: 0 } : { scale: 1.2, x: 100 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/bg/trust_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: 0
        }}
      />
      
      {/* 그라데이션 오버레이 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(17,17,17,0.9) 0%, rgba(0,0,0,0.6) 100%)',
        zIndex: 1
      }} />

      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-12)',
          alignItems: 'center'
        }}>
          {/* 왼쪽 시각적 요소 */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              position: 'relative',
              height: '500px'
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 20px 40px rgba(59, 130, 246, 0.3)',
                  '0 25px 50px rgba(59, 130, 246, 0.4)',
                  '0 20px 40px rgba(59, 130, 246, 0.3)'
                ]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RiShieldCheckFill 
                style={{
                  fontSize: '2.5rem',
                  color: '#ffffff'
                }}
              />
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, -2, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                bottom: '20%',
                right: '15%',
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
              }}
            >
              <FaCheckCircle 
                style={{
                  fontSize: '2rem',
                  color: '#ffffff'
                }}
              />
            </motion.div>
          </motion.div>

          {/* 오른쪽 텍스트 */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={isInView ? { scale: 1 } : { scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                marginBottom: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
              }}
            >
              <FaHandshake 
                style={{
                  fontSize: '4rem',
                  color: '#3B82F6',
                  filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))'
                }}
              />
            </motion.div>
            
            <motion.h2
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1.2',
                marginBottom: 'var(--space-6)',
                fontFamily: 'var(--font-family)'
              }}
            >
              모두가 안심하는<br />
              <span style={{ color: '#3B82F6' }}>경매 경험</span>
            </motion.h2>
            
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{
                fontSize: 'var(--text-xl)',
                color: '#D1D5DB',
                lineHeight: '1.6',
                marginBottom: 'var(--space-8)',
                fontFamily: 'var(--font-family)'
              }}
            >
              검증된 절차와 안전한 거래 시스템으로,<br />
              언제나 투명하게.
            </motion.p>

            {/* 신뢰 지표 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-6)'
              }}
            >
              <div style={{
                padding: 'var(--space-4)',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: '#3B82F6',
                  fontFamily: 'var(--font-family)'
                }}>99.8%</div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: '#9CA3AF',
                  fontFamily: 'var(--font-family)'
                }}>안전 거래율</div>
              </div>
              <div style={{
                padding: 'var(--space-4)',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: '#3B82F6',
                  fontFamily: 'var(--font-family)'
                }}>24/7</div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: '#9CA3AF',
                  fontFamily: 'var(--font-family)'
                }}>고객 지원</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

/**
 * 섹션 3 - 실시간 몰입 경험 ⚡
 */
function AuctionExperienceSection({ onStartAuction }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-6)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 배경 이미지 */}
      <motion.div
        initial={{ scale: 1.3, rotate: -2 }}
        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 1.3, rotate: -2 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/bg/auction_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5,
          zIndex: 0
        }}
      />
      
      {/* 동적 그라데이션 오버레이 */}
      <motion.div 
        animate={{
          background: [
            'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(251,146,60,0.3) 100%)',
            'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(251,146,60,0.2) 100%)',
            'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(251,146,60,0.3) 100%)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }} 
      />

      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={isInView ? { scale: 1 } : { scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            marginBottom: 'var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <HiLightningBolt 
            style={{
              fontSize: '5rem',
              color: '#FB923C',
              filter: 'drop-shadow(0 4px 12px rgba(251, 146, 60, 0.4))'
            }}
          />
        </motion.div>
        
        <motion.h2
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: '700',
            color: '#ffffff',
            lineHeight: '1.1',
            marginBottom: 'var(--space-6)',
            fontFamily: 'var(--font-family)'
          }}
        >
          지금, 당신의 순간을<br />
          <span style={{ 
            background: 'linear-gradient(135deg, #FB923C, #F97316)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>낙찰하세요</span>
        </motion.h2>
        
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            fontSize: 'var(--text-2xl)',
            color: '#D1D5DB',
            lineHeight: '1.6',
            marginBottom: 'var(--space-10)',
            fontFamily: 'var(--font-family)',
            maxWidth: '800px',
            margin: '0 auto var(--space-10)'
          }}
        >
          실시간으로 치열하게 펼쳐지는 경매 현장.<br />
          한순간도 놓치지 마세요.
        </motion.p>

        {/* CTA 버튼 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <motion.button
            onClick={onStartAuction}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 25px 50px rgba(251, 146, 60, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: 'var(--space-4) var(--space-8)',
              fontSize: 'var(--text-xl)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #FB923C, #F97316)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              fontFamily: 'var(--font-family)',
              boxShadow: '0 20px 40px rgba(251, 146, 60, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              지금 경매 시작하기 →
            </motion.span>
          </motion.button>
        </motion.div>

        {/* 실시간 지표 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-6)',
            marginTop: 'var(--space-12)',
            maxWidth: '800px',
            margin: 'var(--space-12) auto 0'
          }}
        >
          <div style={{
            padding: 'var(--space-4)',
            background: 'rgba(251, 146, 60, 0.1)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <motion.div 
              animate={{ 
                color: ['#FB923C', '#F97316', '#FB923C']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: '700',
                fontFamily: 'var(--font-family)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <RiLiveFill style={{ fontSize: '1.5rem' }} />
              Live
            </motion.div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: '#9CA3AF',
              fontFamily: 'var(--font-family)'
            }}>실시간 경매</div>
          </div>
          <div style={{
            padding: 'var(--space-4)',
            background: 'rgba(251, 146, 60, 0.1)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: '#FB923C',
              fontFamily: 'var(--font-family)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}>
              <FaTachometerAlt style={{ fontSize: '1.2rem' }} />
              156
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: '#9CA3AF',
              fontFamily: 'var(--font-family)'
            }}>온라인 참여자</div>
          </div>
          <div style={{
            padding: 'var(--space-4)',
            background: 'rgba(251, 146, 60, 0.1)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: '700',
                color: '#FB923C',
                fontFamily: 'var(--font-family)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <FaFire style={{ fontSize: '1.2rem' }} />
              23
            </motion.div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: '#9CA3AF',
              fontFamily: 'var(--font-family)'
            }}>진행 중 경매</div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}