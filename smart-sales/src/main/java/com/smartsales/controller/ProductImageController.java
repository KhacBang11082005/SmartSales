
package com.smartsales.controller;

import com.smartsales.entity.Product;
import com.smartsales.entity.ProductImage;
import com.smartsales.repository.ProductImageRepository;
import com.smartsales.repository.ProductRepository;
import com.smartsales.service.ImageFileService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * =========================================================
 * CONTROLLER QUẢN LÝ ẢNH SẢN PHẨM
 *
 * Chức năng:
 *
 * GET:
 *     Lấy danh sách ảnh sản phẩm
 *
 * POST:
 *     Thêm nhiều ảnh vào sản phẩm
 *
 * DELETE:
 *     Xóa một ảnh cũ
 *
 * PUT:
 *     Đổi thứ tự ảnh
 *
 * PUT:
 *     Chọn ảnh chính
 *
 * =========================================================
 */
@RestController
@RequestMapping("/api/products")
public class ProductImageController {

    private final ProductRepository productRepository;

    private final ProductImageRepository productImageRepository;

    private final ImageFileService imageFileService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ProductImageController(
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
    // 1. LẤY DANH SÁCH ẢNH
    //
    // GET:
    // /api/products/{productId}/images
    //
    // Có thể dùng cho:
    // - Admin
    // - Employee
    // - Customer
    // =========================================================

    @GetMapping("/{productId}/images")
    public ResponseEntity<?> getProductImages(
            @PathVariable Long productId
    ) {

        // -----------------------------------------------------
        // Kiểm tra sản phẩm tồn tại
        // -----------------------------------------------------

        if (!productRepository.existsById(productId)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        // -----------------------------------------------------
        // Lấy ảnh theo thứ tự
        // -----------------------------------------------------

        List<ProductImage> images =
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                productId
                        );


        return ResponseEntity.ok(images);
    }


    // =========================================================
    // 2. THÊM NHIỀU ẢNH
    //
    // POST:
    // /api/products/{productId}/images
    //
    // Body:
    //
    // [
    //     "/uploads/a.jpg",
    //     "/uploads/b.jpg"
    // ]
    //
    // ADMIN + EMPLOYEE
    // =========================================================

    @PostMapping("/{productId}/images")
    public ResponseEntity<?> addProductImages(
            @PathVariable Long productId,
            @RequestBody List<String> imageUrls
    ) {

        // -----------------------------------------------------
        // Tìm sản phẩm
        // -----------------------------------------------------

        Product product =
                productRepository
                        .findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy sản phẩm"
                                )
                        );


        // -----------------------------------------------------
        // Lấy ảnh hiện tại
        // -----------------------------------------------------

