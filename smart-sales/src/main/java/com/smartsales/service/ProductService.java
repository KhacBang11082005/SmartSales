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

    public List<Product> getAllProducts() {
        return productRepository.findByStatusAndCategory_Status(
                Product.Status.ACTIVE,
                Category.Status.ACTIVE
        );
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElse(null);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

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

    public void deleteProduct(Long id) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy sản phẩm"));

        productRepository.delete(existingProduct);
    }

    // XÓA TẤT CẢ SẢN PHẨM THUỘC DANH MỤC
    public void deleteProductsByCategoryId(Long categoryId) {

        List<Product> products =
                productRepository.findByCategoryId(categoryId);

        if (!products.isEmpty()) {
            productRepository.deleteAll(products);
        }
    }
}