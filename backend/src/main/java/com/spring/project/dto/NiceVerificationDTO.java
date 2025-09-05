package com.spring.project.dto;

import java.time.LocalDateTime;

/**
 * NICE 본인인증 DTO
 */
public class NiceVerificationDTO {
    
    private String requestId;           // 요청 ID
    private String phoneNumber;         // 휴대폰 번호
    private String verificationCode;    // 인증번호
    private String status;              // 상태 (pending, verified, failed)
    private LocalDateTime requestTime;  // 요청 시간
    private LocalDateTime verifyTime;   // 인증 완료 시간
    private String userId;              // 사용자 ID
    private String niceResponse;        // NICE API 응답
    
    // 기본 생성자
    public NiceVerificationDTO() {}
    
    // 생성자
    public NiceVerificationDTO(String phoneNumber, String userId) {
        this.phoneNumber = phoneNumber;
        this.userId = userId;
        this.status = "pending";
        this.requestTime = LocalDateTime.now();
    }
    
    // Getter/Setter
    public String getRequestId() {
        return requestId;
    }
    
    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getVerificationCode() {
        return verificationCode;
    }
    
    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getRequestTime() {
        return requestTime;
    }
    
    public void setRequestTime(LocalDateTime requestTime) {
        this.requestTime = requestTime;
    }
    
    public LocalDateTime getVerifyTime() {
        return verifyTime;
    }
    
    public void setVerifyTime(LocalDateTime verifyTime) {
        this.verifyTime = verifyTime;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getNiceResponse() {
        return niceResponse;
    }
    
    public void setNiceResponse(String niceResponse) {
        this.niceResponse = niceResponse;
    }
    
    @Override
    public String toString() {
        return "NiceVerificationDTO{" +
                "requestId='" + requestId + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", status='" + status + '\'' +
                ", userId='" + userId + '\'' +
                ", requestTime=" + requestTime +
                '}';
    }
}
