package com.spring.project.controller;

import java.util.HashMap;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

import com.spring.project.service.AuctionService;
import com.spring.project.service.WalletService;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class OrderController {

    private final AuctionService auctionService;
    private final WalletService walletService;

    // 주문 정보 조회 (상품 정보 포함)
    @GetMapping("/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrderInfo(@PathVariable int orderId) {
        System.out.println("[OrderController] GET /order/" + orderId);
        Map<String, Object> result = auctionService.getOrderInfo(orderId);
        
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // productId와 userId로 주문 조회
    @GetMapping("/by-product/{productId}/user/{userId}")
    public ResponseEntity<Map<String, Object>> getOrderByProductAndUser(
            @PathVariable String productId, 
            @PathVariable int userId) {
        
        System.out.println("[OrderController] GET /order/by-product/" + productId + "/user/" + userId);
        Map<String, Object> result = auctionService.getOrderByProductAndUser(productId, userId);
        
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * 결제 완료 처리
     * @param orderId 주문 ID
     * @param paymentData 결제 정보 (userId, totalAmount, usePoints, paymentMethod)
     * @return 결제 처리 결과
     */
    @PostMapping("/{orderId}/complete-payment")
    public ResponseEntity<Map<String, Object>> completePayment(
            @PathVariable int orderId,
            @RequestBody Map<String, Object> paymentData) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("[OrderController] POST /order/" + orderId + "/complete-payment");
            System.out.println("결제 데이터: " + paymentData);
            
            // 1. 요청 데이터 검증
            Integer userId = (Integer) paymentData.get("userId");
            Integer totalAmount = (Integer) paymentData.get("totalAmount");
            Integer usePoints = (Integer) paymentData.get("usePoints");
            String paymentMethod = (String) paymentData.get("paymentMethod");
            
            if (userId == null || totalAmount == null || usePoints == null) {
                response.put("success", false);
                response.put("message", "필수 결제 정보가 누락되었습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 2. 주문 정보 확인
            Map<String, Object> orderResult = auctionService.getOrderInfo(orderId);
            if (!Boolean.TRUE.equals(orderResult.get("success"))) {
                response.put("success", false);
                response.put("message", "주문 정보를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> order = (Map<String, Object>) orderResult.get("order");
            Integer buyerId = (Integer) order.get("buyerId");
            
            // 주문의 구매자와 결제 요청자가 일치하는지 확인
            if (!userId.equals(buyerId)) {
                response.put("success", false);
                response.put("message", "결제 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            // 3. 사용자 포인트 확인 및 차감
            if (usePoints > 0) {
                // 사용 가능한 포인트 확인
                int availableBalance = walletService.getAvailableBalance(userId);
                if (availableBalance < usePoints) {
                    response.put("success", false);
                    response.put("message", "사용 가능한 포인트가 부족합니다.");
                    response.put("availableBalance", availableBalance);
                    response.put("requestedPoints", usePoints);
                    return ResponseEntity.badRequest().body(response);
                }
                
                // 포인트 차감 (일반 결제 - 보유 포인트에서 직접 차감)
                boolean deductSuccess = walletService.deductBalance(userId, usePoints);
                if (!deductSuccess) {
                    response.put("success", false);
                    response.put("message", "포인트 차감에 실패했습니다.");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                }
                
                System.out.println("포인트 차감 완료: userId=" + userId + ", amount=" + usePoints);
            }
            
            // 4. 주문 상태 업데이트 (pending → paid)
            boolean statusUpdateSuccess = auctionService.updateOrderStatus(orderId, "paid");
            if (!statusUpdateSuccess) {
                response.put("success", false);
                response.put("message", "주문 상태 업데이트에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
            System.out.println("주문 상태 업데이트 완료: orderId=" + orderId + " → paid");
            
            // 5. 성공 응답
            response.put("success", true);
            response.put("message", "결제가 완료되었습니다.");
            response.put("orderId", orderId);
            response.put("totalAmount", totalAmount);
            response.put("usePoints", usePoints);
            response.put("paymentMethod", paymentMethod);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("결제 처리 중 오류: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("message", "결제 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 주문 상태 업데이트
     * @param orderId 주문 ID
     * @param statusData 상태 변경 정보 {status, userId}
     * @return 업데이트 결과
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable int orderId,
            @RequestBody Map<String, Object> statusData) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("[OrderController] PATCH /order/" + orderId + "/status");
            System.out.println("상태 변경 데이터: " + statusData);
            
            String newStatus = (String) statusData.get("status");
            Integer userId = (Integer) statusData.get("userId");
            
            if (newStatus == null) {
                response.put("success", false);
                response.put("message", "변경할 상태가 지정되지 않았습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 상태 값 검증
            String[] validStatuses = {"pending", "paid", "canceled", "shipped", "delivered", "completed"};
            boolean isValidStatus = false;
            for (String status : validStatuses) {
                if (status.equals(newStatus)) {
                    isValidStatus = true;
                    break;
                }
            }
            
            if (!isValidStatus) {
                response.put("success", false);
                response.put("message", "유효하지 않은 상태값입니다: " + newStatus);
                return ResponseEntity.badRequest().body(response);
            }
            
            // 주문 상태 업데이트
            boolean updateSuccess = auctionService.updateOrderStatus(orderId, newStatus);
            if (updateSuccess) {
                response.put("success", true);
                response.put("message", "주문 상태가 업데이트되었습니다.");
                response.put("orderId", orderId);
                response.put("newStatus", newStatus);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "주문 상태 업데이트에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("주문 상태 업데이트 중 오류: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("message", "주문 상태 업데이트 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
