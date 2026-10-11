
package com.smartsales.controller;

import com.smartsales.entity.Category;
import com.smartsales.entity.Product;
import com.smartsales.repository.ProductRepository;
import com.smartsales.service.OllamaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final OllamaService ollamaService;
    private final ProductRepository productRepository;

    public AiChatController(
            OllamaService ollamaService,
            ProductRepository productRepository
    ) {
        this.ollamaService = ollamaService;
        this.productRepository = productRepository;
    }

    @PostMapping("/chat")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody ChatRequest request
    ) {
        if (request == null
                || request.getMessage() == null
                || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Vui lòng nhập nội dung cần tư vấn.")
            );
        }

        String question = request.getMessage().trim();

        if (question.length() > 2000) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Tin nhắn không được vượt quá 2000 ký tự.")
            );
        }

        try {
            List<Product> products = findRelevantProducts(question);
            String productContext = buildProductContext(products);

            String reply = ollamaService.chat(
                    question,
                    productContext
            );

            return ResponseEntity.ok(
                    Map.of("reply", reply)
            );

        } catch (Exception e) {
            // Ghi lỗi ở backend, không trả chi tiết nội bộ cho khách hàng.
            System.err.println(
                    "Lỗi AI SmartSales: " + e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "message",
                            "AI hiện chưa thể trả lời. Bạn vui lòng thử lại sau."
                    ));
        }
    }

    private List<Product> findRelevantProducts(String question) {
        Map<Long, Product> found = new LinkedHashMap<>();

        // Tìm theo từng từ có ý nghĩa để không phụ thuộc vào
        // việc khách nhập nguyên văn tên sản phẩm.
        String[] words = question
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                .split("\\s+");

        for (String word : words) {
            if (word.length() < 3 || found.size() >= 10) {
                continue;
            }

            List<Product> byName =
                    productRepository
                            .findTop10ByStatusAndCategory_StatusAndNameContainingIgnoreCase(
                                    Product.Status.ACTIVE,
                                    Category.Status.ACTIVE,
                                    word
                            );

            for (Product product : byName) {
                found.putIfAbsent(product.getId(), product);
                if (found.size() >= 10) {
                    break;
                }
            }

            if (found.size() < 10) {
                List<Product> byDescription =
                        productRepository
                                .findTop10ByStatusAndCategory_StatusAndDescriptionContainingIgnoreCase(
                                        Product.Status.ACTIVE,
                                        Category.Status.ACTIVE,
                                        word
                                );

                for (Product product : byDescription) {
                    found.putIfAbsent(product.getId(), product);
                    if (found.size() >= 10) {
                        break;
                    }
                }
            }
        }

        // Nếu chưa tìm được sản phẩm liên quan, cung cấp danh sách
        // sản phẩm đang bán để AI vẫn có thể giới thiệu sản phẩm.
        if (found.isEmpty()) {
            List<Product> latest =
                    productRepository
                            .findTop10ByStatusAndCategory_StatusOrderByIdDesc(
                                    Product.Status.ACTIVE,
                                    Category.Status.ACTIVE
                            );

            for (Product product : latest) {
                found.putIfAbsent(product.getId(), product);
            }
        }

        return new ArrayList<>(found.values());
    }

    private String buildProductContext(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return "Không tìm thấy sản phẩm đang hoạt động trong hệ thống.";
        }

        StringBuilder context = new StringBuilder();

        for (Product product : products) {
            context.append("- Tên: ")
                    .append(product.getName())
                    .append("\n");

            context.append("  Giá: ")
                    .append(product.getPrice())
                    .append(" VND\n");

            context.append("  Số lượng tồn kho: ")
                    .append(product.getQuantity())
                    .append("\n");

            if (product.getCategory() != null) {
                context.append("  Danh mục: ")
                        .append(product.getCategory().getName())
                        .append("\n");
            }

            if (product.getDescription() != null
                    && !product.getDescription().isBlank()) {
                context.append("  Mô tả: ")
                        .append(product.getDescription())
                        .append("\n");
            }

            context.append("\n");
        }

        return context.toString();
    }

    public static class ChatRequest {
        private String message;

        public ChatRequest() {
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
