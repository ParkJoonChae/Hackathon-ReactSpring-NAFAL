package com.spring.project.controller.admin;

import com.spring.project.common.RedisNewActivity;
import com.spring.project.dto.AdminDashboard;
import com.spring.project.dto.ServerToProductDTO;
import com.spring.project.service.ProductService;
import com.spring.project.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class DashBoardController {
    private final ProductService productService;
    private final RedisService redisService;

    //대시보드 정보 get
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboard> getDashBoard(){
        AdminDashboard adminDashboard;
        try{
            adminDashboard = productService.getAdminDashBoard();
            adminDashboard.setActiveUser(redisService.getActiveUser());
            System.out.println(adminDashboard.toString());
            Set<Map.Entry<Object,Object>> entries = redisService.getNewActivity();
            List<String> list = new ArrayList<>();
            for (Map.Entry<Object,Object> entry : entries){
                System.out.println("키"+entry.getKey().toString()+"값:"+entry.getValue().toString());
                String stringList = entry.getKey().toString().split("_")[0];
                RedisNewActivity key = RedisNewActivity.valueOf(stringList);
                String value ;
                switch (key){
                    case PRODUCT:
                        value = "새 상품'" + entry.getValue().toString() + "'가 등록되었습니다.";
                        list.add(value);
                        break;
                    case AUCTION:
                        value = "경매'" + entry.getValue().toString() + "'이 종료되었습니다.";
                        list.add(value);
                        break;
                    case REGISTER:
                        value = "새 사용자'" + entry.getValue().toString() + "'이 가입했습니다.";
                        list.add(value);
                        break;
                    case PAYMENT:
                        value = "결제'PAYMENT_" + entry.getValue().toString() + "'이 완료되었습니다.";
                        list.add(value);
                        break;
                }
            }
            adminDashboard.setNewActivity(list);
        } catch (Exception e) {
            System.out.println("대시보드 오류:"+e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
        return ResponseEntity.ok(adminDashboard);
    }


    //상품정보 가지고 오기
    @GetMapping("/product")
    public ResponseEntity<List<ServerToProductDTO>> getProductAllController(){
        List<ServerToProductDTO> list = new ArrayList<>();
        try{
            list =  productService.getProductAll();
            System.out.println("상품관리:"+list.toString());
        } catch (Exception e) {
            System.out.println("관리자 상품 기자고 오는 중 오류:"+ e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
        return ResponseEntity.ok(list);
    }


  /*  //판매 관리
    @GetMapping("/salesManagement")
    public ResponseEntity<> getTotalSales(){

    }*/
}
