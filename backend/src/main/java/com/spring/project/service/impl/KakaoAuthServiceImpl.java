package com.spring.project.service.impl;

import com.spring.project.common.UserRole;
import com.spring.project.dto.UserDTO;
import com.spring.project.repository.UserRepository;
import com.spring.project.service.KakaoAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service("kakaoAuthService")
public class KakaoAuthServiceImpl implements KakaoAuthService {

    @Autowired
    private UserRepository userRepository;



    @Override
    public UserDTO kakaoLoginOrSignup(String accessToken) {
        // 1) 카카오 사용자 정보 조회
        Map<String, Object> me = callKakaoMe(accessToken);

        // 2) 필요한 필드 파싱
        String kakaoId = parseKakaoId(me);                 // 필수
        Map<String, Object> account = safeMap(me.get("kakao_account"));
        Map<String, Object> profile = safeMap(account.get("profile"));

        String email    = str(account.get("email"));       // 있을 수도 없음
        String nickname = str(profile.get("nickname"));    // null 가능
        String phoneRaw = str(account.get("phone_number")); // "+82 10-xxxx-xxxx" 형태 가능

        // 3) 우리 시스템 규칙 매핑
        String username     = ("kakao_" + kakaoId).toLowerCase(); // UNIQUE
        String passwordHash = "SOCIAL:kakao:" + kakaoId;          // NOT NULL 채우기용(로그인에 사용 X)
        String phone        = normalizePhone(phoneRaw);           // "010xxxxxxxx"

        // 4) 멱등 Upsert
        UserDTO dto = new UserDTO();
        dto.setUsername(username);
        dto.setPasswordHash(passwordHash);
        dto.setName(nickname);
        dto.setPhoneNumber(phone);
        dto.setUserType(UserRole.USER); // 기본 권한

        userRepository.signupSocialUpsert(dto);

        // 5) 최신 사용자 조회 후 반환
        return userRepository.findByUsername(username);
    }

    /* ===================== Kakao API ===================== */

    private Map<String, Object> callKakaoMe(String accessToken) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> resp = rt.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET,
                entity,
                Map.class
        );

        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Kakao API 호출 실패: " + resp.getStatusCode());
        }
        return resp.getBody();
    }

    private String parseKakaoId(Map<String, Object> me) {
        Object idObj = me.get("id");
        if (idObj == null) throw new RuntimeException("Kakao id가 없습니다.");
        if (idObj instanceof Number) {
            return String.valueOf(((Number) idObj).longValue());
        }
        return String.valueOf(idObj);
    }

    /* ===================== 유틸 ===================== */

    @SuppressWarnings("unchecked")
    private Map<String, Object> safeMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : new HashMap<>();
    }

    private String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    // "+82 10-1234-5678" -> "01012345678"
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("\\D+", "");
        if (digits.startsWith("82")) {
            digits = "0" + digits.substring(2);
        }
        return digits;
    }
}
