package com.smartsales.repository;

import com.smartsales.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository
        extends JpaRepository<ProductImage, Long> {

    // =========================================================
    // Lấy tất cả ảnh của một sản phẩm
    // theo thứ tự displayOrder
    // =========================================================

    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(
            Long productId
    );


    // =========================================================
    // Xóa tất cả ảnh của một sản phẩm
    // =========================================================

    void deleteByProductId(Long productId);
}