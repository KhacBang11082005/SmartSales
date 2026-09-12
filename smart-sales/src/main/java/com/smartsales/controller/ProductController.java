package com.smartsales.controller;

import com.smartsales.entity.Product;
import com.smartsales.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // =========================================================
    // KHÁCH HÀNG
    // Chỉ lấy sản phẩm ACTIVE + danh mục ACTIVE
    // =========================================================
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // =========================================================
    // ADMIN / EMPLOYEE
    // Lấy tất cả sản phẩm, kể cả INACTIVE
    // =========================================================
    @GetMapping("/manage")
    public List<Product> getAllProductsForManagement() {
        return productService.getAllProductsForManagement();
    }

    // =========================================================
    // ADMIN / EMPLOYEE
    // Xem chi tiết sản phẩm trong trang quản lý
    // =========================================================
    @GetMapping("/manage/{id}")
    public Product getProductByIdForManagement(
            @PathVariable Long id) {

        return productService.getProductByIdForManagement(id);
    }

    // =========================================================
    // KHÁCH HÀNG
    // Xem chi tiết sản phẩm đang bán
    // =========================================================
    @GetMapping("/{id}")
    public Product getProductById(
            @PathVariable Long id) {

        return productService.getProductById(id);
    }

    // =========================================================
    // ADMIN + EMPLOYEE
    // Thêm sản phẩm
    // =========================================================
    @PostMapping
    public Product createProduct(
            @RequestBody Product product) {

        return productService.createProduct(product);
    }

    // =========================================================
    // ADMIN + EMPLOYEE
    // Sửa sản phẩm
    // =========================================================
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return productService.updateProduct(id, product);
    }

    // =========================================================
    // ADMIN
    // Xóa sản phẩm
    // =========================================================
    @DeleteMapping("/{id}")
    public void deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);
    }
}