package com.spring.project.dto;

import com.spring.project.common.AuctionsStatus;
import lombok.Data;

import java.util.Date;

@Data
public class OtherDTO {
    private Integer orderId;        // 주문 ID
    private String productId;       // 낙찰 상품
    private Integer buyerId;        // 구매자 ID
    private Integer sellerId;       // 판매자 ID
    private AuctionsStatus status;  // 주문 상태
    private Integer orderTotal;     // 낙찰 금액
    private Integer feeAmount;      // 플랫폼 수수료
    private Date createdAt;         // 생성일
    private Date updatedAt;         // 수정일
}
