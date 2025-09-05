package com.spring.project.repository;

import com.spring.project.dto.*;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ProductRepository {

    private final SqlSession session;

    //상품 저장
    public String insertProduct(ProductDTO dto, AuctionsDTO auctionsDTO) {
        session.insert("seq_insert", dto);
        session.insert("insertProduct", dto);
        System.out.println("xml 반환값" + dto.toString());
        auctionsDTO.setProductId(dto.getProductId());
        insertAuctions(auctionsDTO);
        return dto.getProductId();
    }


    //경매 정보 저장
    public void insertAuctions(AuctionsDTO auctionsDTO) {
        session.insert("insertAuctions", auctionsDTO);
    }

    //상품 이미지 저장
    public void insertProductImages(ImgDTO imgDTO) {
        session.insert("insertProductImages", imgDTO);
    }

    //카테고리 저장
    public CategoryDTO insertCategory(CategoryDTO dto) {
        session.insert("insertCategory", dto);
        return dto;
    }


    //구매 상태 변경
    public void updateOrderStatus(String orderId) {
        session.update("updateOrderStatusPaid", orderId);
    }

    /*관리자페이지 - 상품 전체 가지고 오기*/
    public List<ServerToProductDTO> getProductAll() {
        return session.selectList("getProductAll");
    }

    /*카테고리 정보 가지고 오기..*/
    public List<CategoryDTO> getCategory() {
        return session.selectList("getCategory");
    }

    /*경매 상품 상세 정보 조회*/
    public List<Map<String, Object>> getAuctionProductsWithDetails() {
        return session.selectList("getAuctionProductsWithDetails");
    }

    /*상품 기본 정보 조회*/
    public Map<String, Object> getProductInfo(String productId) {
        return session.selectOne("getProductInfo", productId);
    }


    // 경매 상태 조회(초기 시드용)
    public java.util.Map<String, Object> selectAuctionStateByProductId(String productId) {
        return session.selectOne("selectAuctionStateByProductId", productId);
    }

    public java.util.Map<String, Object> selectAuctionMetaByProductId(String productId) {
        return session.selectOne("selectAuctionMetaByProductId", productId);
    }

    public java.util.List<java.util.Map<String, Object>> selectRecentBidsByProductId(String productId, int limit) {
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("productId", productId);
        params.put("limit", limit);
        return session.selectList("selectRecentBidsByProductId", params);
    }

    // 최고 입찰자 조회 (낙찰자용)
    public java.util.Map<String, Object> selectTopBidderByProductId(String productId) {
        return session.selectOne("selectTopBidderByProductId", productId);
    }

    // 입찰 정보 저장
    public void insertBid(String productId, String userId, long bidAmount) {
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("productId", productId);
        params.put("userId", userId);
        params.put("bidAmount", bidAmount);
        session.insert("insertBid", params);
    }

    // 낙찰 주문 생성
    public int insertOrder(String productId, int buyerId, int sellerId, long orderTotal, long feeAmount) {
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("productId", productId);
        params.put("buyerId", buyerId);
        params.put("sellerId", sellerId);
        params.put("orderTotal", orderTotal);
        params.put("feeAmount", feeAmount);
        session.insert("insertOrder", params);

        // AUTO_INCREMENT로 생성된 orderId 반환 (BigInteger -> Integer 변환)
        Object orderIdObj = params.get("orderId");
        if (orderIdObj instanceof Number) {
            return ((Number) orderIdObj).intValue();
        }
        return 0;
    }

    // 상품의 판매자 조회
    public Integer selectSellerByProductId(String productId) {
        return session.selectOne("selectSellerByProductId", productId);
    }

    // 주문 정보 조회 (상품 정보 포함)
    public java.util.Map<String, Object> selectOrderWithProductInfo(int orderId) {
        return session.selectOne("selectOrderWithProductInfo", orderId);
    }

    // productId와 userId로 주문 조회
    public java.util.Map<String, Object> selectOrderByProductAndUser(String productId, int userId) {
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("productId", productId);
        params.put("userId", userId);
        return session.selectOne("selectOrderByProductAndUser", params);
    }

    // 주문 상태 업데이트
    public boolean updateOrderStatus(int orderId, String newStatus) {
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("orderId", orderId);
        params.put("status", newStatus);
        int result = session.update("updateOrderStatus", params);
        return result > 0;
    }

    // 경매 상태 업데이트 (Redis-DB 동기화용)
    public boolean updateAuctionStatus(String productId, String status) {
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("productId", productId);
        params.put("status", status);
        int result = session.update("updateAuctionStatus", params);
        return result > 0;
    }

    // 경매 종료 시간 업데이트 (Redis-DB 동기화용)
    public boolean updateAuctionEndTime(String productId, long endTime) {
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("productId", productId);
        params.put("endTime", endTime);
        int result = session.update("updateAuctionEndTime", params);
        return result > 0;
    }

}