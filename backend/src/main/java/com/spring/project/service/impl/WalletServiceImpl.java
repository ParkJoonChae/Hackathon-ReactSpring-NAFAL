package com.spring.project.service.impl;

import com.spring.project.dto.WalletDTO;
import com.spring.project.repository.WalletRepository;
import com.spring.project.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service("walletService")
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;

    @Override
    @Transactional(readOnly = true)
    public WalletDTO getOrCreateWallet(int userId) {
        WalletDTO wallet = walletRepository.getWalletByUserId(userId);
        
        // 지갑이 없으면 기본값으로 생성
        if (wallet == null) {
            wallet = new WalletDTO(userId, 0, 0);
            try {
                walletRepository.createWallet(wallet);
                log.info("새 지갑 생성: userId={}, balance=0, locked=0", userId);
                // 생성 후 다시 조회하여 timestamp 등 완전한 정보 가져오기
                wallet = walletRepository.getWalletByUserId(userId);
            } catch (Exception e) {
                log.error("지갑 생성 실패: userId={}, error={}", userId, e.getMessage());
                // 다른 스레드에서 이미 생성했을 가능성이 있으므로 다시 조회 시도
                wallet = walletRepository.getWalletByUserId(userId);
                if (wallet == null) {
                    throw new RuntimeException("지갑 생성 실패: " + e.getMessage());
                }
            }
        }
        
        return wallet;
    }

    @Override
    @Transactional
    public boolean lockPoints(int userId, int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("잠글 포인트는 0보다 커야 합니다: " + amount);
        }

        // 사용 가능한 포인트 확인
        int availableBalance = getAvailableBalance(userId);
        if (availableBalance < amount) {
            throw new RuntimeException("포인트가 부족합니다. 사용가능: " + availableBalance + ", 필요: " + amount);
        }

        int result = walletRepository.lockPoints(userId, amount);
        if (result > 0) {
            log.info("포인트 잠금 성공: userId={}, amount={}", userId, amount);
            return true;
        } else {
            log.error("포인트 잠금 실패: userId={}, amount={}", userId, amount);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean unlockPoints(int userId, int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("해제할 포인트는 0보다 커야 합니다: " + amount);
        }

        int result = walletRepository.unlockPoints(userId, amount);
        if (result > 0) {
            log.info("포인트 잠금 해제 성공: userId={}, amount={}", userId, amount);
            return true;
        } else {
            log.error("포인트 잠금 해제 실패: userId={}, amount={}", userId, amount);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean deductPoints(int userId, int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("차감할 포인트는 0보다 커야 합니다: " + amount);
        }

        int result = walletRepository.deductLockedPoints(userId, amount);
        if (result > 0) {
            log.info("포인트 차감 성공: userId={}, amount={}", userId, amount);
            return true;
        } else {
            log.error("포인트 차감 실패: userId={}, amount={}", userId, amount);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean deductBalance(int userId, int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("차감할 포인트는 0보다 커야 합니다: " + amount);
        }

        // 사용 가능한 포인트 확인
        int availableBalance = getAvailableBalance(userId);
        if (availableBalance < amount) {
            log.error("포인트 부족: userId={}, availableBalance={}, requestedAmount={}", 
                     userId, availableBalance, amount);
            return false;
        }

        int result = walletRepository.deductBalance(userId, amount);
        if (result > 0) {
            log.info("보유 포인트 차감 성공: userId={}, amount={}", userId, amount);
            return true;
        } else {
            log.error("보유 포인트 차감 실패: userId={}, amount={}", userId, amount);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean addBalance(int userId, int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("충전할 포인트는 0보다 커야 합니다: " + amount);
        }

        int result = walletRepository.addBalance(userId, amount);
        if (result > 0) {
            log.info("포인트 충전 성공: userId={}, amount={}", userId, amount);
            return true;
        } else {
            log.error("포인트 충전 실패: userId={}, amount={}", userId, amount);
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public int getAvailableBalance(int userId) {
        return walletRepository.getAvailableBalance(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canBid(int userId, int bidAmount) {
        if (bidAmount <= 0) {
            return false;
        }
        
        int availableBalance = getAvailableBalance(userId);
        boolean canBid = availableBalance >= bidAmount;
        
        log.debug("입찰 가능 여부 확인: userId={}, bidAmount={}, availableBalance={}, canBid={}", 
                  userId, bidAmount, availableBalance, canBid);
        
        return canBid;
    }
}
