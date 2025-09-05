package com.spring.project.service;


/* 회원가입 이메일 인증 */
public interface EmailVerificationService {
    void sendCode(String email);
    boolean verifyCode(String email, String code);
}
