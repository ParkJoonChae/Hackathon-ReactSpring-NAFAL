package com.spring.project.controller;

import com.spring.project.common.RedisNewActivity;
import com.spring.project.common.UserRole;
import com.spring.project.dto.UserDTO;
import com.spring.project.dto.WalletDTO;
import com.spring.project.service.EmailVerificationService;
import com.spring.project.service.PasswordResetService;
import com.spring.project.service.RedisService;
import com.spring.project.service.UserService;
import com.spring.project.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/*@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")*/
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;
    private final EmailVerificationService emailVerificationService;
    private final RedisService redisService;
    private final WalletService walletService;


    // 현재 세션 사용자 정보 조회
    @GetMapping("/user/session")
    public ResponseEntity<Map<String, Object>> getSessionUser(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            UserDTO userSession = (UserDTO) session.getAttribute("userSession");
            if (userSession == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
                    // 디버깅 로그 추가
        System.out.println("🔍 세션에서 가져온 UserDTO: " + userSession);
        System.out.println("📱 phoneNumber 값: " + userSession.getPhoneNumber());
        System.out.println("📱 phoneNumber 타입: " + (userSession.getPhoneNumber() != null ? userSession.getPhoneNumber().getClass().getName() : "null"));
        
        // 세션 정보에 canBid 포함
        response.put("success", true);
        response.put("userId", userSession.getUserId());
        response.put("username", userSession.getUsername());
        response.put("name", userSession.getName());
        response.put("userType", userSession.getUserType());
        response.put("canBid", userSession.isCanBid()); // canBid 정보 추가
        response.put("createdAt", userSession.getCreatedAt());
        response.put("recentAt", userSession.getRecentAt());
        response.put("phoneNumber", userSession.getPhoneNumber());
        
        // 응답 로그 추가
        System.out.println("📤 응답에 포함된 phoneNumber: " + response.get("phoneNumber"));
        System.out.println("세션 조회: userId=" + userSession.getUserId() + 
                         ", canBid=" + userSession.isCanBid());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "세션 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    public final static Map<String,HttpSession> SESSION_MAP = new ConcurrentHashMap<>();
    //관리자 저장 - ADMIN
    @PostMapping("/user/insertManager")
    public ResponseEntity<Void> insertManager(@RequestBody UserDTO dto){
        dto.setUserType(UserRole.ADMIN);
        try{
            userService.insertManager(dto);
        }catch (Exception e){
            System.out.println("관리자 등록 오류: "+e.getMessage());
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/user/sessionchk")
    public Map<String, Object> sessionchk(HttpSession session){
        Map<String, Object> map = new HashMap<>();
        UserDTO userSession = (UserDTO) session.getAttribute("userSession");
        if (userSession == null) {
            map.put("success", false);
            map.put("message", "로그인이 필요합니다.");
        }else{
            map.put("success", true);
    }       map.put("message", "로그인 성공!");
    
    return map;
    }


    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody UserDTO userDTO, HttpSession session){

        Map<String, Object> map = new HashMap<>();
        UserDTO loginUser = userService.login(userDTO); // 비번 매칭 포함, 실패 시 null
        if (loginUser == null) {
            map.put("success", false);
            map.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return map;
        }

        UserDTO safe = new UserDTO();
        safe.setUserId(loginUser.getUserId());
        safe.setUsername(loginUser.getUsername());
        safe.setName(loginUser.getName());
        safe.setUserType(loginUser.getUserType());
        safe.setPhoneNumber(loginUser.getPhoneNumber());
        safe.setCanBid(loginUser.isCanBid()); // canBid 정보 추가
        safe.setPasswordHash(null);

        System.out.println("🔐 세션에 저장할 canBid: " + safe.isCanBid() + ", userId: " + safe.getUserId());

        session.setAttribute("userSession", safe);

        if (loginUser.getUserType() == UserRole.ADMIN){
            SESSION_MAP.put("ADMIN",session);
        }else {
            SESSION_MAP.put("USER",session);
        }





        Map<String, Object> user = new HashMap<>();
        user.put("userId",   safe.getUserId());
        user.put("username", safe.getUsername());
        user.put("name",     safe.getName());
        user.put("userType", safe.getUserType());
        user.put("canBid",   safe.isCanBid());
        user.put("phoneNumber", safe.getPhoneNumber());// 응답에도 canBid 포함

        map.put("success", true);
        map.put("message", "로그인 성공!");
        map.put("user", user);
        return map;
    }

    @PostMapping("/check-id-or-phone")
    public Map<String, Object> checkIdOrPhone(@RequestBody UserDTO userDTO) {
        Map<String, Boolean> result = userService.checkIdOrPhone(userDTO);
        boolean checkId = Boolean.TRUE.equals(result.get("id"));
        boolean checkPhoneNumber = Boolean.TRUE.equals(result.get("phoneNumber"));

        Map<String, Object> map = new HashMap<>();
        map.put("success", true);
        map.put("checkId", checkId);
        map.put("checkPhoneNumber", checkPhoneNumber);

        if (checkId && !checkPhoneNumber) {
            map.put("message", "존재하는 아이디입니다.");
        } else if (!checkId && checkPhoneNumber) {
            map.put("message", "존재하는 전화번호입니다.");
        }

        return map;
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(HttpSession session){
        session.invalidate();
        SecurityContextHolder.clearContext();
        Map<String, Object> map = new HashMap<>();
        map.put("success", true);
        map.put("message", "로그아웃 성공!");
        return map;
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody UserDTO userDTO,HttpSession session) {
        int signup = userService.signup(userDTO);
        redisService.saveNew(String.valueOf(RedisNewActivity.REGISTER),userDTO.getName(),session);
        Map<String, Object> map = new HashMap<>();
        map.put("success", signup > 0);
        map.put("message", signup > 0 ? "회원가입 성공" : "회원가입 실패");
        return map;
    }

    /* 비밀번호 찾기: 이메일 인증코드 → 코드검증 → 새 비밀번호 설정 */
    /** Step 1: 이메일로 인증코드 발송 */
    @PostMapping("/send-verification")
    public Map<String,Object> sendVerification(@RequestBody Map<String,String> payload) {
        String name = payload.get("name");
        String userId = payload.get("userId");  // 이메일

        Map<String,Object> res = new HashMap<>();
        try {
            passwordResetService.sendResetCodeByEmail(name, userId);
            res.put("success", true);
            res.put("message", "인증번호 발송 완료");
        } catch(Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }


    /** Step 2: 인증코드 검증 → resetToken 발급 */
    @PostMapping("/verify-code")
    public Map<String,Object> verify(@RequestBody Map<String,String> b){
        String userId = b.get("userId");                 // ← 프론트는 userId로 보냄
        String code   = b.get("verificationCode");
        Map<String,Object> res = new HashMap<>();
        try{
            String token = passwordResetService.verifyCode(userId, code);
            res.put("success", true);
            res.put("token", token);
            res.put("message", "인증이 완료되었습니다.");
        }catch(Exception e){
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    /** Step 3: 새 비밀번호 저장 (resetToken 필요) */
    @PutMapping("/reset-password")
    public Map<String,Object> reset(@RequestBody Map<String,String> b){
        String userId = b.get("userId");         // ← 프론트 키와 통일
        String newPw  = b.get("newPassword");
        String token  = b.get("resetToken");
        Map<String,Object> res = new HashMap<>();
        try{
            boolean ok = passwordResetService.resetPassword(userId, newPw, token);
            res.put("success", ok);
            res.put("message", ok ? "비밀번호 재설정 완료" : "비밀번호 재설정 실패");
        }catch(Exception e){
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    @GetMapping("/owner/dashboard-stats")
    public Map<String, Object> dashboardStats() {
        return userService.dashboardStats();
    }


    /* 회원가입 이메일 인증 */
    @PostMapping("/email/send-code")
    public Map<String,Object> sendSignupEmailCode(@RequestBody Map<String,String> b) {
        String email = b.get("email");
        Map<String,Object> res = new HashMap<>();
        try {
            emailVerificationService.sendCode(email);
            res.put("success", true);
            res.put("message", "인증코드 발송 완료");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    /* 회원가입 이메일 인증 학인 */
    @PostMapping("/email/verify-code")
    public Map<String,Object> verifySignupEmailCode(@RequestBody Map<String,String> b) {
        String email = b.get("email");
        String code  = b.get("code");
        Map<String,Object> res = new HashMap<>();
        try {
            boolean ok = emailVerificationService.verifyCode(email, code);
            res.put("success", ok);
            res.put("message", ok ? "이메일 인증 완료" : "인증코드가 올바르지 않거나 만료되었습니다");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    /* 지갑 관련 API */
    
    /**
     * 사용자 지갑 정보 조회
     * @param userId 사용자 ID (경로 변수)
     * @return 지갑 정보 (balance, locked, availableBalance 포함)
     */
    @GetMapping("/user/{userId}/wallet")
    public ResponseEntity<Map<String, Object>> getUserWallet(@PathVariable int userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            WalletDTO wallet = walletService.getOrCreateWallet(userId);
            
            response.put("success", true);
            response.put("userId", wallet.getUserId());
            response.put("balance", wallet.getBalance());
            response.put("locked", wallet.getLocked());
            response.put("availableBalance", wallet.getAvailableBalance());
            response.put("totalBalance", wallet.getTotalBalance());
            response.put("updatedAt", wallet.getUpdatedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "지갑 정보 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 포인트 충전
     * @param userId 사용자 ID
     * @param request 충전 요청 (amount 포함)
     * @return 충전 결과
     */
    @PostMapping("/user/{userId}/wallet/charge")
    public ResponseEntity<Map<String, Object>> chargePoints(
            @PathVariable int userId, 
            @RequestBody Map<String, Integer> request) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            int amount = request.getOrDefault("amount", 0);
            if (amount <= 0) {
                response.put("success", false);
                response.put("message", "충전 금액은 0보다 커야 합니다.");
                return ResponseEntity.badRequest().body(response);
            }

            boolean success = walletService.addBalance(userId, amount);
            if (success) {
                WalletDTO updatedWallet = walletService.getOrCreateWallet(userId);
                response.put("success", true);
                response.put("message", amount + "포인트가 충전되었습니다.");
                response.put("newBalance", updatedWallet.getBalance());
                response.put("availableBalance", updatedWallet.getAvailableBalance());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "포인트 충전에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "포인트 충전 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 구매 페이지용 포인트 충전 API (결제 완료 후 호출)
     * @param purchaseData 구매 정보 (amount, bonusAmount, paymentMethod, merchantUid)
     * @param session HTTP 세션
     * @return 충전 결과
     */
    @PostMapping("/purchase/complete")
    public ResponseEntity<Map<String, Object>> completePurchase(
            @RequestBody Map<String, Object> purchaseData,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 세션에서 사용자 정보 확인
            UserDTO userSession = (UserDTO) session.getAttribute("userSession");
            if (userSession == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Integer amount = (Integer) purchaseData.get("amount");
            Integer bonusAmount = (Integer) purchaseData.get("bonusAmount");
            String paymentMethod = (String) purchaseData.get("paymentMethod");
            String merchantUid = (String) purchaseData.get("merchantUid");
            
            if (amount == null || amount <= 0) {
                response.put("success", false);
                response.put("message", "충전 금액이 유효하지 않습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 총 충전 포인트 계산 (기본 포인트 + 보너스 포인트)
            int totalPoints = amount + (bonusAmount != null ? bonusAmount : 0);
            
            // 포인트 충전
            boolean chargeSuccess = walletService.addBalance(userSession.getUserId(), totalPoints);
            if (chargeSuccess) {
                // 업데이트된 지갑 정보 조회
                WalletDTO wallet = walletService.getOrCreateWallet(userSession.getUserId());
                
                response.put("success", true);
                response.put("message", "포인트 충전이 완료되었습니다.");
                response.put("baseAmount", amount);
                response.put("bonusAmount", bonusAmount != null ? bonusAmount : 0);
                response.put("totalChargedPoints", totalPoints);
                response.put("newBalance", wallet.getBalance());
                response.put("paymentMethod", paymentMethod);
                response.put("merchantUid", merchantUid);
                
                System.out.println("포인트 충전 완료: userId=" + userSession.getUserId() + 
                                 ", totalPoints=" + totalPoints + ", newBalance=" + wallet.getBalance());
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "포인트 충전에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (Exception e) {
            System.err.println("구매 완료 처리 중 오류: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "구매 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 포인트 사용내역 조회
     * @param session HTTP 세션
     * @return 포인트 거래 내역 리스트
     */
    @GetMapping("/user/point-transactions")
    public ResponseEntity<?> getPointTransactions(HttpSession session) {
        try {
            UserDTO userSession = (UserDTO) session.getAttribute("userSession");
            if (userSession == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요합니다."));
            }

            List<Map<String, Object>> transactions = userService.getPointTransactions(userSession.getUserId());
            return ResponseEntity.ok(Map.of("success", true, "transactions", transactions));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "포인트 거래 내역 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 본인인증 완료 시 canBid 업데이트
     */
    @PostMapping("/user/verify-identity")
    public ResponseEntity<?> verifyIdentity(HttpSession session) {
        try {
            UserDTO userSession = (UserDTO) session.getAttribute("userSession");
            if (userSession == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요합니다."));
            }

            boolean success = userService.updateUserCanBid(userSession.getUserId(), true);
            if (success) {
                // 세션 업데이트
                userSession.setCanBid(true);
                session.setAttribute("userSession", userSession);
                
                // 응답에 canBid 정보 포함
                return ResponseEntity.ok(Map.of(
                    "success", true, 
                    "message", "본인인증이 완료되었습니다.",
                    "canBid", true,
                    "userId", userSession.getUserId()
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of("success", false, "message", "본인인증 처리 중 오류가 발생했습니다."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "본인인증 처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 입찰 가능 여부 확인
     * @param userId 사용자 ID
     * @param bidAmount 입찰 금액 (쿼리 파라미터)
     * @return 입찰 가능 여부
     */
    @GetMapping("/user/{userId}/wallet/can-bid")
    public ResponseEntity<Map<String, Object>> canBid(
            @PathVariable int userId,
            @RequestParam int bidAmount) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            boolean canBid = walletService.canBid(userId, bidAmount);
            int availableBalance = walletService.getAvailableBalance(userId);
            
            response.put("success", true);
            response.put("canBid", canBid);
            response.put("bidAmount", bidAmount);
            response.put("availableBalance", availableBalance);
            response.put("message", canBid ? "입찰 가능합니다." : "포인트가 부족합니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "입찰 가능 여부 확인 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }



}
