package com.spring.project.service;

import com.spring.project.dto.UserDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface UserService {


    /* 관리자 생성 */
    public void insertManager(UserDTO dto);

    //로그인
    public UserDTO login(UserDTO user);

    //회원가입
    public int signup(UserDTO user);

    // 닉네임, 전화번호 중복 체크
    public Map<String, Boolean> checkIdOrPhone(UserDTO user);

    // 사용자 수 불러오기
    public Map<String,Object> dashboardStats();

    /**
     * 포인트 거래 내역 조회
     * @param userId 사용자 ID
     * @return 포인트 거래 내역 리스트
     */
    List<Map<String, Object>> getPointTransactions(int userId);

    /**
     * 사용자 입찰 자격 업데이트
     * @param userId 사용자 ID
     * @param canBid 입찰 가능 여부
     * @return 업데이트 성공 여부
     */
    boolean updateUserCanBid(int userId, boolean canBid);

}
