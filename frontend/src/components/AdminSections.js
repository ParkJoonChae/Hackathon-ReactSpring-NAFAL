import React, { useState } from 'react';
import { 
  FaMoneyBillWave,
  FaChartBar,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';

// 판매 관리 섹션
export function SalesManageSection() {
  const [orders, setOrders] = useState([
    { id: 'ORDER-001', productName: '라운지 패브릭 쇼파', customer: '김나팔', amount: 42000, status: 'processing', type: 'auction', date: '2024-12-16' },
    { id: 'ORDER-002', productName: '커피머신', customer: '이사용자', amount: 14000, status: 'completed', type: 'instant', date: '2024-12-15' },
    { id: 'ORDER-003', productName: '사이드 테이블', customer: '박구매자', amount: 38000, status: 'exchange', type: 'auction', date: '2024-12-14' },
    { id: 'ORDER-004', productName: '대형 러그', customer: '최판매자', amount: 19000, status: 'return', type: 'instant', date: '2024-12-13' }
  ]);

  const getOrderStatus = (status) => {
    const statusMap = {
      'processing': { label: '주문 처리중', color: 'var(--primary)', bg: 'var(--primary-light)' },
      'completed': { label: '주문 완료', color: 'var(--success)', bg: 'var(--success-light)' },
      'exchange': { label: '교환 요청', color: 'var(--warning)', bg: 'var(--warning-light)' },
      'return': { label: '반품 요청', color: 'var(--error)', bg: 'var(--error-light)' }
    };
    return statusMap[status] || statusMap['processing'];
  };

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-6)',
        fontFamily: 'var(--font-family)'
      }}>
        판매 관리
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        {[
          { label: '전체 주문', count: '156', color: 'var(--mint-500)' },
          { label: '처리중', count: '23', color: 'var(--primary)' },
          { label: '교환 요청', count: '5', color: 'var(--warning)' },
          { label: '반품 요청', count: '3', color: 'var(--error)' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            border: '1px solid var(--border-primary)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: stat.color,
              fontFamily: 'var(--font-family)',
              marginBottom: 'var(--space-2)'
            }}>
              {stat.count}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr 2fr',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-primary)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-family)'
        }}>
          <div>주문번호</div>
          <div>상품명</div>
          <div>고객명</div>
          <div>금액</div>
          <div>유형</div>
          <div>상태</div>
          <div>날짜</div>
        </div>
        {orders.map((order) => (
          <div key={order.id} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr 2fr',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--border-primary)',
            alignItems: 'center',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family)'
          }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)' }}>
              {order.id}
            </div>
            <div style={{ color: 'var(--text-primary)' }}>
              {order.productName}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              {order.customer}
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-semibold)' }}>
              ₩{order.amount.toLocaleString()}
            </div>
            <div>
              <span style={{
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                background: order.type === 'auction' ? 'var(--orange-100)' : 'var(--mint-100)',
                color: order.type === 'auction' ? 'var(--orange-700)' : 'var(--mint-700)'
              }}>
                {order.type === 'auction' ? '경매' : '즉시구매'}
              </span>
            </div>
            <div>
              <span style={{
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                background: getOrderStatus(order.status).bg,
                color: getOrderStatus(order.status).color
              }}>
                {getOrderStatus(order.status).label}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              {order.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 정산 관리 섹션
export function SettlementManageSection() {
  const settlementData = [
    { month: '2024-12', totalSales: 2450000, commission: 122500, settlement: 2327500, status: 'pending' },
    { month: '2024-11', totalSales: 1890000, commission: 94500, settlement: 1795500, status: 'completed' },
    { month: '2024-10', totalSales: 3200000, commission: 160000, settlement: 3040000, status: 'completed' }
  ];

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-6)',
        fontFamily: 'var(--font-family)'
      }}>
        정산 관리
      </h2>

      <div style={{
        background: 'linear-gradient(135deg, var(--mint-50), var(--mint-100))',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        border: '1px solid var(--mint-200)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)',
          fontFamily: 'var(--font-family)'
        }}>
          이번 달 정산 현황
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--mint-700)',
              fontFamily: 'var(--font-family)'
            }}>
              ₩{settlementData[0].totalSales.toLocaleString()}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)'
            }}>
              총 매출
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--orange-600)',
              fontFamily: 'var(--font-family)'
            }}>
              ₩{settlementData[0].commission.toLocaleString()}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)'
            }}>
              수수료 (5%)
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--success)',
              fontFamily: 'var(--font-family)'
            }}>
              ₩{settlementData[0].settlement.toLocaleString()}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)'
            }}>
              정산 예정액
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-primary)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-family)'
        }}>
          <div>정산월</div>
          <div>총 매출</div>
          <div>수수료</div>
          <div>정산액</div>
          <div>상태</div>
        </div>
        {settlementData.map((data, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--border-primary)',
            alignItems: 'center',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family)'
          }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)' }}>
              {data.month}
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-semibold)' }}>
              ₩{data.totalSales.toLocaleString()}
            </div>
            <div style={{ color: 'var(--orange-600)' }}>
              ₩{data.commission.toLocaleString()}
            </div>
            <div style={{ color: 'var(--success)', fontWeight: 'var(--weight-semibold)' }}>
              ₩{data.settlement.toLocaleString()}
            </div>
            <div>
              <span style={{
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                background: data.status === 'completed' ? 'var(--success-light)' : 'var(--warning-light)',
                color: data.status === 'completed' ? 'var(--success)' : 'var(--warning)'
              }}>
                {data.status === 'completed' ? '정산완료' : '정산대기'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 고객혜택관리 섹션
export function BenefitManageSection() {
  const [coupons, setCoupons] = useState([
    { id: 1, name: '신규회원 10% 할인', discount: 10, type: 'percent', status: 'active', usage: '156/1000' },
    { id: 2, name: '5만원 이상 무료배송', discount: 0, type: 'shipping', status: 'active', usage: '89/500' },
    { id: 3, name: '첫 구매 20% 할인', discount: 20, type: 'percent', status: 'expired', usage: '234/200' }
  ]);

  const customerGrades = [
    { grade: 'Bronze', minAmount: 0, benefits: ['기본 혜택'], color: 'var(--orange-600)', shadow: 'none' },
    { grade: 'Silver', minAmount: 100000, benefits: ['5% 추가 할인', '무료배송 1회'], color: '#C0C0C0', shadow: 'none' },
    { grade: 'Gold', minAmount: 500000, benefits: ['10% 추가 할인', '무료배송 3회', '우선 고객지원'], color: '#FFD700', shadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
    { grade: 'Platinum', minAmount: 1000000, benefits: ['15% 추가 할인', '무료배송 무제한', '전용 상담사'], color: '#20B2AA', shadow: '0 0 20px rgba(32, 178, 170, 0.4)' }
  ];

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-6)',
        fontFamily: 'var(--font-family)'
      }}>
        고객혜택관리
      </h2>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)',
          fontFamily: 'var(--font-family)'
        }}>
          고객 등급 관리
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          {customerGrades.map((grade, index) => (
            <div key={index} style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              border: '1px solid var(--border-primary)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-bold)',
                color: grade.color,
                marginBottom: 'var(--space-2)',
                fontFamily: 'var(--font-family)',
                textShadow: grade.shadow,
                filter: grade.shadow !== 'none' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
              }}>
                {grade.grade}
              </div>
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-3)',
                fontFamily: 'var(--font-family)'
              }}>
                {grade.minAmount.toLocaleString()}원 이상
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)'
              }}>
                {grade.benefits.map((benefit, i) => (
                  <div key={i} style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    • {benefit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-4)'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: 'var(--font-family)'
          }}>
            쿠폰 관리
          </h3>
          <button className="btn btn--primary">
            + 쿠폰 추가
          </button>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-primary)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
          }}>
            <div>쿠폰명</div>
            <div>할인율</div>
            <div>유형</div>
            <div>사용현황</div>
            <div>상태</div>
          </div>
          {coupons.map((coupon) => (
            <div key={coupon.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--border-primary)',
              alignItems: 'center',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)'
            }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)' }}>
                {coupon.name}
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                {coupon.type === 'percent' ? `${coupon.discount}%` : '무료배송'}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {coupon.type === 'percent' ? '할인' : '배송'}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {coupon.usage}
              </div>
              <div>
                <span style={{
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-medium)',
                  background: coupon.status === 'active' ? 'var(--success-light)' : 'var(--error-light)',
                  color: coupon.status === 'active' ? 'var(--success)' : 'var(--error)'
                }}>
                  {coupon.status === 'active' ? '활성' : '만료'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 통계 섹션
export function StatisticsSection() {
  const monthlyData = [
    { month: '1월', sales: 1200000, orders: 45, visitors: 2340 },
    { month: '2월', sales: 1450000, orders: 52, visitors: 2680 },
    { month: '3월', sales: 1890000, orders: 67, visitors: 3120 },
    { month: '4월', sales: 2100000, orders: 78, visitors: 3560 },
    { month: '5월', sales: 2450000, orders: 89, visitors: 4200 },
    { month: '6월', sales: 2890000, orders: 102, visitors: 4890 }
  ];

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-6)',
        fontFamily: 'var(--font-family)'
      }}>
        통계 분석
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)'
      }}>
        {[
          { label: '총 매출', value: '₩14,980,000', icon: <FaMoneyBillWave />, color: 'var(--success)' },
          { label: '총 주문수', value: '433건', icon: <FaChartBar />, color: 'var(--primary)' },
          { label: '총 방문자', value: '20,790명', icon: <FaUsers />, color: 'var(--mint-500)' },
          { label: '전환율', value: '2.08%', icon: <FaChartLine />, color: 'var(--orange-500)' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            border: '1px solid var(--border-primary)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: 'var(--space-2)'
            }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: stat.color,
              fontFamily: 'var(--font-family)',
              marginBottom: 'var(--space-1)'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)',
          fontFamily: 'var(--font-family)'
        }}>
          월별 성과 분석
        </h3>
        
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 'var(--space-2)',
            textAlign: 'center'
          }}>
            {monthlyData.map((data, index) => (
              <div key={index} style={{
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                background: index === monthlyData.length - 1 ? 'var(--mint-50)' : 'transparent'
              }}>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-family)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {data.month}
                </div>
                <div style={{
                  height: `${(data.sales / 3000000) * 80}px`,
                  background: 'var(--mint-400)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-1)',
                  minHeight: '20px'
                }} />
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--weight-medium)'
                }}>
                  ₩{(data.sales / 1000000).toFixed(1)}M
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-primary)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
          }}>
            <div>월</div>
            <div>매출</div>
            <div>주문수</div>
            <div>방문자</div>
          </div>
          {monthlyData.map((data, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--border-primary)',
              alignItems: 'center',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)'
            }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)' }}>
                {data.month}
              </div>
              <div style={{ color: 'var(--success)', fontWeight: 'var(--weight-semibold)' }}>
                ₩{data.sales.toLocaleString()}
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                {data.orders}건
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {data.visitors.toLocaleString()}명
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 판매자정보 섹션
export function SellerInfoSection() {
  const [managers, setManagers] = useState([
    { id: 1, name: '김매니저', email: 'manager1@nafal.com', department: '상품관리', status: 'active' },
    { id: 2, name: '이운영자', email: 'manager2@nafal.com', department: '고객지원', status: 'active' },
    { id: 3, name: '박담당자', email: 'manager3@nafal.com', department: '마케팅', status: 'inactive' }
  ]);

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-6)',
        fontFamily: 'var(--font-family)'
      }}>
        판매자정보
      </h2>

      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)',
          fontFamily: 'var(--font-family)'
        }}>
          사업자 정보
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-6)'
        }}>
          <div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-1)',
              fontFamily: 'var(--font-family)'
            }}>
              상호명
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--weight-medium)',
              fontFamily: 'var(--font-family)',
              marginBottom: 'var(--space-3)'
            }}>
              (주) NAFAL
            </div>
            
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-1)',
              fontFamily: 'var(--font-family)'
            }}>
              사업자등록번호
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--weight-medium)',
              fontFamily: 'var(--font-family)',
              marginBottom: 'var(--space-3)'
            }}>
              123-45-67890
            </div>
            
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-1)',
              fontFamily: 'var(--font-family)'
            }}>
              대표자명
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--weight-medium)',
              fontFamily: 'var(--font-family)'
            }}>
              홍길동
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-1)',
              fontFamily: 'var(--font-family)'
            }}>
              사업장 주소
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--weight-medium)',
              fontFamily: 'var(--font-family)',
              marginBottom: 'var(--space-3)'
            }}>
              서울시 강남구 테헤란로 123
            </div>
            
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-1)',
              fontFamily: 'var(--font-family)'
            }}>
              연락처
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--weight-medium)',
              fontFamily: 'var(--font-family)',
              marginBottom: 'var(--space-3)'
            }}>
              02-1234-5678
            </div>
            
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-1)',
              fontFamily: 'var(--font-family)'
            }}>
              이메일
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--weight-medium)',
              fontFamily: 'var(--font-family)'
            }}>
              contact@nafal.com
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-4)'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: 'var(--font-family)'
          }}>
            매니저 관리
          </h3>
          <button className="btn btn--primary">
            + 매니저 추가
          </button>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr 1fr auto',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-primary)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
          }}>
            <div>이름</div>
            <div>이메일</div>
            <div>부서</div>
            <div>상태</div>
            <div>작업</div>
          </div>
          {managers.map((manager) => (
            <div key={manager.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr 1fr auto',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--border-primary)',
              alignItems: 'center',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)'
            }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)' }}>
                {manager.name}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {manager.email}
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                {manager.department}
              </div>
              <div>
                <span style={{
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-medium)',
                  background: manager.status === 'active' ? 'var(--success-light)' : 'var(--error-light)',
                  color: manager.status === 'active' ? 'var(--success)' : 'var(--error)'
                }}>
                  {manager.status === 'active' ? '활성' : '비활성'}
                </span>
              </div>
              <div>
                <button
                  className="btn btn--ghost"
                  style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                >
                  수정
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 공지사항 섹션
export function NoticeSection() {
  const [notices, setNotices] = useState([
    { id: 1, title: '12월 정산 일정 안내', content: '12월 정산은 1월 5일에 진행됩니다.', date: '2024-12-16', important: true },
    { id: 2, title: '신규 카테고리 추가 안내', content: '가전제품 카테고리가 새롭게 추가되었습니다.', date: '2024-12-15', important: false },
    { id: 3, title: '연말 수수료 할인 이벤트', content: '12월 한 달간 판매 수수료 50% 할인 진행', date: '2024-12-01', important: true }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', important: false });

  const handleAddNotice = () => {
    if (newNotice.title && newNotice.content) {
      setNotices([{
        id: notices.length + 1,
        ...newNotice,
        date: new Date().toISOString().split('T')[0]
      }, ...notices]);
      setNewNotice({ title: '', content: '', important: false });
      setShowAddForm(false);
      alert('공지사항이 등록되었습니다.');
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-6)'
      }}>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          margin: 0,
          fontFamily: 'var(--font-family)'
        }}>
          공지사항
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn--primary"
        >
          + 공지사항 작성
        </button>
      </div>

      {showAddForm && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
            fontFamily: 'var(--font-family)'
          }}>
            새 공지사항 작성
          </h3>
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
                제목
              </label>
              <input
                type="text"
                value={newNotice.title}
                onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                className="input"
                placeholder="공지사항 제목을 입력하세요"
                style={{ width: '100%' }}
              />
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
                내용
              </label>
              <textarea
                value={newNotice.content}
                onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)',
                  resize: 'vertical'
                }}
                placeholder="공지사항 내용을 입력하세요"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="checkbox"
                checked={newNotice.important}
                onChange={(e) => setNewNotice({...newNotice, important: e.target.checked})}
                id="important"
              />
              <label htmlFor="important" style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)'
              }}>
                중요 공지사항
              </label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button onClick={handleAddNotice} className="btn btn--primary">
                등록
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn btn--ghost">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {notices.map((notice) => (
          <div key={notice.id} style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            border: `1px solid ${notice.important ? 'var(--orange-300)' : 'var(--border-primary)'}`,
            borderLeft: notice.important ? '4px solid var(--orange-500)' : '4px solid var(--border-primary)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 'var(--space-3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {notice.important && (
                  <span style={{
                    padding: 'var(--space-1) var(--space-2)',
                    background: 'var(--orange-100)',
                    color: 'var(--orange-700)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-bold)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    중요
                  </span>
                )}
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-primary)',
                  margin: 0,
                  fontFamily: 'var(--font-family)'
                }}>
                  {notice.title}
                </h3>
              </div>
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-family)'
              }}>
                {notice.date}
              </div>
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              fontFamily: 'var(--font-family)'
            }}>
              {notice.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
