package com.spring.project.dto;

import lombok.Data;

@Data
public class CategoryDTO {
    private int categoryId;
    private String name;
    private String icon;
    private int itemCount;
}
