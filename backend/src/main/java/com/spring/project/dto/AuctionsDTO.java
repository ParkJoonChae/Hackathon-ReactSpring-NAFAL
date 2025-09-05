package com.spring.project.dto;

import com.spring.project.common.AuctionsStatus;
import lombok.Data;

import java.util.Date;
@Data
public class AuctionsDTO {
    private int auction_id;
    private String productId;
    private int startPrice; // 경매 최소 금액 범위
    private int instantPrice;// 즉시 구매 값, max 값
    private int minimunPrice;// 최소 입장료
    private Date auctionStart;
    private Date auctionEnd;
    private AuctionsStatus auctionsStatus;
    private int softCloseSeconds =10; // 마감 직전 입찰 시 연장
}
