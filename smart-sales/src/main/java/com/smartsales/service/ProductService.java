package com.smartsales.service;

import com.smartsales.entity.Category;
import com.smartsales.entity.Product;
import com.smartsales.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // =========================================================
    // DÀNH CHO KHÁCH HÀNG
    // Chỉ lấy sản phẩm đang bán + danh mục đang hoạt động
    // =========================================================
    public List<Product> getAllProducts() {
        return productRepository.findByStatusAndCategory_Status(
                Product.Status.ACTIVE,
                Category.Status.ACTIVE
        );
    }

    // =========================================================
    // DÀNH CHO ADMIN / EMPLOYEE
    // Lấy toàn bộ sản phẩm, kể cả sản phẩm INACTIVE
    // =========================================================
    public List<Product> getAllProductsForManagement() {
        return productRepository.findAll();
    }

    // =========================================================
    // Chi tiết sản phẩm dành cho khách hàng
    // Chỉ cho xem sản phẩm ACTIVE + danh mục ACTIVE
    // =========================================================
    public Product getProductById(Long id) {
        return productRepository
                .findById(id)
                .filter(product ->
                        product.getStatus() == Product.Status.ACTIVE
                                && product.getCategory() != null
                                && product.getCategory().getStatus() == Category.Status.ACTIVE
                )
                .orElse(null);
    }

    // =========================================================
    // Chi tiết sản phẩm dành cho ADMIN / EMPLOYEE
    // Có thể xem cả ACTIVE và INACTIVE
    // =========================================================
    public Product getProductByIdForManagement(Long id) {
        return productRepository.findById(id)
                .orElse(null);
    }

    // =========================================================
    // THÊM SẢN PHẨM
    // ADMIN + EMPLOYEE
    // =========================================================
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // =========================================================
    // SỬA SẢN PHẨM
    // ADMIN + EMPLOYEE
    // =========================================================
    public Product updateProduct(Long id, Product product) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy sản phẩm"));

        existingProduct.setCategory(product.getCategory());
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setImageUrl(product.getImageUrl());
        existingProduct.setStatus(product.getStatus());
        existingProduct.setQuantity(product.getQuantity());

        return productRepository.save(existingProduct);
    }

    // =========================================================
    // XÓA SẢN PHẨM
    // Chỉ ADMIN mới được phép gọi API này
    // =========================================================
    public void deleteProduct(Long id) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy sản phẩm"));

        productRepository.delete(existingProduct);
    }

    // =========================================================
    // XÓA TẤT CẢ SẢN PHẨM CỦA MỘT DANH MỤC
    // Dùng khi ADMIN xóa danh mục
    // =========================================================
    public void deleteProductsByCategoryId(Long categoryId) {

        List<Product> products =
                productRepository.findByCategoryId(categoryId);

        if (!products.isEmpty()) {
            productRepository.deleteAll(products);
        }
    }
}