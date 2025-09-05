package com.spring.project.dto;

import com.spring.project.common.ProductStatus;
import lombok.Data;

import java.util.Date;
@Data
public class ProductDTO {
    private String productId;
    private int sellerId; //작성자 pk
    private String username; //작성장 username
    private String title;
    private String description; //설명
    private int categoryId;
    private String deliveryType; //배송 타입
    private int deliveryPrice; //배송 금액
    private String deliveryOpt; //배송 옵션 -> 서울이면 0원
    private int co2EffectKg; //co2절약효과
    private String effectDesc; //기대효과
    private String sizeInfo; //사이즈
    private String history; //히스토리
    private Date registerDate; //등록일
    private String brand; //브랜드
    private String tag;
    private int ori_price; //원가
    private int instantPrice; //즉시
    private String material; // 재질
    private String eventName;//팝업기업명
    private char itemStatus; //상품 상태
}
