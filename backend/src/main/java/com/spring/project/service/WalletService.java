package com.spring.project.service;

import com.spring.project.dto.WalletDTO;

public interface WalletService {
    
    /**
     * 사용자 지갑 정보 조회 (없으면 자동 생성)
     * @param userId 사용자 ID
     * @return 지갑 정보
     */
    WalletDTO getOrCreateWallet(int userId);
    
    /**
     * 포인트 잠금 (입찰 시)
     * @param userId 사용자 ID
     * @param amount 잠글 포인트 금액
     * @return 성공 여부
     * @throws RuntimeException 잔액 부족 시
     */
    boolean lockPoints(int userId, int amount);
    
    /**
     * 포인트 잠금 해제 (입찰 실패 시)
     * @param userId 사용자 ID
     * @param amount 해제할 포인트 금액
     * @return 성공 여부
     */
    boolean unlockPoints(int userId, int amount);
    
    /**
     * 포인트 차감 (낙찰 시 - 잠긴 포인트에서 차감)
     * @param userId 사용자 ID
     * @param amount 차감할 포인트 금액
     * @return 성공 여부
     */
    boolean deductPoints(int userId, int amount);
    
    /**
     * 보유 포인트에서 직접 차감 (일반 결제용)
     * @param userId 사용자 ID
     * @param amount 차감할 포인트 금액
     * @return 성공 여부
     */
    boolean deductBalance(int userId, int amount);
    
    /**
     * 포인트 충전
     * @param userId 사용자 ID
     * @param amount 충전할 포인트 금액
     * @return 성공 여부
     */
    boolean addBalance(int userId, int amount);
    
    /**
     * 사용 가능한 포인트 확인
     * @param userId 사용자 ID
     * @return 사용 가능한 포인트 (balance - locked)
     */
    int getAvailableBalance(int userId);
    
    /**
     * 입찰 가능 여부 확인
     * @param userId 사용자 ID
     * @param bidAmount 입찰 금액
     * @return 입찰 가능하면 true
     */
    boolean canBid(int userId, int bidAmount);
}
