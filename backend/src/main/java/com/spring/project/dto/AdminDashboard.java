package com.spring.project.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminDashboard {
    private int totalProducts; //총상품 수
    private int inProgressAuctions; //진행 중인 경매 수
    private int todaySales; //오늘 매출
    private int activeUser; //활성 사용자
    private List<String> newActivity;//최근 활동
}
