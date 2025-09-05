package com.spring.project.service.impl;

import com.spring.project.service.EmailVerificationService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {
    private final JavaMailSender mailSender;

    @Data
    @AllArgsConstructor
    static class CodeEntry { String code; Instant expiresAt; }
    private final ConcurrentMap<String, CodeEntry> codes = new ConcurrentHashMap<>();

    @Override
    public void sendCode(String email) {
        String code = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
        codes.put(email, new CodeEntry(code, Instant.now().plus(Duration.ofMinutes(3))));

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("[NAFAL] 회원가입 이메일 인증코드");
        msg.setText("인증코드: " + code + "\n유효시간: 3분");
        mailSender.send(msg);
    }

    @Override
    public boolean verifyCode(String email, String code) {
        CodeEntry e = codes.get(email);
        if (e == null || Instant.now().isAfter(e.expiresAt)) return false;
        boolean ok = Objects.equals(e.code, code);
        if (ok) codes.remove(email); // 일회성
        return ok;
    }
}