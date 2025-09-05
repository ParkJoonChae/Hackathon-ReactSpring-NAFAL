package com.spring.project.controller;

import com.spring.project.dto.UserDTO;
import com.spring.project.service.KakaoAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;


@CrossOrigin(
        origins = "http://localhost:3000",
        allowCredentials = "true",
        allowedHeaders = {"Content-Type", "Authorization", "X-Requested-With"},
        methods = {RequestMethod.POST, RequestMethod.OPTIONS}
)
@RestController
@RequestMapping("/api")
public class KakaoAuthController {

    @Autowired
    KakaoAuthService kakaoAuthService;

    // 안전하게 환경설정으로 빼두는 걸 권장 (application.yml / 환경변수)
    @Value("${kakao.rest-key:4dfdd475318089b96a4902279b6eb77b}")
    private String kakaoRestKey;

    private final Set<String> usedCodes = Collections.newSetFromMap(new ConcurrentHashMap<>());

    /**
     * 프론트에서 받은 authorization code 를 access_token 으로 교환 후 세션 저장
     * body 예: { "code": "...", "redirectUri": "http://localhost:3000/kakao/callback" }
     */
    @PostMapping("/kakao/auth-code")
    public ResponseEntity<Map<String, Object>> kakaoAuthCode(@RequestBody Map<String, Object> body,
                                                             HttpSession session) {
        Map<String, Object> map = new HashMap<>();

        String code = body == null ? null : (String) body.get("code");
        String redirectUri = body == null ? null : (String) body.get("redirectUri");

        if (code == null || redirectUri == null) {
            map.put("success", false);
            map.put("message", "code/redirectUri is required");
            return ResponseEntity.badRequest().body(map);
        }

        // 이미 사용된 code 재사용 방지
        if (!usedCodes.add(code)) {
            return ResponseEntity.status(409)
                    .body(Map.of("success", false, "message", "이미 사용된 코드"));
        }

        try {
            // 1) code -> access_token 교환
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("grant_type", "authorization_code");
            form.add("client_id", kakaoRestKey);
            form.add("redirect_uri", redirectUri);
            form.add("code", code);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

            RestTemplate rt = new RestTemplate();
            ResponseEntity<Map> tokenRes =
                    rt.postForEntity("https://kauth.kakao.com/oauth/token", request, Map.class);

            String accessToken = tokenRes.getBody() == null ? null : (String) tokenRes.getBody().get("access_token");
            if (accessToken == null) {
                map.put("success", false);
                map.put("message", "토큰 교환 실패");
                return ResponseEntity.badRequest().body(map);
            }

            // 2) 서비스 로직 호출 (DB upsert)
            UserDTO user = kakaoAuthService.kakaoLoginOrSignup(accessToken);
            if (user == null) {
                map.put("success", false);
                map.put("message", "카카오 사용자 정보를 가져오지 못했습니다.");
                return ResponseEntity.badRequest().body(map);
            }

            // 3) 세션 저장
            user.setPasswordHash(null);
            session.setAttribute("userSession", user);
            session.setAttribute("authProvider", "KAKAO");

            Map<String, Object> u = new HashMap<>();
            u.put("userId",       user.getUserId());
            u.put("username",     user.getUsername());
            u.put("name",         user.getName());
            u.put("userType",     user.getUserType());
            u.put("pointBalance", user.getPointBalance());

            map.put("success", true);
            map.put("message", "카카오 로그인 성공");
            map.put("user", u);
            return ResponseEntity.ok(map);

        } catch (Exception e) {
            map.put("success", false);
            map.put("message", e.getClass().getSimpleName() + ": " + e.getMessage());
            return ResponseEntity.status(500).body(map);
        }
    }


    // 기존 /kakao/login (implicit flow 용) 그대로 두어도 됨
}
