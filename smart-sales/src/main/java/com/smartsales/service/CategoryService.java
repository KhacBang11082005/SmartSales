package com.smartsales.service;

import com.smartsales.entity.Category;
import com.smartsales.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductService productService;

    public CategoryService(
            CategoryRepository categoryRepository,
            ProductService productService) {

        this.categoryRepository = categoryRepository;
        this.productService = productService;
    }

    // CREATE
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    // READ ALL
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // READ BY ID
    public Category getCategoryById(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy category"
                        ));
    }

    // UPDATE
    public Category updateCategory(
            Long id,
            Category category) {

        Category existingCategory =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy category"
                                ));

        existingCategory.setName(
                category.getName()
        );

        existingCategory.setDescription(
                category.getDescription()
        );

        existingCategory.setStatus(
                category.getStatus()
        );

        return categoryRepository.save(
                existingCategory
        );
    }

    // DELETE CATEGORY + TOÀN BỘ PRODUCT
    public void deleteCategory(Long id) {

        Category existingCategory =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy category"
                                ));

        // 1. Xóa tất cả sản phẩm thuộc danh mục
        productService.deleteProductsByCategoryId(id);

        // 2. Xóa danh mục
        categoryRepository.delete(existingCategory);
    }
}