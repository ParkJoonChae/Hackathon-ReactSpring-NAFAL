package com.spring.project.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ImgDTO {
    private int imgId;
    private String productId;
    private boolean thumbnailUrl;
    private String imageUrl;
    private String photoSource;
}
