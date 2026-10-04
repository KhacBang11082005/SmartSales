package com.smartsales.service;

import com.smartsales.entity.Customer;
import com.smartsales.entity.Product;
import com.smartsales.entity.Review;
import com.smartsales.repository.CustomerRepository;
import com.smartsales.repository.ProductRepository;
import com.smartsales.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    // =========================================================
    // KIỂM TRA KHÁCH HÀNG CÓ ĐƯỢC ĐÁNH GIÁ SẢN PHẨM HAY KHÔNG
    //
    // Điều kiện:
    // 1. Customer tồn tại
    // 2. Product tồn tại
    // 3. Customer đã mua Product
    // 4. Đơn hàng chứa Product phải COMPLETED
    // =========================================================
    @Transactional(readOnly = true)
    public boolean canReview(Long customerId, Long productId) {

        if (customerId == null || productId == null) {
            return false;
        }

        boolean customerExists = customerRepository.existsById(customerId);

        if (!customerExists) {
            return false;
        }

        boolean productExists = productRepository.existsById(productId);

        if (!productExists) {
            return false;
        }

        return reviewRepository.hasCompletedPurchase(
                customerId,
                productId
        );
    }
    @Transactional(readOnly = true)
    public Map<Integer, Long> getRatingDistribution(Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException("Không tìm thấy sản phẩm.");
        }

        List<Object[]> results =
                reviewRepository.getRatingDistribution(productId);

        Map<Integer, Long> distribution = new LinkedHashMap<>();

        // Luôn trả đủ 5 mức sao
        for (int rating = 5; rating >= 1; rating--) {
            distribution.put(rating, 0L);
        }

        for (Object[] row : results) {
            Integer rating = ((Number) row[0]).intValue();
            Long count = ((Number) row[1]).longValue();

            distribution.put(rating, count);
        }

        return distribution;
    }

    // =========================================================
    // TẠO ĐÁNH GIÁ MỚI
    //
    // Chưa xử lý media ở bước này.
    // Media sẽ được xử lý ở bước upload riêng.
    // =========================================================
    public Review createReview(
            Long customerId,
            Long productId,
            Integer rating,
            String comment
    ) {

        validateCustomerAndProduct(
                customerId,
                productId
        );

        // -----------------------------------------------------
        // KHÁCH PHẢI ĐÃ MUA VÀ ĐƠN PHẢI COMPLETED
        // -----------------------------------------------------
        if (!reviewRepository.hasCompletedPurchase(
                customerId,
                productId
        )) {
            throw new IllegalArgumentException(
                    "Bạn chỉ có thể đánh giá sản phẩm đã mua và đơn hàng đã hoàn thành."
            );
        }

        // -----------------------------------------------------
        // MỖI KHÁCH CHỈ ĐƯỢC 1 ĐÁNH GIÁ / 1 SẢN PHẨM
        // -----------------------------------------------------
        if (reviewRepository
                .findByCustomerIdAndProductId(customerId, productId)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Bạn đã đánh giá sản phẩm này. Vui lòng chỉnh sửa đánh giá hiện tại."
            );
        }

        // -----------------------------------------------------
        // KIỂM TRA SỐ SAO
        // -----------------------------------------------------
        validateRating(rating);

        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy khách hàng."
                        )
                );

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy sản phẩm."
                        )
                );

        Review review = new Review();
        review.setCustomer(customer);
        review.setProduct(product);
        review.setRating(rating);
        review.setComment(normalizeComment(comment));

        LocalDateTime now = LocalDateTime.now();
        review.setCreatedAt(now);
        review.setUpdatedAt(now);

        return reviewRepository.save(review);
    }


    // =========================================================
    // CHỈNH SỬA ĐÁNH GIÁ
    //
    // Khách chỉ được chỉnh sửa đánh giá của chính mình.
    // =========================================================
    public Review updateReview(
            Long customerId,
            Long productId,
            Integer rating,
            String comment
    ) {

        validateCustomerAndProduct(
                customerId,
                productId
        );

        Review review = reviewRepository
                .findByCustomerIdAndProductId(
                        customerId,
                        productId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Bạn chưa có đánh giá cho sản phẩm này."
                        )
                );

        validateRating(rating);

        review.setRating(rating);
        review.setComment(normalizeComment(comment));
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }


    // =========================================================
    // LẤY ĐÁNH GIÁ CỦA KHÁCH ĐỐI VỚI 1 SẢN PHẨM
    // =========================================================
    @Transactional(readOnly = true)
    public Review getMyReview(
            Long customerId,
            Long productId
    ) {

        return reviewRepository
                .findByCustomerIdAndProductId(
                        customerId,
                        productId
                )
                .orElse(null);
    }


    // =========================================================
    // LẤY TOÀN BỘ ĐÁNH GIÁ CỦA SẢN PHẨM
    // =========================================================
    @Transactional(readOnly = true)
    public List<Review> getProductReviews(
            Long productId
    ) {

        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException(
                    "Không tìm thấy sản phẩm."
            );
        }

        return reviewRepository
                .findByProductIdOrderByCreatedAtDesc(productId);
    }


    // =========================================================
    // LẤY SỐ LƯỢT ĐÁNH GIÁ
    // =========================================================
    @Transactional(readOnly = true)
    public long getReviewCount(
            Long productId
    ) {

        return reviewRepository.countByProductId(productId);
    }


    // =========================================================
    // LẤY ĐIỂM TRUNG BÌNH
    // =========================================================
    @Transactional(readOnly = true)
    public double getAverageRating(
            Long productId
    ) {

        Double average = reviewRepository
                .getAverageRating(productId);

        if (average == null) {
            return 0.0;
        }

        return Math.round(average * 100.0) / 100.0;
    }
    @Transactional(readOnly = true)
    public Review getReviewById(Long reviewId) {

        if (reviewId == null) {
            return null;
        }

        return reviewRepository
                .findReviewById(reviewId)
                .orElse(null);
    }

    // =========================================================
    // KIỂM TRA CUSTOMER + PRODUCT
    // =========================================================
    private void validateCustomerAndProduct(
            Long customerId,
            Long productId
    ) {

        if (customerId == null) {
            throw new IllegalArgumentException(
                    "Không xác định được khách hàng."
            );
        }

        if (productId == null) {
            throw new IllegalArgumentException(
                    "Không xác định được sản phẩm."
            );
        }

        if (!customerRepository.existsById(customerId)) {
            throw new IllegalArgumentException(
                    "Không tìm thấy khách hàng."
            );
        }

        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException(
                    "Không tìm thấy sản phẩm."
            );
        }
    }


    // =========================================================
    // KIỂM TRA SỐ SAO
    // =========================================================
    private void validateRating(Integer rating) {

        if (rating == null) {
            throw new IllegalArgumentException(
                    "Vui lòng chọn số sao đánh giá."
            );
        }

        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException(
                    "Số sao đánh giá phải từ 1 đến 5."
            );
        }
    }


    // =========================================================
    // XỬ LÝ COMMENT
    // =========================================================
    private String normalizeComment(String comment) {

        if (comment == null) {
            return null;
        }

        String result = comment.trim();

        if (result.isEmpty()) {
            return null;
        }

        return result;
    }
}