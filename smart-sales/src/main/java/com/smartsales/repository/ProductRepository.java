
package com.smartsales.repository;

import com.smartsales.entity.Category;
import com.smartsales.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByStatusAndCategory_Status(
            Product.Status productStatus,
            Category.Status categoryStatus
    );

    List<Product> findTop10ByStatusAndCategory_StatusOrderByIdDesc(
            Product.Status status,
            Category.Status categoryStatus
    );

    /**
     * Tìm sản phẩm đang hoạt động theo tên,
     * chỉ lấy sản phẩm thuộc danh mục đang hoạt động.
     */
    List<Product> findTop10ByStatusAndCategory_StatusAndNameContainingIgnoreCase(
            Product.Status status,
            Category.Status categoryStatus,
            String name
    );

    /**
     * Tìm sản phẩm đang hoạt động theo mô tả,
     * chỉ lấy sản phẩm thuộc danh mục đang hoạt động.
     */
    List<Product> findTop10ByStatusAndCategory_StatusAndDescriptionContainingIgnoreCase(
            Product.Status status,
            Category.Status categoryStatus,
            String description
    );
}
