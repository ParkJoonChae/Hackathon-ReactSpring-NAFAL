package com.spring.project.service.impl;

import com.spring.project.dto.UserDTO;
import com.spring.project.repository.UserRepository;
import com.spring.project.service.UserService;
import com.spring.project.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("userService")
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;

    @Override
    public void insertManager(UserDTO dto){
        if (dto.getPasswordHash() == null || dto.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        String raw = dto.getPasswordHash();
        if (!(raw.startsWith("$2a$") || raw.startsWith("$2b$") || raw.startsWith("$2y$"))) {
            dto.setPasswordHash(passwordEncoder.encode(raw));
        }
        
        // 관리자 생성
        userRepository.insertManager(dto);
    }

    @Override
    public UserDTO login(UserDTO user) {
        UserDTO userdb = userRepository.findByUsername(user.getUsername());
        if (userdb != null && passwordEncoder.matches(user.getPasswordHash(), userdb.getPasswordHash())) {
            userdb.setPasswordHash(null);
            
            // 로그인 성공 시 지갑이 없으면 자동 생성
            try {
                walletService.getOrCreateWallet(userdb.getUserId());
                System.out.println("✅ 로그인 성공 - canBid: " + userdb.isCanBid() + ", userId: " + userdb.getUserId() + ", 지갑 확인/생성 완료");
            } catch (Exception e) {
                System.err.println("❌ 지갑 생성 실패 - userId: " + userdb.getUserId() + ", error: " + e.getMessage());
                // 지갑 생성 실패 시에도 로그인은 성공으로 처리
            }

            System.out.println("✅ 로그인 성공 - canBid: " + userdb.isCanBid() + ", userId: " + userdb.getUserId());
            return userdb;
        }
        return null;
    }

    @Override
    public int signup(UserDTO user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        int userId = userRepository.signup(user);
        System.out.println("✅ 회원가입 완료 - userId: " + userId);
        return userId;
    }

    @Override
    public Map<String, Boolean> checkIdOrPhone(UserDTO user) {

        boolean id = false;
        boolean phoneNumber = false;

        if(user.getUsername() != null){
            id = userRepository.checkId(user) > 0;
        }
        System.out.println("phone if전: " + user.getPhoneNumber());
        if(user.getPhoneNumber() != null){
            System.out.println("if문 진입");
            int a;
            a = userRepository.checkPhoneNumber(user);
            System.out.println("checkPhone메서드값 : " + a);
            phoneNumber = a > 0;
            System.out.println("checkPhone메서드 결과 : " + phoneNumber);
        }



        System.out.println("id: " + id + ",  phone: " + phoneNumber);

        Map<String, Boolean> map = new HashMap<>();
        map.put("id", id);
        map.put("phoneNumber", phoneNumber);

        return map;
    }

    @Override
    public Map<String, Object> dashboardStats() {
        Map<String, Object> res = new HashMap<>();
        int totalUsers = userRepository.countAllUsers();
        int adminCount = userRepository.countByRole("ADMIN");
        int userCount  = userRepository.countByRole("USER");

        res.put("totalUsers", totalUsers);
        res.put("adminCount", adminCount);
        res.put("userCount",  userCount);
        res.put("systemStatus", "정상"); // 필요 없으면 지워도 됨
        return res;
    }

    @Override
    public List<Map<String, Object>> getPointTransactions(int userId) {
        return userRepository.getPointTransactions(userId);
    }

    @Override
    @Transactional
    public boolean updateUserCanBid(int userId, boolean canBid) {
        try {
            int result = userRepository.updateUserCanBid(userId, canBid);
            return result > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


}
