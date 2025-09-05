import React from 'react';
import { 
  FaLaptopCode,
  FaRocket,
  FaSeedling
} from 'react-icons/fa';

/**
 * Footer - NAFAL 웹사이트 공통 푸터
 * 회사 정보, 개발팀 정보, 저작권 정보 포함
 */
export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-primary)',
      padding: 'var(--space-12) 0 var(--space-8)',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)'
        }}>
          {/* 회사 정보 */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)'
            }}>
              <img 
                src="/logo.png" 
                alt="NAFAL" 
                style={{
                  width: '32px',
                  height: '32px'
                }}
              />
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                margin: 0,
                fontFamily: 'var(--font-family)'
              }}>
                NAFAL
              </h3>
            </div>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              margin: 0,
              fontFamily: 'var(--font-family)'
            }}>
              폐기물 경매 플랫폼을 통해<br />
              지속가능한 가치를 재발견하고<br />
              환경 보호에 기여합니다.
            </p>
          </div>

          {/* 개발팀 정보 */}
          <div>
            <h4 style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-family)'
            }}>
              개발팀
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-3)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--mint-400), var(--mint-300))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--mint-900)'
              }}>
                <FaLaptopCode style={{ color: 'var(--mint-900)' }} />
              </div>
              <div>
                <div style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  forallfor
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  개발 & 기술 파트너
                </div>
              </div>
            </div>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              margin: 0,
              fontFamily: 'var(--font-family)'
            }}>
              웹 개발, 백엔드 시스템,<br />
              인프라 구축을 담당합니다.
            </p>
          </div>

          {/* 기획팀 정보 */}
          <div>
            <h4 style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-family)'
            }}>
              기획 & 창업팀
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-3)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--orange-400), var(--orange-300))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--orange-900)'
              }}>
                <FaRocket style={{ color: 'var(--orange-900)' }} />
              </div>
              <div>
                <div style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Rounder
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  기획 & 창업 파트너
                </div>
              </div>
            </div>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              margin: 0,
              fontFamily: 'var(--font-family)'
            }}>
              비즈니스 모델, 사업 기획,<br />
              창업 전략을 담당합니다.
            </p>
          </div>

          {/* 연락처 & 링크 */}
          <div>
            <h4 style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-family)'
            }}>
              서비스 정보
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <a 
                href="/auction" 
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-family)',
                  transition: 'color var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                실시간 경매
              </a>
              <a 
                href="/mypage" 
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-family)',
                  transition: 'color var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                마이페이지
              </a>
              <a 
                href="/purchase" 
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-family)',
                  transition: 'color var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                포인트 충전
              </a>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div style={{
          borderTop: '1px solid var(--border-primary)',
          paddingTop: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}>
          {/* 저작권 정보 */}
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-family)'
          }}>
            © 2025 NAFAL. All rights reserved.
          </div>

          {/* 환경 효과 아이콘 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--mint-50)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--mint-200)'
          }}>
            <span style={{ fontSize: 'var(--text-sm)' }}><FaSeedling style={{ color: 'var(--mint-600)' }} /></span>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--mint-700)',
              fontWeight: 'var(--weight-medium)',
              fontFamily: 'var(--font-family)'
            }}>
              지속가능한 미래를 만들어갑니다
            </span>
          </div>
        </div>

        {/* 추가 법적 정보 */}
        <div style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-4)',
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)'
        }}>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            lineHeight: 'var(--leading-relaxed)',
            fontFamily: 'var(--font-family)'
          }}>
            NAFAL은 팝업스토어 폐기물의 가치 재창조를 통해 환경 보호와 순환 경제에 기여하는 경매 플랫폼입니다. 
            모든 상품은 엄격한 품질 검수를 거쳐 등록되며, 안전하고 투명한 거래를 보장합니다. 
            서비스 이용 중 문의사항이 있으시면 고객센터로 연락해 주세요.
            <br /><br />
            사업자등록번호: 000-00-00000 | 통신판매업신고번호: 제2025-서울강남-0000호 | 
            대표자: NAFAL Team | 주소: 서울특별시 강남구 테헤란로 123
          </div>
        </div>
      </div>
    </footer>
  );
}
