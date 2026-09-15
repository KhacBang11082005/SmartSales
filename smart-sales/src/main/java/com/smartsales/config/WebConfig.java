package com.smartsales.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // =========================================================
    // CHO PHÉP TRÌNH DUYỆT TRUY CẬP ẢNH
    //
    // URL:
    // http://localhost:8080/uploads/ten-anh.jpg
    //
    // sẽ lấy file từ:
    // smart-sales/uploads/ten-anh.jpg
    // =========================================================

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(
                        "file:uploads/"
                );
    }
}