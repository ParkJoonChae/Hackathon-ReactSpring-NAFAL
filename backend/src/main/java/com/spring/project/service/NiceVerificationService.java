package com.spring.project.service;

import com.spring.project.dto.NiceVerificationDTO;

/**
 * NICE 본인인증 서비스 인터페이스
 */
public interface NiceVerificationService {
    
    /**
     * 본인인증 요청
     * @param phoneNumber 휴대폰 번호
     * @param userId 사용자 ID
     * @return 본인인증 요청 결과
     */
    NiceVerificationDTO requestVerification(String phoneNumber, String userId);
    
    /**
     * 인증번호 확인
     * @param requestId 요청 ID
     * @param verificationCode 인증번호
     * @return 인증 결과
     */
    boolean verifyCode(String requestId, String verificationCode);
    
    /**
     * 본인인증 상태 확인
     * @param userId 사용자 ID
     * @return 인증 완료 여부
     */
    boolean isVerified(String userId);
    
    /**
     * 본인인증 요청 정보 조회
     * @param requestId 요청 ID
     * @return 본인인증 요청 정보
     */
    NiceVerificationDTO getVerificationRequest(String requestId);
}
