package com.spring.project.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.project.common.AuctionsStatus;
import com.spring.project.common.RedisNewActivity;
import com.spring.project.dto.*;
import com.spring.project.service.ProductService;
import com.spring.project.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/post")
public class ProductController {

    @Autowired
    ProductService service;

    @Autowired
    RedisService redisService;
    //상품 등록
    @PostMapping("/register")
    public ResponseEntity<Void> insertProduct(@RequestParam("product") String result, HttpSession session
            , @RequestParam(value = "files",required = false)List<MultipartFile> multipart, @RequestParam("auction")String auctionResult){
        try {

            System.out.println("넘어온값:상품"+result);
            ObjectMapper mapper = new ObjectMapper();
            ProductDTO dto = mapper.readValue(result, ProductDTO.class);
            System.out.println(dto.getTitle());
            redisService.saveNew(String.valueOf(RedisNewActivity.PRODUCT),dto.getTitle(),session);
            //관리자 이름
            UserDTO userDTO = (UserDTO) session.getAttribute("userSession");
            System.out.println(userDTO.toString());
            dto.setSellerId(userDTO.getUserId());
            if (dto.getDeliveryOpt().equals("서울")){
                dto.setDeliveryPrice(0);
            }
            System.out.println("넘어온값:경매"+result);

            AuctionsDTO auctionsDTO = mapper.readValue(auctionResult, AuctionsDTO.class);
            auctionsDTO.setAuctionsStatus(AuctionsStatus.scheduled);
            String productID = service.insertProduct(dto,auctionsDTO);

            ImgDTO imgDTO = ImgDTO.builder().productId(productID).build();
            service.insertProductImage(multipart,imgDTO);


        }catch (Exception e){
            System.out.println("상품insert오류"+e.getMessage());
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok().build();
    }


    //카테고리 생성하면 바로 적용할 수 있게 반환값에 가져오기...
    @PostMapping("/register/category")
    public ResponseEntity<CategoryDTO> insertCategory(@RequestBody CategoryDTO dto) {
        CategoryDTO result;
        try {
            System.out.println(dto.toString());
            result = service.insertCategory(dto);
        } catch (Exception e) {
            System.out.println("상품카테고리 insert 오류" + e.getMessage());
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok().body(result);
    }


    //카테고리 정보 가지고 오기
    @GetMapping("/getCategory")
    public ResponseEntity<List<CategoryDTO>> getCategory(){
        System.out.println("카테고리 가지고 오기");
        List<CategoryDTO> list = new ArrayList<>();
        try {
            list = service.getCategory();
            System.out.println("확인"+Arrays.toString(list.toArray()));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok().body(list);
    }





}
