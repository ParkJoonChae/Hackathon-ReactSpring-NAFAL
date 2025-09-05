-- NAFAL 더미 데이터 생성 스크립트

-- 1. NAFAL-0003 상품 데이터 (진행중 경매)
INSERT INTO Products (
    productId, sellerId, title, description, categoryId, 
    co2EffectKg, effectDesc, sizeInfo, history, registerDate, 
    brand, product_status, ori_price, instantPrice, meterial, 
    tag, eventName, deliveryType, deliveryPrice, deliveryOpt
) VALUES (
    'NAFAL-0003', 
    1, -- sellerId (NAFAL 사용자)
    '빈티지 원목 다이닝 테이블', 
    '50년대 원목으로 제작된 클래식 다이닝 테이블입니다. 세월의 흔적이 느껴지는 아름다운 빈티지 가구입니다.',
    1, -- 가구/테이블 카테고리
    15.5, 
    '새 가구 구매 대신 재사용으로 CO2 15.5kg 절약',
    '가로 150cm x 세로 80cm x 높이 75cm (±2cm 오차)',
    '1970년대 제작, 한 가정에서 50년간 사용, 2024년 리퍼비시 완료',
    NOW(),
    'NAFAL',
    'A', -- 상태 A급
    800000, -- 원가
    450000, -- 즉시구매가
    '원목',
    '빈티지,다이닝테이블,원목,클래식',
    '빈티지 가구 특별전',
    '화물배송',
    30000,
    '문 앞 배송, 조립 서비스 별도'
);

-- 2. NAFAL-0003 경매 정보 (진행중)
INSERT INTO Auctions (
    productId, instantPrice, minimunPrice, startPrice, 
    auctionStart, auctionEnd, status, softCloseSeconds
) VALUES (
    'NAFAL-0003',
    450000, -- 즉시구매가
    5000,    -- 입장료
    50000,   -- 시작가
    '2025-01-15 10:00:00',  -- 경매 시작 (과거)
    '2025-08-23 23:59:00',  -- 경매 종료 (미래)
    'ongoing',              -- 진행중
    60                      -- 소프트클로즈 60초
);

-- 3. NAFAL-0002 상품 데이터 (종료된 경매)
INSERT INTO Products (
    productId, sellerId, title, description, categoryId, 
    co2EffectKg, effectDesc, sizeInfo, history, registerDate, 
    brand, product_status, ori_price, instantPrice, meterial, 
    tag, eventName, deliveryType, deliveryPrice, deliveryOpt
) VALUES (
    'NAFAL-0002', 
    1, -- sellerId (NAFAL 사용자)
    '북유럽 스타일 소파', 
    '덴마크 브랜드의 고급 패브릭 소파입니다. 편안한 쿠션과 세련된 디자인이 특징입니다.',
    1, -- 가구 카테고리
    25.0, 
    '새 소파 구매 대신 재사용으로 CO2 25kg 절약',
    '가로 200cm x 세로 90cm x 높이 80cm',
    '2020년 구매, 반려동물 없는 가정에서 사용, 전문 클리닝 완료',
    NOW(),
    'NAFAL',
    'S', -- 상태 S급 (최상급)
    1200000, -- 원가
    680000,  -- 즉시구매가
    '패브릭',
    '북유럽,소파,패브릭,모던',
    '겨울 특가 이벤트',
    '화물배송',
    50000,
    '방 안 설치까지 포함'
);

-- 4. NAFAL-0002 경매 정보 (종료됨)
INSERT INTO Auctions (
    productId, instantPrice, minimunPrice, startPrice, 
    auctionStart, auctionEnd, status, softCloseSeconds
) VALUES (
    'NAFAL-0002',
    680000, -- 즉시구매가
    10000,  -- 입장료
    100000, -- 시작가
    '2025-01-10 14:00:00',  -- 경매 시작
    '2025-01-15 18:00:00',  -- 경매 종료 (과거)
    'ended',                -- 종료됨
    60                      -- 소프트클로즈 60초
);

-- 5. NAFAL-0002 입찰 내역 (3개, userId 1이 최고가)
INSERT INTO Bids (productId, userId, bidAmount, bidTime, isAutoBid) VALUES
('NAFAL-0002', 2, 150000, '2025-01-12 10:30:00', false),  -- 첫 번째 입찰
('NAFAL-0002', 3, 200000, '2025-01-13 15:45:00', false),  -- 두 번째 입찰
('NAFAL-0002', 1, 250000, '2025-01-15 17:30:00', false);  -- 최고 입찰 (userId 1)

-- 6. 추가로 NAFAL-0003에도 몇 개 입찰 내역 추가 (진행중 경매)
INSERT INTO Bids (productId, userId, bidAmount, bidTime, isAutoBid) VALUES
('NAFAL-0003', 2, 80000, '2025-01-16 09:00:00', false),   -- 첫 번째 입찰
('NAFAL-0003', 3, 120000, '2025-01-16 14:20:00', false),  -- 두 번째 입찰
('NAFAL-0003', 1, 150000, '2025-01-16 16:45:00', false);  -- 현재 최고가 (userId 1)

-- 확인용 쿼리들
SELECT '=== NAFAL-0003 상품 정보 (진행중 경매) ===' as '';
SELECT p.productId, p.title, p.instantPrice as productInstantPrice, 
       a.instantPrice as auctionInstantPrice, a.startPrice, a.minimunPrice,
       a.auctionStart, a.auctionEnd, a.status
FROM Products p 
JOIN Auctions a ON p.productId = a.productId 
WHERE p.productId = 'NAFAL-0003';

SELECT '=== NAFAL-0002 상품 정보 (종료된 경매) ===' as '';
SELECT p.productId, p.title, p.instantPrice as productInstantPrice, 
       a.instantPrice as auctionInstantPrice, a.startPrice, a.minimunPrice,
       a.auctionStart, a.auctionEnd, a.status
FROM Products p 
JOIN Auctions a ON p.productId = a.productId 
WHERE p.productId = 'NAFAL-0002';

SELECT '=== NAFAL-0002 입찰 내역 ===' as '';
SELECT bidId, productId, userId, bidAmount, bidTime, isAutoBid 
FROM Bids 
WHERE productId = 'NAFAL-0002' 
ORDER BY bidAmount DESC;

SELECT '=== NAFAL-0003 입찰 내역 ===' as '';
SELECT bidId, productId, userId, bidAmount, bidTime, isAutoBid 
FROM Bids 
WHERE productId = 'NAFAL-0003' 
ORDER BY bidAmount DESC;
