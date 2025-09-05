package com.spring.project.controller;

import java.util.HashMap;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

import com.spring.project.service.AuctionService;

@RestController
@RequestMapping("/api/auction")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AuctionController {

    private final AuctionService auctionService;

    @GetMapping("/{productId}/state")
    public ResponseEntity<Map<String, Object>> getState(@PathVariable String productId) {
        System.out.println("[AuctionController] GET /state productId=" + productId);
        Map<String, Object> state = auctionService.getState(productId);
        return ResponseEntity.ok(state);
    }

    @GetMapping("/{productId}/bids")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getBids(
            @PathVariable String productId,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        System.out.println("[AuctionController] GET /bids productId=" + productId + ", limit=" + limit);
        return ResponseEntity.ok(auctionService.getRecentBids(productId, limit));
    }

    @PostMapping("/{productId}/bid")
    public ResponseEntity<Map<String, Object>> bid(@PathVariable String productId, @RequestBody Map<String, Object> payload) {
        System.out.println("[AuctionController] POST /bid productId=" + productId + ", payload=" + payload);
        long amount = Long.parseLong(String.valueOf(payload.getOrDefault("amount", 0)));
        String userId = String.valueOf(payload.getOrDefault("userId", "0"));
        Map<String, Object> res = auctionService.placeBid(productId, userId, amount);
        if (Boolean.TRUE.equals(res.get("ok"))) {
            return ResponseEntity.ok(res);
        }
        Map<String, Object> body = new HashMap<>();
        body.put("error", res.getOrDefault("reason", "bad_request"));
        body.putAll(res);
        return ResponseEntity.badRequest().body(body);
    }

    // 관리(또는 임시 조정)용: 경매 종료시각을 epochMillis로 업데이트
    @PostMapping("/{productId}/end-time")
    public ResponseEntity<Map<String, Object>> updateEndTime(@PathVariable String productId, @RequestBody Map<String, Object> payload) {
        long epochMillis = Long.parseLong(String.valueOf(payload.getOrDefault("endTime", 0)));
        System.out.println("[AuctionController] POST /end-time productId=" + productId + ", endTime=" + epochMillis);
        Map<String, Object> state = auctionService.updateEndTime(productId, epochMillis);
        return ResponseEntity.ok(state);
    }

    // Redis 상태 초기화 (DB에서 다시 로드)
    @PostMapping("/{productId}/reset")
    public ResponseEntity<Map<String, Object>> resetState(@PathVariable String productId) {
        System.out.println("[AuctionController] POST /reset productId=" + productId);
        Map<String, Object> state = auctionService.resetState(productId);
        return ResponseEntity.ok(state);
    }

    // 경매 최고 입찰자 조회
    @GetMapping("/{productId}/winner")
    public ResponseEntity<Map<String, Object>> getWinner(@PathVariable String productId) {
        System.out.println("[AuctionController] GET /winner productId=" + productId);
        Map<String, Object> winner = auctionService.getWinner(productId);
        return ResponseEntity.ok(winner);
    }

    // 수동 경매 종료 (관리자용)
    @PostMapping("/{productId}/force-end")
    public ResponseEntity<Map<String, Object>> forceEndAuction(@PathVariable String productId) {
        System.out.println("[AuctionController] POST /force-end productId=" + productId);
        Map<String, Object> result = auctionService.forceEndAuction(productId);
        
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // 낙찰 주문 생성
    @PostMapping("/{productId}/create-order")
    public ResponseEntity<Map<String, Object>> createWinnerOrder(@PathVariable String productId, @RequestBody Map<String, Object> payload) {
        System.out.println("[AuctionController] POST /create-order productId=" + productId + ", payload=" + payload);
        String userId = String.valueOf(payload.getOrDefault("userId", ""));
        Map<String, Object> result = auctionService.createWinnerOrder(productId, userId);
        
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // 경매 상품 목록 조회
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAuctionList() {
        System.out.println("[AuctionController] GET /list - 경매 상품 목록 조회");
        try {
            Map<String, Object> result = auctionService.getAuctionList();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("경매 상품 목록 조회 오류: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "경매 상품 목록을 불러오는데 실패했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // 상품 기본 정보 조회
    @GetMapping("/product/{productId}")
    public ResponseEntity<Map<String, Object>> getProductInfo(@PathVariable String productId) {
        System.out.println("[AuctionController] GET /product/" + productId + " - 상품 기본 정보 조회");
        try {
            Map<String, Object> result = auctionService.getProductInfo(productId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("상품 기본 정보 조회 오류: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "상품 정보를 불러오는데 실패했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

}


