package com.spring.project.controller;

import com.spring.project.dto.NiceVerificationDTO;
import com.spring.project.service.NiceVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

/**
 * NICE 본인인증 컨트롤러
 */
@RestController
@RequestMapping("/api/user/nice-verification")
public class NiceVerificationController {
    
    @Autowired
    private NiceVerificationService niceVerificationService;
    
    /**
     * 본인인증 요청
     * POST /api/user/nice-verification/request
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> requestVerification(
            @RequestBody Map<String, String> request,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 세션에서 사용자 ID 확인
            Object userSession = session.getAttribute("userSession");
            if (userSession == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            String phoneNumber = request.get("phoneNumber");
            String userId = request.get("userId");
            
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "휴대폰 번호를 입력해주세요.");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (userId == null || userId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 본인인증 요청
            NiceVerificationDTO verification = niceVerificationService.requestVerification(phoneNumber, userId);
            
            if ("pending".equals(verification.getStatus())) {
                response.put("success", true);
                response.put("message", "인증번호가 발송되었습니다.");
                response.put("requestId", verification.getRequestId());
                response.put("phoneNumber", verification.getPhoneNumber());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "본인인증 요청에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "본인인증 요청 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 인증번호 확인
     * POST /api/user/nice-verification/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyCode(
            @RequestBody Map<String, String> request,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 세션에서 사용자 ID 확인
            Object userSession = session.getAttribute("userSession");
            if (userSession == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            String requestId = request.get("requestId");
            String verificationCode = request.get("verificationCode");
            
            if (requestId == null || requestId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "요청 ID가 필요합니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (verificationCode == null || verificationCode.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "인증번호를 입력해주세요.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 인증번호 확인
            boolean isVerified = niceVerificationService.verifyCode(requestId, verificationCode);
            
            if (isVerified) {
                response.put("success", true);
                response.put("message", "본인인증이 완료되었습니다.");
                response.put("verified", true);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "인증번호가 올바르지 않습니다.");
                response.put("verified", false);
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "인증번호 확인 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 본인인증 상태 확인
     * GET /api/user/nice-verification/status/{userId}
     */
    @GetMapping("/status/{userId}")
    public ResponseEntity<Map<String, Object>> checkVerificationStatus(@PathVariable String userId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isVerified = niceVerificationService.isVerified(userId);
            
            response.put("success", true);
            response.put("verified", isVerified);
            response.put("message", isVerified ? "본인인증이 완료되었습니다." : "본인인증이 필요합니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "본인인증 상태 확인 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 본인인증 요청 정보 조회
     * GET /api/user/nice-verification/request/{requestId}
     */
    @GetMapping("/request/{requestId}")
    public ResponseEntity<Map<String, Object>> getVerificationRequest(@PathVariable String requestId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            NiceVerificationDTO verification = niceVerificationService.getVerificationRequest(requestId);
            
            if (verification != null) {
                response.put("success", true);
                response.put("verification", verification);
            } else {
                response.put("success", false);
                response.put("message", "본인인증 요청을 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "본인인증 요청 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
