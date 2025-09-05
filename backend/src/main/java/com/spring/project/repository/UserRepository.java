package com.spring.project.repository;

import com.spring.project.common.RedisNewActivity;
import com.spring.project.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class UserRepository {

    @Autowired
    SqlSessionTemplate mybatis;
    //관리자 저장..
    public void insertManager(UserDTO dto){
        mybatis.insert("userRepository.insertManager",dto);
    }

    //활성 유저 업데이트
    public void updateEntryUserAt(Map<String,String> map){
        mybatis.update("userRepository.updateEntryUserAt",map);
    }




    /* 로그인 */
    public UserDTO login(UserDTO user) {
        return mybatis.selectOne("userRepository.login", user);
    }
    /* 회원가입 */
    public int signup(UserDTO user){
        int userId = mybatis.insert("userRepository.signup", user);
        Map<String,String> map = new HashMap<>();
        map.put("type",String.valueOf(RedisNewActivity.REGISTER));
        map.put("id",userId+"");
        mybatis.insert("notification_signup",map);
        return userId;
    }

    /* 아이디 중복 확인 */
    public int checkId(UserDTO user){
        int a;
        a = mybatis.selectOne("userRepository.checkId", user);
        System.out.println("checkId: " + a);
        return mybatis.selectOne("userRepository.checkId", user);
    }
    /* 전화번호 중복 확인 */
    public int checkPhoneNumber(UserDTO user){
        int a;
        a = mybatis.selectOne("userRepository.checkPhoneNumber", user);
        System.out.println("checkPhoneNumber: " + a);
        return mybatis.selectOne("userRepository.checkPhoneNumber", user);
    }

    /* username 조회 (소셜 판단/세션 적재용) */
    public UserDTO findByUsername(String user){
        return mybatis.selectOne("userRepository.findByUsername", user);
    }

    /* 소셜 신규 가입 */
    public int signupSocial(UserDTO user) {
        return mybatis.insert( "userRepository.signupSocial", user);
    }

    /* 소셜 Upsert (멱등) */
    public int signupSocialUpsert(UserDTO user) {
        return mybatis.insert("userRepository.signupSocialUpsert", user);
    }

    /* 간단 업데이트: 이름 */
    public int updateName(int userId, String name) {
        Map<String, Object> p = new HashMap<>();
        p.put("userId", userId);
        p.put("name", name);
        return mybatis.update("userRepository.updateName", p);
    }

    /* ✅ 이름+이메일 존재 여부 (전화번호 불필요) */
    public boolean existsByUsernameAndName(String username, String name) {
        Map<String, Object> p = new HashMap<>();
        p.put("username", username);
        p.put("name", name);
        Integer exists = mybatis.selectOne("userRepository.existsByUsernameAndName", p);
        return exists != null && exists == 1;
    }

    //비밀번호 수정
    public int updatePassword(String username, String passwordHash) {
        Map<String, Object> p = new HashMap<>();
        p.put("username", username);
        p.put("passwordHash", passwordHash);
        return mybatis.update("userRepository.updatePasswordByUsername", p);
    }

    // 사용자 전체 수
    public int countAllUsers() {
        return mybatis.selectOne("userRepository.countAllUsers");
    }
    // 역할별 전체 수 
    public int countByRole(String role) {
        return mybatis.selectOne("userRepository.countByRole", role);
    }

    /**
     * 포인트 거래 내역 조회
     * @param userId 사용자 ID
     * @return 포인트 거래 내역 리스트
     */
    public List<Map<String, Object>> getPointTransactions(int userId) {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        return mybatis.selectList("userRepository.getPointTransactions", params);
    }

    /**
     * 사용자 입찰 자격 업데이트
     * @param userId 사용자 ID
     * @param canBid 입찰 가능 여부
     * @return 업데이트된 행 수
     */
    public int updateUserCanBid(int userId, boolean canBid) {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("canBid", canBid);
        return mybatis.update("userRepository.updateUserCanBid", params);
    }


}



