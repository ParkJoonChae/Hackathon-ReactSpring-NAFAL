package com.spring.project.repository;

import com.spring.project.dto.WalletDTO;
import lombok.RequiredArgsConstructor;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class WalletRepository {

    @Autowired
    SqlSessionTemplate mybatis;

    /**
     * 사용자 지갑 정보 조회
     * @param userId 사용자 ID
     * @return 지갑 정보 (없으면 null)
     */
    public WalletDTO getWalletByUserId(int userId) {
        return mybatis.selectOne("walletRepository.getWalletByUserId", userId);
    }

    /**
     * 지갑 생성 (신규 사용자용)
     * @param walletDTO 지갑 정보
     * @return 생성된 행 수
     */
    public int createWallet(WalletDTO walletDTO) {
        return mybatis.insert("walletRepository.createWallet", walletDTO);
    }

    /**
     * 포인트 잠금 (입찰 시)
     * @param userId 사용자 ID
     * @param amount 잠글 포인트 금액
     * @return 업데이트된 행 수
     */
    public int lockPoints(int userId, int amount) {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("amount", amount);
        return mybatis.update("walletRepository.lockPoints", params);
    }

    /**
     * 포인트 잠금 해제 (입찰 실패 시)
     * @param userId 사용자 ID
     * @param amount 해제할 포인트 금액
     * @return 업데이트된 행 수
     */
    public int unlockPoints(int userId, int amount) {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("amount", amount);
        return mybatis.update("walletRepository.unlockPoints", params);
    }

    /**
     * 포인트 차감 (낙찰 시 - locked → 0)
     * @param userId 사용자 ID
     * @param amount 차감할 포인트 금액
     * @return 업데이트된 행 수
     */
    public int deductLockedPoints(int userId, int amount) {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("amount", amount);
        return mybatis.update("walletRepository.deductLockedPoints", params);
    }

    /**
     * 보유 포인트에서 직접 차감 (일반 결제용 - balance → 0)
     * @param userId 사용자 ID
     * @param amount 차감할 포인트 금액
     * @return 업데이트된 행 수
     */
    public int deductBalance(int userId, int amount) {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("amount", amount);
        return mybatis.update("walletRepository.deductBalance", params);
    }

    /**
     * 포인트 충전 (balance 증가)
     * @param userId 사용자 ID
     * @param amount 충전할 포인트 금액
     * @return 업데이트된 행 수
     */
    public int addBalance(int userId, int amount) {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("amount", amount);
        return mybatis.update("walletRepository.addBalance", params);
    }

    /**
     * 지갑 업데이트 (전체 정보)
     * @param walletDTO 업데이트할 지갑 정보
     * @return 업데이트된 행 수
     */
    public int updateWallet(WalletDTO walletDTO) {
        return mybatis.update("walletRepository.updateWallet", walletDTO);
    }

    /**
     * 지갑 존재 여부 확인
     * @param userId 사용자 ID
     * @return 존재하면 true, 없으면 false
     */
    public boolean existsWallet(int userId) {
        Integer count = mybatis.selectOne("walletRepository.existsWallet", userId);
        return count != null && count > 0;
    }

    /**
     * 사용 가능한 포인트 확인 (balance - locked)
     * @param userId 사용자 ID
     * @return 사용 가능한 포인트
     */
    public int getAvailableBalance(int userId) {
        Integer available = mybatis.selectOne("walletRepository.getAvailableBalance", userId);
        return available != null ? available : 0;
    }
}
