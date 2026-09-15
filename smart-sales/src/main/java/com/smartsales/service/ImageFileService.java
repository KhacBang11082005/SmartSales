
package com.smartsales.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Service dùng để quản lý file ảnh trong thư mục uploads/
 *
 * Chức năng:
 * - Xóa ảnh vật lý khỏi server
 * - Chỉ cho phép xóa file nằm trong thư mục uploads
 * - Không làm ảnh hưởng đến các file bên ngoài uploads
 */
@Service
public class ImageFileService {

    // =========================================================
    // THƯ MỤC LƯU ẢNH
    //
    // Backend của SmartSales hiện đang lưu ảnh tại:
    //
    // smart-sales/uploads/
    // =========================================================

    private final Path uploadDirectory =
            Paths.get("uploads").toAbsolutePath().normalize();


    // =========================================================
    // XÓA 1 FILE ẢNH
    //
    // imageUrl có dạng:
    //
    // /uploads/abc123.jpg
    //
    // hoặc:
    //
    // /uploads/abc123.png
    // =========================================================

    public void deleteImage(String imageUrl) {

        // ---------------------------------------------------------
        // Không có đường dẫn ảnh thì bỏ qua
        // ---------------------------------------------------------

        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return;
        }


        // ---------------------------------------------------------
        // Chỉ xử lý ảnh được lưu trong /uploads/
        //
        // Tránh trường hợp database chứa:
        // http://...
        // hoặc đường dẫn không thuộc uploads
        // ---------------------------------------------------------

        if (!imageUrl.startsWith("/uploads/")) {
            return;
        }


        try {

            // -----------------------------------------------------
            // Lấy tên file
            //
            // /uploads/abc.jpg
            //
            // => abc.jpg
            // -----------------------------------------------------

            String fileName =
                    imageUrl.substring("/uploads/".length());


            // -----------------------------------------------------
            // Chỉ lấy tên file, không cho phép đường dẫn con
            //
            // Mục đích:
            // tránh Path Traversal như:
            //
            // /uploads/../../something
            // -----------------------------------------------------

            Path imagePath =
                    uploadDirectory
                            .resolve(fileName)
                            .normalize();


            // -----------------------------------------------------
            // Đảm bảo file thực sự nằm trong uploads/
            // -----------------------------------------------------

            if (!imagePath.startsWith(uploadDirectory)) {

                System.err.println(
                        "Không thể xóa file ngoài thư mục uploads: "
                                + imageUrl
                );

                return;
            }


            // -----------------------------------------------------
            // Nếu file tồn tại thì xóa
            // -----------------------------------------------------

            if (Files.exists(imagePath)) {

                Files.delete(imagePath);

                System.out.println(
                        "Đã xóa file ảnh: "
                                + imagePath
                );
            }

        } catch (IOException e) {

            // -----------------------------------------------------
            // Không làm hệ thống crash chỉ vì không xóa được file
            //
            // Database vẫn có thể tiếp tục xử lý.
            // -----------------------------------------------------

            System.err.println(
                    "Không thể xóa file ảnh: "
                            + imageUrl
            );

            e.printStackTrace();
        }
    }
}

