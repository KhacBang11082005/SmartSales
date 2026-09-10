package com.smartsales.repository;

import com.smartsales.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByStatusAndCategory_Status(
            Product.Status productStatus,
            com.smartsales.entity.Category.Status categoryStatus
    );
}