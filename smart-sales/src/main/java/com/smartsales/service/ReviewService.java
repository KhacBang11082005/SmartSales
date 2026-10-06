package com.smartsales.service;

import com.smartsales.entity.Customer;
import com.smartsales.entity.OrderDetail;
import com.smartsales.entity.Product;
import com.smartsales.entity.Review;
import com.smartsales.repository.CustomerRepository;
import com.smartsales.repository.OrderDetailRepository;
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
    private final OrderDetailRepository orderDetailRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            OrderDetailRepository orderDetailRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderDetailRepository = orderDetailRepository;
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
    public boolean canReview(
            Long customerId,
            Long productId
    ) {

        if (customerId == null || productId == null) {
            return false;
        }

        boolean customerExists =
                customerRepository.existsById(customerId);

        if (!customerExists) {
            return false;
        }

        boolean productExists =
                productRepository.existsById(productId);

        if (!productExists) {
            return false;
        }

        return reviewRepository.hasCompletedPurchase(
                customerId,
                productId
        );
    }


    // =========================================================
    // PHÂN BỐ SỐ SAO
    // =========================================================
    @Transactional(readOnly = true)
    public Map<Integer, Long> getRatingDistribution(
            Long productId
    ) {

        if (productId == null
                || !productRepository.existsById(productId)) {

            throw new IllegalArgumentException(
                    "Không tìm thấy sản phẩm."
            );
        }

        List<Object[]> results =
                reviewRepository.getRatingDistribution(productId);

        Map<Integer, Long> distribution =
                new LinkedHashMap<>();

        // Luôn trả đủ 5 mức sao
        for (int rating = 5; rating >= 1; rating--) {
            distribution.put(rating, 0L);
        }

        for (Object[] row : results) {

            Integer rating =
                    ((Number) row[0]).intValue();

            Long count =
                    ((Number) row[1]).longValue();

            distribution.put(rating, count);
        }

        return distribution;
    }


    // =========================================================
    // TẠO ĐÁNH GIÁ MỚI
    //
    // REVIEW MỚI BẮT BUỘC GẮN VỚI ORDER DETAIL
    //
    // Ví dụ:
    //
    // Order #31
    //   -> OrderDetail #18
    //   -> Product #1
    //   -> Review
    //
    // Order #32
    //   -> OrderDetail #19
    //   -> Product #1
    //   -> Review khác
    //
    // Hai review có thể cùng customer + product
    // nhưng khác orderDetail.
    // =========================================================
    public Review createReview(
            Long customerId,
            Long productId,
            Long orderDetailId,
            Integer rating,
            String comment
    ) {

        validateCustomerAndProduct(
                customerId,
                productId
        );

        if (orderDetailId == null) {

            throw new IllegalArgumentException(
                    "Không xác định được sản phẩm trong đơn hàng."
            );
        }


        // -----------------------------------------------------
        // LẤY ORDER DETAIL
        // -----------------------------------------------------
        OrderDetail orderDetail =
                orderDetailRepository
                        .findById(orderDetailId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Không tìm thấy sản phẩm trong đơn hàng."
                                )
                        );


        // -----------------------------------------------------
        // ĐẢM BẢO ORDER DETAIL ĐÚNG SẢN PHẨM
        // -----------------------------------------------------
        if (orderDetail.getProduct() == null
                || orderDetail.getProduct().getId() == null
                || !orderDetail.getProduct()
                .getId()
                .equals(productId)) {

            throw new IllegalArgumentException(
                    "Sản phẩm đánh giá không khớp với sản phẩm trong đơn hàng."
            );
        }


        // -----------------------------------------------------
        // ĐẢM BẢO ORDER DETAIL THUỘC VỀ CUSTOMER
        // -----------------------------------------------------
        if (orderDetail.getOrder() == null
                || orderDetail.getOrder().getCustomer() == null
                || orderDetail.getOrder()
                .getCustomer()
                .getId() == null
                || !orderDetail.getOrder()
                .getCustomer()
                .getId()
                .equals(customerId)) {

            throw new IllegalArgumentException(
                    "Đơn hàng không thuộc về khách hàng hiện tại."
            );
        }


        // -----------------------------------------------------
        // ĐƠN HÀNG PHẢI COMPLETED
        // -----------------------------------------------------
        if (orderDetail.getOrder().getStatus()
                != com.smartsales.entity.Order.Status.COMPLETED) {

            throw new IllegalArgumentException(
                    "Bạn chỉ có thể đánh giá sản phẩm khi đơn hàng đã hoàn thành."
            );
        }


        // -----------------------------------------------------
        // MỖI ORDER DETAIL CHỈ ĐƯỢC 1 REVIEW
        // -----------------------------------------------------
        if (reviewRepository
                .findByOrderDetailId(orderDetailId)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Bạn đã đánh giá sản phẩm trong đơn hàng này. "
                            + "Vui lòng chỉnh sửa đánh giá hiện tại."
            );
        }


        // -----------------------------------------------------
        // KIỂM TRA SỐ SAO
        // -----------------------------------------------------
        validateRating(rating);


        Customer customer =
                customerRepository
                        .findById(customerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Không tìm thấy khách hàng."
                                )
                        );


        Product product =
                productRepository
                        .findById(productId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Không tìm thấy sản phẩm."
                                )
                        );


        // -----------------------------------------------------
        // TẠO REVIEW
        // -----------------------------------------------------
        Review review = new Review();

        review.setCustomer(customer);
        review.setProduct(product);

        // QUAN TRỌNG:
        // Review phải lưu orderDetail
        review.setOrderDetail(orderDetail);

        review.setRating(rating);

        review.setComment(
                normalizeComment(comment)
        );

        LocalDateTime now =
                LocalDateTime.now();

        review.setCreatedAt(now);
        review.setUpdatedAt(now);

        return reviewRepository.save(review);
    }


    // =========================================================
    // CHỈNH SỬA ĐÁNH GIÁ THEO ORDER DETAIL
    // =========================================================
    public Review updateReview(
            Long customerId,
            Long productId,
            Long orderDetailId,
            Integer rating,
            String comment
    ) {

        validateCustomerAndProduct(
                customerId,
                productId
        );

        if (orderDetailId == null) {

            throw new IllegalArgumentException(
                    "Không xác định được sản phẩm trong đơn hàng."
            );
        }


        Review review =
                reviewRepository
                        .findByOrderDetailId(orderDetailId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Bạn chưa có đánh giá cho sản phẩm "
                                                + "trong đơn hàng này."
                                )
                        );


        // -----------------------------------------------------
        // ĐẢM BẢO REVIEW THUỘC VỀ CUSTOMER HIỆN TẠI
        // -----------------------------------------------------
        if (review.getCustomer() == null
                || review.getCustomer().getId() == null
                || !review.getCustomer()
                .getId()
                .equals(customerId)) {

            throw new IllegalArgumentException(
                    "Bạn không có quyền chỉnh sửa đánh giá này."
            );
        }


        // -----------------------------------------------------
        // ĐẢM BẢO REVIEW ĐÚNG PRODUCT
        // -----------------------------------------------------
        if (review.getProduct() == null
                || review.getProduct().getId() == null
                || !review.getProduct()
                .getId()
                .equals(productId)) {

            throw new IllegalArgumentException(
                    "Sản phẩm đánh giá không khớp."
            );
        }


        // -----------------------------------------------------
        // KIỂM TRA SỐ SAO
        // -----------------------------------------------------
        validateRating(rating);


        review.setRating(rating);

        review.setComment(
                normalizeComment(comment)
        );

        review.setUpdatedAt(
                LocalDateTime.now()
        );

        return reviewRepository.save(review);
    }


    // =========================================================
    // LẤY REVIEW CỦA KHÁCH ĐỐI VỚI 1 SẢN PHẨM
    //
    // GIỮ LẠI METHOD CŨ ĐỂ KHÔNG LÀM HỎNG CODE HIỆN TẠI.
    //
    // Method này vẫn phục vụ các chức năng cũ.
    // Review mới được quản lý chính xác theo orderDetail.
    // =========================================================
    @Transactional(readOnly = true)
    public Review getMyReview(
            Long customerId,
            Long productId
    ) {

        if (customerId == null || productId == null) {
            return null;
        }

        return reviewRepository
                .findByCustomerIdAndProductId(
                        customerId,
                        productId
                )
                .orElse(null);
    }


    // =========================================================
    // LẤY REVIEW THEO ORDER DETAIL
    //
    // METHOD CHÍNH
    //
    // Chỉ cần:
    // customerId + orderDetailId
    //
    // orderDetailId xác định:
    // - Đơn hàng
    // - Sản phẩm
    // - Review
    //
    // Đây là method được sử dụng để tải lại review
    // sau khi F5 / reload trang.
    // =========================================================
    @Transactional(readOnly = true)
    public Review getMyReviewByOrderDetail(
            Long customerId,
            Long orderDetailId
    ) {

        if (customerId == null
                || orderDetailId == null) {

            return null;
        }


        // -----------------------------------------------------
        // TÌM REVIEW THEO ORDER DETAIL
        // -----------------------------------------------------
        Review review =
                reviewRepository
                        .findByOrderDetailId(orderDetailId)
                        .orElse(null);

        if (review == null) {
            return null;
        }


        // -----------------------------------------------------
        // REVIEW PHẢI THUỘC VỀ CUSTOMER HIỆN TẠI
        // -----------------------------------------------------
        if (review.getCustomer() == null
                || review.getCustomer().getId() == null
                || !review.getCustomer()
                .getId()
                .equals(customerId)) {

            return null;
        }


        // -----------------------------------------------------
        // REVIEW PHẢI CÓ PRODUCT
        // -----------------------------------------------------
        if (review.getProduct() == null
                || review.getProduct().getId() == null) {

            return null;
        }


        // -----------------------------------------------------
        // REVIEW PHẢI CÓ ORDER DETAIL
        // -----------------------------------------------------
        if (review.getOrderDetail() == null
                || review.getOrderDetail().getId() == null) {

            return null;
        }


        // -----------------------------------------------------
        // ĐẢM BẢO REVIEW ĐÚNG ORDER DETAIL
        // -----------------------------------------------------
        if (!review.getOrderDetail()
                .getId()
                .equals(orderDetailId)) {

            return null;
        }

        return review;
    }


    // =========================================================
    // LẤY REVIEW THEO ORDER DETAIL
    //
    // METHOD TƯƠNG THÍCH VỚI CONTROLLER HIỆN TẠI
    //
    // Controller có thể gọi:
    //
    // getMyReviewByOrderDetail(
    //     customerId,
    //     null,
    //     orderDetailId
    // )
    //
    // productId có thể NULL.
    //
    // KHÔNG được bắt buộc productId khác null ở đây.
    // orderDetailId mới là thông tin chính xác để xác định review.
    // =========================================================
    @Transactional(readOnly = true)
    public Review getMyReviewByOrderDetail(
            Long customerId,
            Long productId,
            Long orderDetailId
    ) {

        // -----------------------------------------------------
        // LẤY REVIEW THEO CUSTOMER + ORDER DETAIL
        // -----------------------------------------------------
        Review review =
                getMyReviewByOrderDetail(
                        customerId,
                        orderDetailId
                );

        if (review == null) {
            return null;
        }


        // -----------------------------------------------------
        // NẾU CONTROLLER CÓ TRUYỀN PRODUCT ID
        // THÌ KIỂM TRA THÊM.
        //
        // Nếu productId == null:
        // KHÔNG kiểm tra productId.
        // -----------------------------------------------------
        if (productId != null) {

            if (review.getProduct() == null
                    || review.getProduct().getId() == null
                    || !review.getProduct()
                    .getId()
                    .equals(productId)) {

                return null;
            }
        }

        return review;
    }


    // =========================================================
    // LẤY TOÀN BỘ ĐÁNH GIÁ CỦA SẢN PHẨM
    // =========================================================
    @Transactional(readOnly = true)
    public List<Review> getProductReviews(
            Long productId
    ) {

        if (productId == null
                || !productRepository.existsById(productId)) {

            throw new IllegalArgumentException(
                    "Không tìm thấy sản phẩm."
            );
        }

        return reviewRepository
                .findByProductIdOrderByCreatedAtDesc(
                        productId
                );
    }


    // =========================================================
    // LẤY SỐ LƯỢT ĐÁNH GIÁ
    // =========================================================
    @Transactional(readOnly = true)
    public long getReviewCount(
            Long productId
    ) {

        if (productId == null) {
            return 0L;
        }

        return reviewRepository.countByProductId(
                productId
        );
    }


    // =========================================================
    // LẤY ĐIỂM TRUNG BÌNH
    // =========================================================
    @Transactional(readOnly = true)
    public double getAverageRating(
            Long productId
    ) {

        if (productId == null) {
            return 0.0;
        }

        Double average =
                reviewRepository.getAverageRating(
                        productId
                );

        if (average == null) {
            return 0.0;
        }

        return Math.round(
                average * 100.0
        ) / 100.0;
    }


    // =========================================================
    // LẤY REVIEW THEO ID
    // =========================================================
    @Transactional(readOnly = true)
    public Review getReviewById(
            Long reviewId
    ) {

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


        if (!customerRepository.existsById(
                customerId
        )) {

            throw new IllegalArgumentException(
                    "Không tìm thấy khách hàng."
            );
        }


        if (!productRepository.existsById(
                productId
        )) {

            throw new IllegalArgumentException(
                    "Không tìm thấy sản phẩm."
            );
        }
    }


    // =========================================================
    // KIỂM TRA SỐ SAO
    // =========================================================
    private void validateRating(
            Integer rating
    ) {

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
    private String normalizeComment(
            String comment
    ) {

        if (comment == null) {
            return null;
        }

        String result =
                comment.trim();

        if (result.isEmpty()) {
            return null;
        }

        return result;
    }
}