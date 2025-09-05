package com.spring.project.dto;

import lombok.Data;
/*서버에서 정보 가지고 오는 상품 dto*/
@Data
public class ServerToProductDTO {
    private String imgUrl;
    private String productId;
    private String productStatus;
    private String title;
    private String auctionStatus;
    private int price;
    private int cate_id;
}
