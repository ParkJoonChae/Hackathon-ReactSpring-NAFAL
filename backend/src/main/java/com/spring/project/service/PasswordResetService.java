package com.spring.project.service;

public interface PasswordResetService {
    void sendResetCodeByEmail(String name, String username); // ← phone 제거
    String verifyCode(String username, String code);
    boolean resetPassword(String username, String newPassword, String resetToken);
}