        List<ProductImage> currentImages =
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                productId
                        );


        // -----------------------------------------------------
        // Ảnh mới bắt đầu từ vị trí tiếp theo
        // -----------------------------------------------------

        int startOrder =
                currentImages.size() + 1;


        // -----------------------------------------------------
        // Lưu từng ảnh
        // -----------------------------------------------------

        for (int i = 0;
             i < imageUrls.size();
             i++) {

            String imageUrl =
                    imageUrls.get(i);


            // Bỏ qua URL rỗng
            if (
                    imageUrl == null ||
                            imageUrl.trim().isEmpty()
            ) {
                continue;
            }


            ProductImage image =
                    new ProductImage();


            image.setProduct(product);

            image.setImageUrl(imageUrl);

            image.setDisplayOrder(
                    startOrder + i
            );


            // -------------------------------------------------
            // Nếu sản phẩm chưa có ảnh
            // thì ảnh đầu tiên là ảnh chính
            // -------------------------------------------------

            image.setPrimary(
                    currentImages.isEmpty()
                            && i == 0
            );


            productImageRepository.save(image);
        }


        // -----------------------------------------------------
        // Trả danh sách mới nhất
        // -----------------------------------------------------

        return ResponseEntity.ok(
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                productId
                        )
        );
    }


    // =========================================================
    // 3. XÓA ẢNH CŨ
    //
    // DELETE:
    //
    // /api/products/{productId}/images/{imageId}
    //
    // CHỈ ADMIN
    //
    // Khi xóa:
    //
    // 1. Xóa record trong database
    // 2. Xóa file vật lý trong uploads/
    // 3. Nếu ảnh bị xóa là ảnh chính:
    //      → chọn ảnh đầu tiên còn lại làm ảnh chính
    // 4. Cập nhật products.image_url
    // 5. Sắp xếp lại displayOrder
    // =========================================================

    @DeleteMapping("/{productId}/images/{imageId}")
    public ResponseEntity<?> deleteProductImage(
            @PathVariable Long productId,
            @PathVariable Long imageId
    ) {

        // -----------------------------------------------------
        // Tìm sản phẩm
        // -----------------------------------------------------

        Product product =
                productRepository
                        .findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy sản phẩm"
                                )
                        );


        // -----------------------------------------------------
        // Tìm ảnh
        // -----------------------------------------------------

        ProductImage image =
                productImageRepository
                        .findById(imageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy ảnh"
                                )
                        );


        // -----------------------------------------------------
        // Đảm bảo ảnh thực sự thuộc sản phẩm này
        // -----------------------------------------------------

        if (
                image.getProduct() == null ||
                        !image.getProduct()
                                .getId()
                                .equals(product.getId())
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Ảnh không thuộc sản phẩm này."
                    );
        }


        // -----------------------------------------------------
        // Kiểm tra ảnh có phải ảnh chính không
        // -----------------------------------------------------

        boolean wasPrimary =
                Boolean.TRUE.equals(
                        image.getPrimary()
                );


        // -----------------------------------------------------
        // Lưu URL trước khi xóa record
        // -----------------------------------------------------

        String imageUrl =
                image.getImageUrl();


        // -----------------------------------------------------
        // Xóa record trong database
        // -----------------------------------------------------

        productImageRepository.delete(image);


        // -----------------------------------------------------
        // Xóa file vật lý
        // -----------------------------------------------------

        imageFileService.deleteImage(
                imageUrl
        );


        // -----------------------------------------------------
        // Lấy các ảnh còn lại
        // -----------------------------------------------------

        List<ProductImage> remainingImages =
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                productId
                        );


        // =====================================================
        // TRƯỜNG HỢP 1:
        // Không còn ảnh
        // =====================================================

        if (remainingImages.isEmpty()) {

            // Không còn ảnh chính
            product.setImageUrl(null);

            productRepository.save(product);

        }


        // =====================================================
        // TRƯỜNG HỢP 2:
        // Vẫn còn ảnh
        // =====================================================

        else {

            // -------------------------------------------------
            // Sắp xếp lại displayOrder:
            //
            // 1
            // 2
            // 3
            // ...
            // -------------------------------------------------

            for (int i = 0;
                 i < remainingImages.size();
                 i++) {

                remainingImages
                        .get(i)
                        .setDisplayOrder(
                                i + 1
                        );
            }


            // -------------------------------------------------
            // Nếu ảnh vừa xóa là ảnh chính
            // thì chọn ảnh đầu tiên còn lại
            // -------------------------------------------------

            if (wasPrimary) {

                for (ProductImage item :
                        remainingImages) {

                    item.setPrimary(false);
                }


                ProductImage newPrimary =
                        remainingImages.get(0);


                newPrimary.setPrimary(true);


                // ---------------------------------------------
                // products.image_url cũng phải cập nhật
                // ---------------------------------------------

                product.setImageUrl(
                        newPrimary.getImageUrl()
                );

            }


            // -------------------------------------------------
            // Nếu ảnh chính cũ vẫn còn
            // thì đảm bảo products.image_url
            // vẫn khớp ảnh chính
            // -------------------------------------------------

            else {

                ProductImage primary =
                        remainingImages
                                .stream()
                                .filter(item ->
                                        Boolean.TRUE.equals(
                                                item.getPrimary()
                                        )
                                )
                                .findFirst()
                                .orElse(
                                        remainingImages.get(0)
                                );


                // Đảm bảo luôn có ảnh chính
                for (ProductImage item :
                        remainingImages) {

                    item.setPrimary(
                            item.getId()
                                    .equals(
                                            primary.getId()
                                    )
                    );
                }


                product.setImageUrl(
                        primary.getImageUrl()
                );
            }


            // -------------------------------------------------
            // Lưu các thay đổi
            // -------------------------------------------------

            productImageRepository.saveAll(
                    remainingImages
            );

            productRepository.save(product);
        }


        // -----------------------------------------------------
        // Trả danh sách ảnh mới
        // -----------------------------------------------------

        return ResponseEntity.ok(
                remainingImages
        );
    }


    // =========================================================
    // 4. ĐỔI THỨ TỰ ẢNH
    //
    // PUT:
    //
    // /api/products/{productId}/images/reorder
    //
    // Body:
    //
    // [
    //     5,
    //     2,
    //     8,
    //     1
    // ]
    //
    // Nghĩa là:
    //
    // Ảnh ID 5 → vị trí 1
    // Ảnh ID 2 → vị trí 2
    // Ảnh ID 8 → vị trí 3
    // Ảnh ID 1 → vị trí 4
    //
    // CHỈ ADMIN
    // =========================================================

    @PutMapping("/{productId}/images/reorder")
    public ResponseEntity<?> reorderProductImages(
            @PathVariable Long productId,
            @RequestBody List<Long> imageIds
    ) {

        // -----------------------------------------------------
        // Kiểm tra sản phẩm
        // -----------------------------------------------------

        if (!productRepository.existsById(productId)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        // -----------------------------------------------------
        // Lấy ảnh hiện tại
        // -----------------------------------------------------

        List<ProductImage> currentImages =
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                productId
                        );


        // -----------------------------------------------------
        // Kiểm tra số lượng
        // -----------------------------------------------------

        if (
                imageIds == null ||
                        imageIds.size() != currentImages.size()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Danh sách thứ tự ảnh không hợp lệ."
                    );
        }


        // -----------------------------------------------------
        // Kiểm tra tất cả ID có thuộc sản phẩm không
        // -----------------------------------------------------

        for (Long imageId : imageIds) {

            boolean exists =
                    currentImages
                            .stream()
                            .anyMatch(image ->
                                    image.getId()
                                            .equals(imageId)
                            );


            if (!exists) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Ảnh không thuộc sản phẩm."
                        );
            }
        }


        // -----------------------------------------------------
        // Cập nhật displayOrder
        // -----------------------------------------------------

        for (int i = 0;
             i < imageIds.size();
             i++) {

            Long imageId =
                    imageIds.get(i);


            for (ProductImage image :
                    currentImages) {

                if (
                        image.getId()
                                .equals(imageId)
                ) {

                    image.setDisplayOrder(
                            i + 1
                    );

                    break;
                }
            }
        }


        // -----------------------------------------------------
        // Lưu
        // -----------------------------------------------------

        productImageRepository.saveAll(
                currentImages
        );


        // -----------------------------------------------------
        // Trả danh sách sau khi sắp xếp
        // -----------------------------------------------------

        return ResponseEntity.ok(
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                productId
                        )
        );
    }


    // =========================================================
    // 5. CHỌN ẢNH CHÍNH
    //
    // PUT:
    //
    // /api/products/{productId}/images/{imageId}/primary
    //
    // CHỈ ADMIN
    //
    // Khi chọn:
    //
    // product_images.is_primary = true
    //
    // đồng thời:
    //
    // products.image_url = URL ảnh chính
    //
    // =========================================================

    @PutMapping(
            "/{productId}/images/{imageId}/primary"
    )
    public ResponseEntity<?> setPrimaryImage(
            @PathVariable Long productId,
            @PathVariable Long imageId
    ) {

        // -----------------------------------------------------
        // Tìm sản phẩm
        // -----------------------------------------------------

        Product product =
                productRepository
                        .findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy sản phẩm"
                                )
                        );


        // -----------------------------------------------------
        // Tìm ảnh
        // -----------------------------------------------------

        ProductImage selectedImage =
                productImageRepository
                        .findById(imageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy ảnh"
                                )
                        );


        // -----------------------------------------------------
        // Đảm bảo ảnh thuộc sản phẩm
        // -----------------------------------------------------

        if (
                selectedImage.getProduct() == null ||
                        !selectedImage
                                .getProduct()
                                .getId()
                                .equals(productId)
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Ảnh không thuộc sản phẩm này."
                    );
        }


        // -----------------------------------------------------
        // Lấy tất cả ảnh
        // -----------------------------------------------------

        List<ProductImage> images =
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                productId
                        );


        // -----------------------------------------------------
        // Chỉ duy nhất một ảnh là ảnh chính
        // -----------------------------------------------------

        for (ProductImage image :
                images) {

            image.setPrimary(
                    image.getId()
                            .equals(imageId)
            );
        }


        // -----------------------------------------------------
        // products.image_url
        // phải trỏ tới ảnh chính
        // -----------------------------------------------------

        product.setImageUrl(
                selectedImage.getImageUrl()
        );


        // -----------------------------------------------------
        // Lưu
        // -----------------------------------------------------

        productImageRepository.saveAll(
                images
        );

        productRepository.save(product);


        // -----------------------------------------------------
        // Trả về danh sách mới
        // -----------------------------------------------------

        return ResponseEntity.ok(
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                productId
                        )
        );
    }
}

