package com.spring.project.dto;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class WalletDTO {
    private int userId;           // 사용자 ID (PK, FK → Users)
    private int balance;          // 사용 가능 포인트
    private int locked;           // 입찰 등으로 잠긴 포인트
    private Timestamp updatedAt;  // 최종 업데이트 시간

    // 계산된 필드들
    public int getAvailableBalance() {
        return balance - locked;
    }

    public int getTotalBalance() {
        return balance + locked;
    }

    // 생성자
    public WalletDTO() {}

    public WalletDTO(int userId, int balance, int locked) {
        this.userId = userId;
        this.balance = balance;
        this.locked = locked;
    }

    // toString
    @Override
    public String toString() {
        return "WalletDTO{" +
                "userId=" + userId +
                ", balance=" + balance +
                ", locked=" + locked +
                ", availableBalance=" + getAvailableBalance() +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
