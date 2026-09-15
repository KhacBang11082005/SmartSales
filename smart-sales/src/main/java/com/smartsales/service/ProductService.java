
package com.smartsales.service;

import com.smartsales.entity.Category;
import com.smartsales.entity.Product;
import com.smartsales.entity.ProductImage;
import com.smartsales.repository.ProductImageRepository;
import com.smartsales.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    private final ProductImageRepository productImageRepository;

    private final ImageFileService imageFileService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ProductService(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            ImageFileService imageFileService
    ) {

        this.productRepository =
                productRepository;

        this.productImageRepository =
                productImageRepository;

        this.imageFileService =
                imageFileService;
    }


    // =========================================================
    // DÀNH CHO KHÁCH HÀNG
    //
    // Chỉ lấy sản phẩm đang bán
    // + danh mục đang hoạt động
    // =========================================================

    public List<Product> getAllProducts() {

        return productRepository
                .findByStatusAndCategory_Status(
                        Product.Status.ACTIVE,
                        Category.Status.ACTIVE
                );
    }


    // =========================================================
    // DÀNH CHO ADMIN / EMPLOYEE
    //
    // Lấy toàn bộ sản phẩm
    // kể cả sản phẩm INACTIVE
    // =========================================================

    public List<Product> getAllProductsForManagement() {

        return productRepository.findAll();
    }


    // =========================================================
    // CHI TIẾT SẢN PHẨM DÀNH CHO KHÁCH HÀNG
    //
    // Chỉ xem:
    // - Product ACTIVE
    // - Category ACTIVE
    // =========================================================

    public Product getProductById(Long id) {

        return productRepository
                .findById(id)
                .filter(product ->
                        product.getStatus()
                                == Product.Status.ACTIVE

                                && product.getCategory() != null

                                && product.getCategory()
                                .getStatus()
                                == Category.Status.ACTIVE
                )
                .orElse(null);
    }


    // =========================================================
    // CHI TIẾT SẢN PHẨM DÀNH CHO ADMIN / EMPLOYEE
    //
    // Có thể xem cả ACTIVE và INACTIVE
    // =========================================================

    public Product getProductByIdForManagement(Long id) {

        return productRepository
                .findById(id)
                .orElse(null);
    }


    // =========================================================
    // THÊM SẢN PHẨM
    //
    // ADMIN + EMPLOYEE
    // =========================================================

    public Product createProduct(Product product) {

        return productRepository.save(product);
    }


    // =========================================================
    // SỬA SẢN PHẨM
    //
    // ADMIN + EMPLOYEE
    // =========================================================

    public Product updateProduct(
            Long id,
            Product product
    ) {

        Product existingProduct =
                productRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy sản phẩm"
                                )
                        );


        existingProduct.setCategory(
                product.getCategory()
        );

        existingProduct.setName(
                product.getName()
        );

        existingProduct.setDescription(
                product.getDescription()
        );

        existingProduct.setPrice(
                product.getPrice()
        );

        existingProduct.setImageUrl(
                product.getImageUrl()
        );

        existingProduct.setStatus(
                product.getStatus()
        );

        existingProduct.setQuantity(
                product.getQuantity()
        );


        return productRepository.save(
                existingProduct
        );
    }


    // =========================================================
    // XÓA SẢN PHẨM
    //
    // CHỈ ADMIN mới được phép gọi API này
    //
    // Khi xóa:
    //
    // 1. Lấy ảnh chính trong products.image_url
    // 2. Lấy tất cả ảnh trong product_images
    // 3. Xóa file vật lý trong uploads/
    // 4. Xóa sản phẩm trong database
    //
    // =========================================================

    @Transactional
    public void deleteProduct(Long id) {

        // =====================================================
        // 1. TÌM SẢN PHẨM
        // =====================================================

        Product existingProduct =
                productRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy sản phẩm"
                                )
                        );


        // =====================================================
        // 2. TẠO SET CHỨA ĐƯỜNG DẪN ẢNH
        //
        // Dùng Set để tránh xóa cùng một file nhiều lần.
        //
        // Ví dụ:
        //
        // products.image_url
        //       ↓
        // /uploads/abc.jpg
        //
        // product_images
        //       ↓
        // /uploads/abc.jpg
        //
        // Chỉ xóa abc.jpg một lần.
        // =====================================================

        Set<String> imageUrls =
                new HashSet<>();


        // =====================================================
        // 3. LẤY ẢNH CHÍNH CŨ
        //
        // products.image_url
        // =====================================================

        if (
                existingProduct.getImageUrl() != null
                        && !existingProduct
                        .getImageUrl()
                        .trim()
                        .isEmpty()
        ) {

            imageUrls.add(
                    existingProduct.getImageUrl()
            );
        }


        // =====================================================
        // 4. LẤY TẤT CẢ ẢNH TRONG product_images
        // =====================================================

        List<ProductImage> productImages =
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                id
                        );


        for (ProductImage productImage :
                productImages) {

            if (
                    productImage.getImageUrl() != null
                            && !productImage
                            .getImageUrl()
                            .trim()
                            .isEmpty()
            ) {

                imageUrls.add(
                        productImage.getImageUrl()
                );
            }
        }


        // =====================================================
        // 5. XÓA FILE VẬT LÝ TRONG uploads/
        // =====================================================

        for (String imageUrl :
                imageUrls) {

            imageFileService.deleteImage(
                    imageUrl
            );
        }


        // =====================================================
        // 6. XÓA SẢN PHẨM TRONG DATABASE
        //
        // Product đang có:
        //
        // cascade = CascadeType.ALL
        // orphanRemoval = true
        //
        // nên các ProductImage liên quan
        // cũng sẽ được xóa.
        // =====================================================

        productRepository.delete(
                existingProduct
        );
    }


    // =========================================================
    // XÓA TẤT CẢ SẢN PHẨM CỦA MỘT DANH MỤC
    //
    // Dùng khi ADMIN xóa danh mục.
    //
    // Ngoài việc xóa sản phẩm trong database,
    // phải xóa luôn toàn bộ file ảnh của các sản phẩm đó.
    // =========================================================

    @Transactional
    public void deleteProductsByCategoryId(
            Long categoryId
    ) {

        // =====================================================
        // 1. LẤY TẤT CẢ SẢN PHẨM CỦA DANH MỤC
        // =====================================================

        List<Product> products =
                productRepository
                        .findByCategoryId(categoryId);


        // =====================================================
        // Không có sản phẩm thì không cần xử lý
        // =====================================================

        if (products.isEmpty()) {
            return;
        }


        // =====================================================
        // 2. DUYỆT TỪNG SẢN PHẨM
        // =====================================================

        for (Product product :
                products) {

            Set<String> imageUrls =
                    new HashSet<>();


            // -------------------------------------------------
            // ẢNH CHÍNH
            // -------------------------------------------------

            if (
                    product.getImageUrl() != null
                            && !product
                            .getImageUrl()
                            .trim()
                            .isEmpty()
            ) {

                imageUrls.add(
                        product.getImageUrl()
                );
            }


            // -------------------------------------------------
            // CÁC ẢNH TRONG product_images
            // -------------------------------------------------

            List<ProductImage> productImages =
                    productImageRepository
                            .findByProductIdOrderByDisplayOrderAsc(
                                    product.getId()
                            );


            for (ProductImage productImage :
                    productImages) {

                if (
                        productImage.getImageUrl() != null
                                && !productImage
                                .getImageUrl()
                                .trim()
                                .isEmpty()
                ) {

                    imageUrls.add(
                            productImage.getImageUrl()
                    );
                }
            }


            // -------------------------------------------------
            // XÓA FILE ẢNH
            // -------------------------------------------------

            for (String imageUrl :
                    imageUrls) {

                imageFileService.deleteImage(
                        imageUrl
                );
            }
        }


        // =====================================================
        // 3. XÓA TOÀN BỘ SẢN PHẨM
        //
        // Các ProductImage liên quan cũng được xóa
        // nhờ cascade + orphanRemoval.
        // =====================================================

        productRepository.deleteAll(
                products
        );
    }
}

