package com.spring.project.service;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.spring.project.repository.ProductRepository;
import com.spring.project.service.WalletService;
import com.spring.project.service.ProductService;
import com.spring.project.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private static final String AUCTION_STATE_KEY_PREFIX = "auction:";
    private static final String AUCTION_BIDS_KEY_SUFFIX = ":bids";
    private static final String AUCTION_STATE_KEY_SUFFIX = ":state";
    private static final long SOFT_CLOSE_EXTENSION_MILLIS = 60 * 1000; // 1 minute

    private DefaultRedisScript<List> bidScript;

    @PostConstruct
    public void init() {
        // Lua 스크립트 로드
        bidScript = new DefaultRedisScript<>();
        bidScript.setScriptText(
                "local productId = KEYS[1]\n" +
                        "local userId = ARGV[1]\n" +
                        "local bidAmount = tonumber(ARGV[2])\n" +
                        "local bidTime = ARGV[3]\n" +
                        "local bidUnit = tonumber(ARGV[4])\n" +
                        "local softCloseSeconds = tonumber(ARGV[5])\n" +
                        "local currentTimestamp = tonumber(ARGV[6])\n" +
                        "\n" +
                        "local stateKey = 'auction:' .. productId .. ':state'\n" +
                        "local bidsKey = 'auction:' .. productId .. ':bids'\n" +
                        "\n" +
                        "local currentPrice = tonumber(redis.call('HGET', stateKey, 'currentPrice')) or 0\n" +
                        "local endTime = tonumber(redis.call('HGET', stateKey, 'endTime')) or 0\n" +
                        "local bidCount = tonumber(redis.call('HGET', stateKey, 'bidCount')) or 0\n" +
                        "\n" +
                        "-- 1. 경매 종료 여부 확인\n" +
                        "if currentTimestamp >= endTime then\n" +
                        "    return {'error', 'auction_ended', 0}\n" +
                        "end\n" +
                        "\n" +
                        "-- 2. 최소 입찰 금액 검증 (현재가 + bidUnit)\n" +
                        "if bidAmount < (currentPrice + bidUnit) then\n" +
                        "    return {'error', 'increment', currentPrice}\n" +
                        "end\n" +
                        "\n" +
                        "-- 3. 입찰 처리 (원자적 갱신)\n" +
                        "local newBidCount = bidCount + 1\n" +
                        "redis.call('HSET', stateKey, 'currentPrice', bidAmount, 'bidCount', newBidCount)\n" +
                        "redis.call('LPUSH', bidsKey, userId .. ':' .. bidAmount .. ':' .. bidTime)\n" +
                        "\n" +
                        "-- 4. 소프트 클로즈 (마감 1분 전 입찰 시 1분 연장)\n" +
                        "if (endTime - currentTimestamp) < (softCloseSeconds * 1000) then\n" +
                        "    local newEndTime = currentTimestamp + (softCloseSeconds * 1000)\n" +
                        "    redis.call('HSET', stateKey, 'endTime', newEndTime)\n" +
                        "    endTime = newEndTime\n" +
                        "end\n" +
                        "\n" +
                        "return {'success', bidAmount, newBidCount, endTime}"
        );
        bidScript.setResultType(List.class);
    }

    private static final long MIN_INCREMENT = 1000L; // 최소 인상폭 1,000원
    private static final long SOFT_CLOSE_WINDOW_MS = 60_000L; // 1분 연장

    private String stateKey(String productId) {
        return "auction:" + productId + ":state";
    }

    private String bidsKey(String productId) {
        return "auction:" + productId + ":bids";
    }

    public Map<String, Object> getState(String productId) {
        System.out.println("[AuctionService] getState called for productId: " + productId);
        
        ensureSeed(productId);
        HashOperations<String, Object, Object> ops = redisTemplate.opsForHash();
        Map<Object, Object> m = ops.entries(stateKey(productId));
        Map<String, Object> res = new HashMap<>();
        if (m != null) {
            for (Map.Entry<Object, Object> e : m.entrySet()) {
                res.put(String.valueOf(e.getKey()), e.getValue());
            }
        }
        System.out.println("[AuctionService] Redis data: " + res);
        
        // 경매 종료 감지 및 DB 동기화
        checkAndUpdateAuctionEnd(productId);
        
        Map<String, Object> meta = productRepository.selectAuctionStateByProductId(productId);
        System.out.println("[AuctionService] DB meta data: " + meta);
        
        if (meta != null) {
            Map<String, Object> safe = new HashMap<>();
            for (Map.Entry<String, Object> en : meta.entrySet().stream().collect(java.util.stream.Collectors.toMap(
                    e -> String.valueOf(e.getKey()), Map.Entry::getValue)).entrySet()) {
                String key = en.getKey();
                Object val = en.getValue();
                if ("auctionStart".equals(key) || "auctionEnd".equals(key)) {
                    safe.put(key, toEpochMillis(val));
                } else {
                    safe.put(key, val);
                }
            }
            res.putAll(safe);
        }
        
        // Redis 상태를 DB와 동기화
        syncAuctionStateToDB(productId, res);
        
        System.out.println("[AuctionService] Final result: " + res);
        return res;
    }

    public java.util.List<Map<String, Object>> getRecentBids(String productId, int limit) {
        System.out.println("[AuctionService] getRecentBids called for productId: " + productId + ", limit: " + limit);
        java.util.List<Map<String, Object>> bids = productRepository.selectRecentBidsByProductId(productId, limit);
        System.out.println("[AuctionService] Found " + (bids != null ? bids.size() : 0) + " bids: " + bids);
        return bids;
    }

    public Map<String, Object> updateEndTime(String productId, long epochMillis) {
        HashOperations<String, Object, Object> ops = redisTemplate.opsForHash();
        String key = stateKey(productId);
        ensureSeed(productId);
        ops.put(key, "endTime", String.valueOf(epochMillis));
        Map<Object, Object> m = ops.entries(key);
        Map<String, Object> res = new HashMap<>();
        if (m != null) {
            for (Map.Entry<Object, Object> e : m.entrySet()) {
                res.put(String.valueOf(e.getKey()), e.getValue());
            }
        }
        return res;
    }

    public Map<String, Object> resetState(String productId) {
        // Redis 상태 삭제
        redisTemplate.delete(stateKey(productId));
        redisTemplate.delete(bidsKey(productId));
        // DB에서 다시 로드
        return getState(productId);
    }

    public Map<String, Object> getWinner(String productId) {
        // DB에서 최고 입찰자 조회 (최고가 입찰)
        Map<String, Object> topBid = productRepository.selectTopBidderByProductId(productId);
        
        if (topBid == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("hasWinner", false);
            result.put("message", "입찰자가 없습니다");
            return result;
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("hasWinner", true);
        result.put("winnerId", String.valueOf(topBid.get("userId")));  // String으로 변환
        result.put("winningAmount", topBid.get("bidAmount"));
        result.put("bidTime", topBid.get("bidTime"));
        
        return result;
    }

    public Map<String, Object> placeBid(String productId, String userId, long amount) {
        System.out.println("[AuctionService] placeBid 시작: productId=" + productId + ", userId=" + userId + ", amount=" + amount);
        
        String stateKey = AUCTION_STATE_KEY_PREFIX + productId + AUCTION_STATE_KEY_SUFFIX;
        Map<String, Object> dbAuctionState = productRepository.selectAuctionStateByProductId(productId);

        System.out.println("[AuctionService] DB 경매 상태 조회 결과: " + dbAuctionState);

        if (dbAuctionState == null || dbAuctionState.isEmpty()) {
            System.out.println("[AuctionService] 경매를 찾을 수 없음: " + productId);
            return Collections.singletonMap("error", "auction_not_found");
        }

        // 1. 포인트 잠금 가능 여부 확인
        int userIdInt = Integer.parseInt(userId);
        System.out.println("[AuctionService] 포인트 잠금 가능 여부 확인: userId=" + userIdInt + ", amount=" + amount);
        
        int availableBalance = walletService.getAvailableBalance(userIdInt);
        System.out.println("[AuctionService] 사용 가능한 포인트: " + availableBalance);
        
        if (!walletService.canBid(userIdInt, (int) amount)) {
            System.out.println("[AuctionService] 포인트 부족으로 입찰 불가: availableBalance=" + availableBalance + ", requiredAmount=" + amount);
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "insufficient_balance");
            errorMap.put("ok", false);
            errorMap.put("reason", "insufficient_balance");
            errorMap.put("message", "보유 포인트가 부족합니다.");
            errorMap.put("availableBalance", availableBalance);
            return errorMap;
        }
        
        System.out.println("[AuctionService] 포인트 잠금 가능 확인 완료");

        long bidUnit = ((Number) dbAuctionState.getOrDefault("bidUnit", 1000)).longValue();
        long softCloseSeconds = ((Number) dbAuctionState.getOrDefault("softCloseSeconds", 60)).longValue();

        // 2. 현재 최고 입찰자 확인 (포인트 해제용)
        Map<String, Object> previousTopBid = productRepository.selectTopBidderByProductId(productId);

        List<String> keys = Collections.singletonList(productId);
        Object[] args = {userId, String.valueOf(amount), String.valueOf(System.currentTimeMillis()), String.valueOf(bidUnit), String.valueOf(softCloseSeconds), String.valueOf(System.currentTimeMillis())};

        System.out.println("[AuctionService] Redis Lua 스크립트 실행: keys=" + keys + ", args=" + java.util.Arrays.toString(args));

        List<Object> result = redisTemplate.execute(bidScript, keys, args);
        
        System.out.println("[AuctionService] Redis Lua 스크립트 실행 결과: " + result);

        if (result != null && !result.isEmpty()) {
            String status = String.valueOf(result.get(0));
            if ("error".equals(status)) {
                String reason = String.valueOf(result.get(1));
                
                // 입찰 실패 시 이미 잠긴 포인트가 있다면 해제
                if (previousTopBid != null) {
                    int previousUserId = ((Number) previousTopBid.get("userId")).intValue();
                    if (previousUserId == userIdInt) {
                        try {
                            walletService.unlockPoints(userIdInt, (int) amount);
                            System.out.println("[AuctionService] 입찰 실패로 인한 포인트 잠금 해제: userId=" + userIdInt + ", amount=" + amount);
                        } catch (Exception e) {
                            System.err.println("[AuctionService] 입찰 실패 시 포인트 해제 실패: " + e.getMessage());
                        }
                    }
                }
                
                Map<String, Object> errorMap = new HashMap<>();
                errorMap.put("ok", false);
                errorMap.put("reason", reason);
                if ("increment".equals(reason) && result.size() > 2) {
                    errorMap.put("currentPrice", ((Number)result.get(2)).longValue());
                }
                return errorMap;
            } else if ("success".equals(status)) {
                try {
                    // 3. 이전 최고 입찰자의 포인트 잠금 해제 (있는 경우)
                    if (previousTopBid != null) {
                        int previousUserId = ((Number) previousTopBid.get("userId")).intValue();
                        long previousAmount = ((Number) previousTopBid.get("bidAmount")).longValue();
                        
                        // 이전 입찰자와 현재 입찰자가 다른 경우 또는 같은 사용자가 더 높은 금액으로 입찰하는 경우
                        if (previousUserId != userIdInt || (previousUserId == userIdInt && amount > previousAmount)) {
                            try {
                                walletService.unlockPoints(previousUserId, (int) previousAmount);
                                System.out.println("이전 입찰자 포인트 잠금 해제: userId=" + previousUserId + ", amount=" + previousAmount + 
                                                 (previousUserId == userIdInt ? " (같은 사용자 상향 입찰)" : " (다른 사용자 입찰)"));
                            } catch (Exception e) {
                                System.err.println("이전 입찰자 포인트 해제 실패: " + e.getMessage());
                            }
                        }
                    }

                    // 4. 현재 입찰자의 포인트 잠금
                    try {
                        // 잠금 전 지갑 상태 로깅
                        int beforeLockBalance = walletService.getAvailableBalance(userIdInt);
                        System.out.println("[AuctionService] 포인트 잠금 전 - userId: " + userIdInt + 
                                         ", 사용가능: " + beforeLockBalance + 
                                         ", 잠금예정: " + amount);
                        
                        walletService.lockPoints(userIdInt, (int) amount);
                        
                        // 잠금 후 지갑 상태 로깅
                        int afterLockBalance = walletService.getAvailableBalance(userIdInt);
                        System.out.println("[AuctionService] 포인트 잠금 완료 - userId: " + userIdInt + 
                                         ", 사용가능: " + afterLockBalance + 
                                         ", 잠금완료: " + amount);
                        
                    } catch (Exception e) {
                        System.err.println("포인트 잠금 실패: " + e.getMessage());
                        // 포인트 잠금 실패 시 입찰 롤백 (Redis에서 제거하는 것은 복잡하므로 에러 반환)
                        Map<String, Object> errorMap = new HashMap<>();
                        errorMap.put("error", "point_lock_failed");
                        errorMap.put("ok", false);
                        errorMap.put("reason", "point_lock_failed");
                        errorMap.put("message", "포인트 잠금 처리 중 오류가 발생했습니다.");
                        return errorMap;
                    }

                    // 5. Redis 입찰 성공 시 DB Bids 테이블에도 저장
                    try {
                        productRepository.insertBid(productId, userId, amount);
                    } catch (Exception e) {
                        System.err.println("DB 입찰 저장 실패: " + e.getMessage());
                    }
                    
                    // 6. Redis-DB 동기화: 입찰 후 상태 동기화
                    try {
                        // Redis에서 최신 상태 조회
                        HashOperations<String, Object, Object> ops = redisTemplate.opsForHash();
                        Map<Object, Object> latestState = ops.entries(stateKey(productId));
                        Map<String, Object> stateMap = new HashMap<>();
                        if (latestState != null) {
                            for (Map.Entry<Object, Object> entry : latestState.entrySet()) {
                                stateMap.put(String.valueOf(entry.getKey()), entry.getValue());
                            }
                        }
                        
                        // DB와 동기화
                        syncAuctionStateToDB(productId, stateMap);
                        System.out.println("[AuctionService] 입찰 후 Redis-DB 동기화 완료: " + productId);
                    } catch (Exception e) {
                        System.err.println("[AuctionService] 입찰 후 동기화 실패: " + e.getMessage());
                    }
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", true);
                    response.put("currentPrice", ((Number)result.get(1)).longValue());
                    response.put("bidCount", ((Number)result.get(2)).longValue());
                    response.put("endTime", ((Number)result.get(3)).longValue());
                    return response;
                    
                } catch (Exception e) {
                    System.err.println("입찰 처리 중 오류: " + e.getMessage());
                    Map<String, Object> errorMap = new HashMap<>();
                    errorMap.put("error", "bid_processing_failed");
                    errorMap.put("ok", false);
                    errorMap.put("reason", "bid_processing_failed");
                    errorMap.put("message", "입찰 처리 중 오류가 발생했습니다.");
                    return errorMap;
                }
            }
        }
        return Collections.singletonMap("error", "unknown_error");
    }

    private void ensureSeed(String productId) throws DataAccessException {
        HashOperations<String, Object, Object> ops = redisTemplate.opsForHash();
        String key = stateKey(productId);
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            if (Boolean.TRUE.equals(ops.hasKey(key, "currentPrice")) && Boolean.TRUE.equals(ops.hasKey(key, "endTime"))) {
                return;
            }
        }
        Map<String, Object> db = productRepository.selectAuctionStateByProductId(productId);
        if (db == null || db.isEmpty()) return;
        Object sp = db.get("startPrice");
        Object ae = db.get("auctionEnd");
        long startPrice = toLong(sp);
        long endEpochMs = toEpochMillis(ae);
        Map<String, String> seed = new HashMap<>();
        seed.put("currentPrice", String.valueOf(startPrice));
        seed.put("endTime", String.valueOf(endEpochMs));
        seed.put("bidCount", "0");
        ops.putAll(key, seed);
    }

    private long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number) return ((Number) o).longValue();
        try { return Long.parseLong(String.valueOf(o)); } catch (Exception e) { return 0L; }
    }

    private long toEpochMillis(Object dateTime) {
        if (dateTime == null) return 0L;
        // MyBatis/JDBC 매핑에 따라 java.time.LocalDateTime, java.util.Date 등 가능
        if (dateTime instanceof java.time.LocalDateTime) {
            java.time.LocalDateTime ldt = (java.time.LocalDateTime) dateTime;
            return ldt.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli();
        }
        if (dateTime instanceof java.util.Date) {
            return ((java.util.Date) dateTime).getTime();
        }
        try {
            return Long.parseLong(String.valueOf(dateTime));
        } catch (Exception e) {
            return 0L;
        }
    }

    // Redis-DB 동기화: 경매 상태 업데이트
    private void syncAuctionStateToDB(String productId, Map<String, Object> redisState) {
        try {
            if (redisState == null || redisState.isEmpty()) {
                return;
            }

            // 1. 경매 상태 동기화 (status 컬럼만 존재)
            Object status = redisState.get("status");
            if (status != null) {
                String statusStr = String.valueOf(status);
                if ("ended".equals(statusStr)) {
                    productRepository.updateAuctionStatus(productId, "ended");
                    System.out.println("[AuctionService] DB 경매 상태 업데이트: " + productId + " -> ended");
                }
            }

            // 2. 종료시간 동기화 (auctionEnd 컬럼만 존재, 소프트 클로즈로 변경된 경우)
            Object endTime = redisState.get("endTime");
            if (endTime != null) {
                long time;
                if (endTime instanceof Number) {
                    time = ((Number) endTime).longValue();
                } else {
                    // String인 경우 Long으로 파싱
                    try {
                        time = Long.parseLong(String.valueOf(endTime));
                    } catch (NumberFormatException e) {
                        System.err.println("[AuctionService] endTime 파싱 실패: " + endTime + ", " + e.getMessage());
                        return;
                    }
                }
                time = ((Number) endTime).longValue();
                productRepository.updateAuctionEndTime(productId, time);
                System.out.println("[AuctionService] DB 경매 종료시간 업데이트: " + productId + " -> " + time);
            }

            // 3. currentPrice와 bidCount는 Redis에서만 관리 (DB 컬럼 없음)
            // - currentPrice: Redis에서 실시간 현재가 관리
            // - bidCount: Redis에서 실시간 입찰수 관리

        } catch (Exception e) {
            System.err.println("[AuctionService] Redis-DB 동기화 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 경매 종료 감지 및 DB 상태 업데이트
    private void checkAndUpdateAuctionEnd(String productId) {
        try {
            HashOperations<String, Object, Object> ops = redisTemplate.opsForHash();
            String key = stateKey(productId);
            
            Object endTimeObj = ops.get(key, "endTime");
            if (endTimeObj == null) {
                return;
            }

            long endTime = Long.parseLong(String.valueOf(endTimeObj));
            long currentTime = System.currentTimeMillis();

            if (currentTime >= endTime) {
                // 경매 종료 감지
                System.out.println("[AuctionService] 경매 종료 감지: " + productId);
                
                // Redis 상태를 'ended'로 업데이트
                ops.put(key, "status", "ended");
                
                // DB 상태도 'ended'로 업데이트
                productRepository.updateAuctionStatus(productId, "ended");
                
                System.out.println("[AuctionService] 경매 종료 처리 완료: " + productId + " (Redis + DB 동기화)");
            }
        } catch (Exception e) {
            System.err.println("[AuctionService] 경매 종료 감지 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 낙찰 주문 생성
    public Map<String, Object> createWinnerOrder(String productId, String userId) {
        try {
            // 최고 입찰자 확인
            Map<String, Object> topBid = productRepository.selectTopBidderByProductId(productId);
            if (topBid == null || !String.valueOf(topBid.get("userId")).equals(userId)) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "낙찰자가 아닙니다");
                return result;
            }

            // 판매자 정보 조회
            Integer sellerId = productRepository.selectSellerByProductId(productId);
            if (sellerId == null) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "판매자 정보를 찾을 수 없습니다");
                return result;
            }
            long winningAmount;
            Object bidAmountObj = topBid.get("bidAmount");
            if (bidAmountObj instanceof Number) {
                winningAmount = ((Number) bidAmountObj).longValue();
            } else {
                // String인 경우 Long으로 파싱
                try {
                    winningAmount = Long.parseLong(String.valueOf(bidAmountObj));
                } catch (NumberFormatException e) {
                    System.err.println("[AuctionService] bidAmount 파싱 실패: " + bidAmountObj + ", " + e.getMessage());
                    Map<String, Object> result = new HashMap<>();
                    result.put("success", false);
                    result.put("message", "입찰 금액 정보가 올바르지 않습니다");
                    return result;
                }
            }
            winningAmount = ((Number) topBid.get("bidAmount")).longValue();
            long feeAmount = (long) (winningAmount * 0.05); // 5% 수수료 (임시)

            // 주문 생성
            int orderId = productRepository.insertOrder(
                productId, 
                Integer.parseInt(userId), 
                sellerId, 
                winningAmount, 
                feeAmount
            );

            // 낙찰자의 잠긴 포인트 차감 (구매 완료)
            try {
                int userIdInt = Integer.parseInt(userId);
                walletService.deductPoints(userIdInt, (int) winningAmount);
                System.out.println("낙찰자 포인트 차감 완료: userId=" + userIdInt + ", amount=" + winningAmount);
            } catch (Exception e) {
                System.err.println("낙찰자 포인트 차감 실패: " + e.getMessage());
                // 포인트 차감 실패해도 주문은 이미 생성됨 (추후 수동 처리 필요)
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("orderId", orderId);
            result.put("orderTotal", winningAmount);
            result.put("feeAmount", feeAmount);
            result.put("message", "주문이 생성되었습니다");
            return result;

        } catch (Exception e) {
            System.err.println("주문 생성 실패: " + e.getMessage());
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "주문 생성 중 오류가 발생했습니다");
            return result;
        }
    }

    // 주문 정보 조회 (상품 정보 포함)
    public Map<String, Object> getOrderInfo(int orderId) {
        try {
            Map<String, Object> orderInfo = productRepository.selectOrderWithProductInfo(orderId);
            if (orderInfo == null) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "주문을 찾을 수 없습니다");
                return result;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("order", orderInfo);
            return result;

        } catch (Exception e) {
            System.err.println("주문 정보 조회 실패: " + e.getMessage());
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "주문 정보 조회 중 오류가 발생했습니다");
            return result;
        }
    }

    // productId와 userId로 주문 조회
    public Map<String, Object> getOrderByProductAndUser(String productId, int userId) {
        try {
            Map<String, Object> orderInfo = productRepository.selectOrderByProductAndUser(productId, userId);
            if (orderInfo == null) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "해당 상품에 대한 주문을 찾을 수 없습니다");
                return result;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("order", orderInfo);
            return result;

        } catch (Exception e) {
            System.err.println("주문 조회 실패: " + e.getMessage());
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "주문 조회 중 오류가 발생했습니다");
            return result;
        }
    }

    // 주문 상태 업데이트
    public boolean updateOrderStatus(int orderId, String newStatus) {
        try {
            boolean updated = productRepository.updateOrderStatus(orderId, newStatus);
            if (updated) {
                System.out.println("주문 상태 업데이트 성공: orderId=" + orderId + ", status=" + newStatus);
                return true;
            } else {
                System.err.println("주문 상태 업데이트 실패: 해당 주문을 찾을 수 없습니다. orderId=" + orderId);
                return false;
            }
        } catch (Exception e) {
            System.err.println("주문 상태 업데이트 중 오류: " + e.getMessage());
            return false;
        }
    }

    // 스케줄러: 주기적으로 경매 종료 감지 및 DB 동기화 (1분마다 실행)
    @Scheduled(fixedRate = 60000) // 60초 = 1분
    public void scheduledAuctionEndCheck() {
        try {
            System.out.println("[AuctionService] 스케줄러: 경매 종료 감지 시작");
            
            // Redis에서 모든 경매 키 조회
            Set<String> auctionKeys = redisTemplate.keys("auction:*:state");
            if (auctionKeys == null || auctionKeys.isEmpty()) {
                return;
            }

            for (String key : auctionKeys) {
                try {
                    // productId 추출 (auction:PRODUCT_ID:state 형식)
                    String productId = key.replace("auction:", "").replace(":state", "");
                    
                    // 경매 종료 감지 및 DB 동기화
                    checkAndUpdateAuctionEnd(productId);
                    
                } catch (Exception e) {
                    System.err.println("[AuctionService] 스케줄러 처리 실패 - key: " + key + ", error: " + e.getMessage());
                }
            }
            
            System.out.println("[AuctionService] 스케줄러: 경매 종료 감지 완료");
            
        } catch (Exception e) {
            System.err.println("[AuctionService] 스케줄러 실행 중 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 수동 경매 종료 처리 (관리자용)
    public Map<String, Object> forceEndAuction(String productId) {
        try {
            System.out.println("[AuctionService] 수동 경매 종료 요청: " + productId);
            
            // Redis 상태를 'ended'로 업데이트
            HashOperations<String, Object, Object> ops = redisTemplate.opsForHash();
            String key = stateKey(productId);
            ops.put(key, "status", "ended");
            
            // DB 상태도 'ended'로 업데이트
            boolean dbUpdated = productRepository.updateAuctionStatus(productId, "ended");
            
            Map<String, Object> result = new HashMap<>();
            if (dbUpdated) {
                result.put("success", true);
                result.put("message", "경매가 강제 종료되었습니다.");
                result.put("productId", productId);
                result.put("status", "ended");
                System.out.println("[AuctionService] 수동 경매 종료 완료: " + productId);
            } else {
                result.put("success", false);
                result.put("message", "DB 업데이트에 실패했습니다.");
            }
            
            return result;
            
        } catch (Exception e) {
            System.err.println("[AuctionService] 수동 경매 종료 실패: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "경매 종료 처리 중 오류가 발생했습니다: " + e.getMessage());
            return result;
        }
    }

    /**
     * 경매 상품 목록 조회
     */
    public Map<String, Object> getAuctionList() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // DB에서 경매 상품 정보만 조회 (Redis 제거)
            List<Map<String, Object>> auctionProducts = productService.getAuctionProductsWithDetails();
            
            // LocalDateTime을 String으로 변환하여 JSON 직렬화 오류 방지
            for (Map<String, Object> product : auctionProducts) {
                Object auctionStart = product.get("auctionStart");
                Object auctionEnd = product.get("auctionEnd");
                
                if (auctionStart instanceof java.time.LocalDateTime) {
                    product.put("auctionStart", auctionStart.toString());
                }
                if (auctionEnd instanceof java.time.LocalDateTime) {
                    product.put("auctionEnd", auctionEnd.toString());
                }
            }
            
            result.put("success", true);
            result.put("products", auctionProducts);
            result.put("totalCount", auctionProducts.size());
            
        } catch (Exception e) {
            System.out.println("경매 상품 목록 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("error", "경매 상품 목록을 불러오는데 실패했습니다.");
        }
        
        return result;
    }

    /**
     * 상품 기본 정보 조회
     */
    public Map<String, Object> getProductInfo(String productId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Map<String, Object> productInfo = productService.getProductInfo(productId);
            
            if (productInfo != null) {
                result.put("success", true);
                result.put("product", productInfo);
            } else {
                result.put("success", false);
                result.put("error", "상품을 찾을 수 없습니다.");
            }
            
        } catch (Exception e) {
            System.out.println("상품 기본 정보 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("error", "상품 정보를 불러오는데 실패했습니다.");
        }
        
        return result;
    }
}


