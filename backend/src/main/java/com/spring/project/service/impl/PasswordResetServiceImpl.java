package com.spring.project.service.impl;

import com.spring.project.repository.UserRepository;
import com.spring.project.service.PasswordResetService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Data
    @AllArgsConstructor
    static class CodeEntry {
        String code;
        Instant expiresAt;
        int attempts;
        boolean used;
    }

    // username -> CodeEntry
    private final ConcurrentMap<String, CodeEntry> codes = new ConcurrentHashMap<>();
    // username -> resetToken
    private final ConcurrentMap<String, String> tokens = new ConcurrentHashMap<>();

    /** ✅ 이름+이메일만 확인해서 코드 전송 */
    @Override
    public void sendResetCodeByEmail(String name, String username) {
        // 이름+이메일 존재 확인 (전화번호 사용 안 함)
        if (!userRepository.existsByUsernameAndName(username, name)) {
            throw new IllegalArgumentException("입력하신 이름 또는 이메일이 일치하지 않습니다.");
        }

        String code = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
        Instant exp = Instant.now().plus(Duration.ofMinutes(3));

        codes.put(username, new CodeEntry(code, exp, 0, false));

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(username);
        msg.setSubject("[NAFAL] 비밀번호 재설정 인증코드");
        msg.setText("인증코드: " + code + "\n유효시간: 3분");
        mailSender.send(msg);
    }

    @Override
    public String verifyCode(String username, String code) {
        CodeEntry e = codes.get(username);
        if (e == null) throw new IllegalArgumentException("인증코드를 먼저 요청해주세요.");
        if (e.used) throw new IllegalStateException("이미 사용된 코드입니다.");
        if (Instant.now().isAfter(e.expiresAt)) throw new IllegalStateException("코드 유효시간이 만료되었습니다.");

        if (!Objects.equals(e.code, code)) {
            e.attempts++;
            throw new IllegalArgumentException("인증코드가 올바르지 않습니다.");
        }

        e.used = true;
        String resetToken = UUID.randomUUID().toString();
        tokens.put(username, resetToken);
        return resetToken;
    }

    @Override
    public boolean resetPassword(String username, String newPassword, String resetToken) {
        String issued = tokens.get(username);
        if (issued == null || !issued.equals(resetToken)) {
            throw new IllegalArgumentException("유효하지 않은 요청입니다.");
        }
        String hash = passwordEncoder.encode(newPassword);
        int updated = userRepository.updatePassword(username, hash);

        if (updated > 0) {
            tokens.remove(username);
            codes.remove(username);
            return true;
        }
        return false;
    }
}
