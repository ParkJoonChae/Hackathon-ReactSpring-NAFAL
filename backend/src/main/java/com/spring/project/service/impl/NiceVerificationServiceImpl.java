package com.spring.project.service.impl;

import com.spring.project.dto.NiceVerificationDTO;
import com.spring.project.service.NiceVerificationService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

/**
 * NICE 본인인증 서비스 구현체
 */
@Service
public class NiceVerificationServiceImpl implements NiceVerificationService {
    
    // NICE 테스트 환경 설정
    private static final String NICE_TEST_API_URL = "https://svc.niceapi.co.kr:22001";
    private static final String NICE_CLIENT_ID = "test_client_id"; // 테스트용
    private static final String NICE_CLIENT_SECRET = "test_client_secret"; // 테스트용
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    // 메모리에 임시 저장 (실제로는 Redis나 DB 사용)
    private final Map<String, NiceVerificationDTO> verificationRequests = new ConcurrentHashMap<>();
    
    public NiceVerificationServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public NiceVerificationDTO requestVerification(String phoneNumber, String userId) {
        try {
            // 요청 ID 생성
            String requestId = UUID.randomUUID().toString();
            
            // 본인인증 요청 객체 생성
            NiceVerificationDTO verification = new NiceVerificationDTO(phoneNumber, userId);
            verification.setRequestId(requestId);
            
            // NICE API 호출 (테스트 환경)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("phoneNumber", phoneNumber);
            requestBody.put("clientId", NICE_CLIENT_ID);
            requestBody.put("requestId", requestId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + NICE_CLIENT_ID);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // NICE API 호출 시뮬레이션 (테스트용)
            // 실제 운영 시에는 아래 주석 해제
            /*
            ResponseEntity<String> response = restTemplate.exchange(
                NICE_TEST_API_URL + "/demand/request",
                HttpMethod.POST,
                request,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                verification.setNiceResponse(response.getBody());
                verification.setStatus("pending");
            } else {
                verification.setStatus("failed");
            }
            */
            
            // 테스트용: 성공 응답 시뮬레이션
            verification.setNiceResponse("{\"success\": true, \"message\": \"인증번호 발송 성공\"}");
            verification.setStatus("pending");
            
            // 메모리에 저장
            verificationRequests.put(requestId, verification);
            
            return verification;
            
        } catch (Exception e) {
            NiceVerificationDTO errorVerification = new NiceVerificationDTO(phoneNumber, userId);
            errorVerification.setStatus("failed");
            errorVerification.setNiceResponse("{\"success\": false, \"message\": \"" + e.getMessage() + "\"}");
            return errorVerification;
        }
    }
    
    @Override
    public boolean verifyCode(String requestId, String verificationCode) {
        try {
            NiceVerificationDTO verification = verificationRequests.get(requestId);
            if (verification == null) {
                return false;
            }
            
            // NICE API 호출 (테스트 환경)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("requestId", requestId);
            requestBody.put("verificationCode", verificationCode);
            requestBody.put("clientId", NICE_CLIENT_ID);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + NICE_CLIENT_ID);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // NICE API 호출 시뮬레이션 (테스트용)
            // 실제 운영 시에는 아래 주석 해제
            /*
            ResponseEntity<String> response = restTemplate.exchange(
                NICE_TEST_API_URL + "/demand/verify",
                HttpMethod.POST,
                request,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                verification.setStatus("verified");
                verification.setVerifyTime(LocalDateTime.now());
                verification.setNiceResponse(response.getBody());
                return true;
            } else {
                verification.setStatus("failed");
                verification.setNiceResponse(response.getBody());
                return false;
            }
            */
            
            // 테스트용: 인증번호 123456으로 성공 시뮬레이션
            if ("123456".equals(verificationCode)) {
                verification.setStatus("verified");
                verification.setVerifyTime(LocalDateTime.now());
                verification.setNiceResponse("{\"success\": true, \"message\": \"인증 성공\"}");
                return true;
            } else {
                verification.setStatus("failed");
                verification.setNiceResponse("{\"success\": false, \"message\": \"인증번호 불일치\"}");
                return false;
            }
            
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public boolean isVerified(String userId) {
        return verificationRequests.values().stream()
                .anyMatch(v -> v.getUserId().equals(userId) && "verified".equals(v.getStatus()));
    }
    
    @Override
    public NiceVerificationDTO getVerificationRequest(String requestId) {
        return verificationRequests.get(requestId);
    }
}
