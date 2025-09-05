package com.spring.project.service;

import com.spring.project.common.ImgUtil;
import com.spring.project.dto.*;
import com.spring.project.repository.AdminRepository;
import com.spring.project.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.Multipart;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ImgUtil imgUtil;
    private boolean isThumb = true;
    private final AdminRepository adminRepository;


    public String insertProduct(ProductDTO dto, AuctionsDTO auctionsDTO){
        return productRepository.insertProduct(dto,auctionsDTO);
    }

    public void insertProductImage(List<MultipartFile> multipart, ImgDTO imgDTO){
        for (MultipartFile img:multipart){
            if (isThumb){
                System.out.println("썸네일");
                imgDTO.setThumbnailUrl(isThumb);
                isThumb = false;
            }
            imgDTO.setThumbnailUrl(isThumb);
           imgDTO.setImageUrl(imgUtil.saveImg(img));
        }

        productRepository.insertProductImages(imgDTO);
    }

    public CategoryDTO insertCategory(CategoryDTO dto){
        return productRepository.insertCategory(dto);
    }


    public AdminDashboard getAdminDashBoard(){
        return adminRepository.getDashBoard();
    }
    public void updateOrderStatus(String orderId){
        productRepository.updateOrderStatus(orderId);
    }
    public List<ServerToProductDTO> getProductAll(){
        return productRepository.getProductAll();
    }

    public List<CategoryDTO> getCategory(){
        return productRepository.getCategory();
    }

    public List<Map<String, Object>> getAuctionProductsWithDetails(){
        return productRepository.getAuctionProductsWithDetails();
    }

    public Map<String, Object> getProductInfo(String productId) {
        return productRepository.getProductInfo(productId);
    }
}
