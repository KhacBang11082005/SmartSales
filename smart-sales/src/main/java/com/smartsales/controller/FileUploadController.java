package com.smartsales.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    // =====================================================
    // Thư mục lưu ảnh
    // uploads sẽ nằm ở thư mục gốc của Backend
    // =====================================================
    private final Path uploadDirectory = Paths.get("uploads");
// =========================================================
// UPLOAD NHIỀU ẢNH SẢN PHẨM
//
// ADMIN / EMPLOYEE
//
// Frontend gửi:
// files = nhiều file ảnh
// =========================================================

    @PostMapping("/product-images")
    public ResponseEntity<?> uploadProductImages(
            @RequestParam("files")
            List<MultipartFile> files) {

        try {

            // =====================================================
            // Kiểm tra có ảnh hay không
            // =====================================================

            if (files == null || files.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Vui lòng chọn ít nhất một ảnh."
                        ));
            }


            // =====================================================
            // Danh sách đường dẫn ảnh
            // =====================================================

            List<String> imageUrls = new ArrayList<>();


            // =====================================================
            // Tạo thư mục uploads
            // =====================================================

            Files.createDirectories(uploadDirectory);


            // =====================================================
            // XỬ LÝ TỪNG ẢNH
            // =====================================================

            for (MultipartFile file : files) {

                // -------------------------------------------------
                // File rỗng
                // -------------------------------------------------

                if (file == null || file.isEmpty()) {

                    continue;
                }


                // -------------------------------------------------
                // Kiểm tra loại file
                // -------------------------------------------------

                String contentType =
                        file.getContentType();

                if (
                        contentType == null ||
                                !contentType.startsWith("image/")
                ) {

                    return ResponseEntity
                            .badRequest()
                            .body(Map.of(
                                    "message",
                                    "Chỉ được phép tải lên file ảnh."
                            ));
                }


                // -------------------------------------------------
                // Giới hạn mỗi ảnh 5MB
                // -------------------------------------------------

                if (
                        file.getSize()
                                > 5 * 1024 * 1024
                ) {

                    return ResponseEntity
                            .badRequest()
                            .body(Map.of(
                                    "message",
                                    "Mỗi ảnh không được vượt quá 5MB."
                            ));
                }


                // -------------------------------------------------
                // Lấy phần mở rộng
                // -------------------------------------------------

                String originalFilename =
                        file.getOriginalFilename();

                String extension = "";


                if (
                        originalFilename != null &&
                                originalFilename.contains(".")
                ) {

                    extension =
                            originalFilename.substring(
                                    originalFilename.lastIndexOf(".")
                            );
                }


                // -------------------------------------------------
                // Tạo tên file mới
                // -------------------------------------------------

                String newFileName =
                        UUID.randomUUID()
                                + extension;


                Path targetLocation =
                        uploadDirectory.resolve(
                                newFileName
                        );


                // -------------------------------------------------
                // Lưu ảnh
                // -------------------------------------------------

                Files.copy(
                        file.getInputStream(),
                        targetLocation,
                        StandardCopyOption.REPLACE_EXISTING
                );


                // -------------------------------------------------
                // URL ảnh
                // -------------------------------------------------

                imageUrls.add(
                        "/uploads/" + newFileName
                );
            }


            // =====================================================
            // Trả về danh sách ảnh
            // =====================================================

            return ResponseEntity.ok(
                    Map.of(
                            "imageUrls",
                            imageUrls
                    )
            );


        } catch (IOException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Không thể tải ảnh lên."
                    ));
        }
    }
    // =====================================================
    // API upload ảnh sản phẩm
    // POST: /api/upload/product-image
    // =====================================================
    @PostMapping("/product-image")
    public ResponseEntity<?> uploadProductImage(
            @RequestParam("file") MultipartFile file) {

        try {

            // -------------------------------------------------
            // Kiểm tra file rỗng
            // -------------------------------------------------
            if (file == null || file.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Vui lòng chọn ảnh."
                        ));
            }

            // -------------------------------------------------
            // Kiểm tra loại file
            // -------------------------------------------------
            String contentType = file.getContentType();

            if (contentType == null ||
                    !contentType.startsWith("image/")) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Chỉ được phép tải lên file ảnh."
                        ));
            }

            // -------------------------------------------------
            // Giới hạn dung lượng 5MB
            // -------------------------------------------------
            if (file.getSize() > 5 * 1024 * 1024) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Ảnh không được vượt quá 5MB."
                        ));
            }

            // -------------------------------------------------
            // Tạo thư mục uploads nếu chưa tồn tại
            // -------------------------------------------------
            Files.createDirectories(uploadDirectory);

            // -------------------------------------------------
            // Lấy phần mở rộng của file
            // Ví dụ: .jpg, .png, .webp
            // -------------------------------------------------
            String originalFilename =
                    file.getOriginalFilename();

            String extension = "";

            if (originalFilename != null &&
                    originalFilename.contains(".")) {

                extension = originalFilename.substring(
                        originalFilename.lastIndexOf(".")
                );
            }

            // -------------------------------------------------
            // Tạo tên file mới để tránh trùng
            // -------------------------------------------------
            String newFileName =
                    UUID.randomUUID() + extension;

            Path targetLocation =
                    uploadDirectory.resolve(newFileName);

            // -------------------------------------------------
            // Lưu file
            // -------------------------------------------------
            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // -------------------------------------------------
            // Đường dẫn sẽ lưu vào database
            // -------------------------------------------------
            String imageUrl =
                    "/uploads/" + newFileName;

            return ResponseEntity.ok(
                    Map.of(
                            "imageUrl",
                            imageUrl
                    )
            );

        } catch (IOException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Không thể tải ảnh lên."
                    ));
        }
    }
}