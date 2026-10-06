package com.smartsales.controller;

import com.smartsales.entity.Review;
import com.smartsales.entity.ReviewMedia;
import com.smartsales.entity.User;
import com.smartsales.service.ReviewMediaService;
import com.smartsales.service.ReviewService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smartsales.entity.Customer;
import com.smartsales.repository.CustomerRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewMediaService reviewMediaService;
    private final CustomerRepository customerRepository;

    public ReviewController(
            ReviewService reviewService,
            ReviewMediaService reviewMediaService,
            CustomerRepository customerRepository
    ) {
        this.reviewService = reviewService;
        this.reviewMediaService = reviewMediaService;
        this.customerRepository = customerRepository;
    }

    // =========================================================
    // 1. LẤY ĐÁNH GIÁ CỦA MỘT SẢN PHẨM
    //
    // GET /api/reviews/product/{productId}
    // =========================================================

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(
            @PathVariable Long productId
    ) {

        try {

            List<Review> reviews =
                    reviewService.getProductReviews(
                            productId
                    );

            List<ReviewResponse> response =
                    reviews.stream()
                            .map(this::toResponse)
                            .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // 2. LẤY THỐNG KÊ ĐÁNH GIÁ CỦA SẢN PHẨM
    //
    // GET /api/reviews/product/{productId}/summary
    // =========================================================

    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<?> getProductReviewSummary(
            @PathVariable Long productId
    ) {

        try {

            double averageRating =
                    reviewService.getAverageRating(
                            productId
                    );

            long reviewCount =
                    reviewService.getReviewCount(
                            productId
                    );

            return ResponseEntity.ok(
                    new ReviewSummaryResponse(
                            averageRating,
                            reviewCount
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // 3. KIỂM TRA KHÁCH HÀNG CÓ ĐƯỢC ĐÁNH GIÁ KHÔNG
    //
    // GET /api/reviews/product/{productId}/can-review
    // =========================================================

    @GetMapping("/product/{productId}/can-review")
    public ResponseEntity<?> canReview(
            Authentication authentication,
            @PathVariable Long productId
    ) {

        User user =
                (User) authentication.getPrincipal();

        boolean canReview =
                reviewService.canReview(
                        getCustomerId(user),
                        productId
                );

        return ResponseEntity.ok(
                new CanReviewResponse(
                        canReview
                )
        );
    }

    // =========================================================
    // 4. LẤY ĐÁNH GIÁ CỦA CUSTOMER HIỆN TẠI
    //
    // GET /api/reviews/product/{productId}/my-review
    //
    // API cũ vẫn giữ nguyên để không phá chức năng hiện tại.
    // =========================================================

    @GetMapping("/product/{productId}/my-review")
    public ResponseEntity<?> getMyReview(
            Authentication authentication,
            @PathVariable Long productId
    ) {

        User user =
                (User) authentication.getPrincipal();

        Review review =
                reviewService.getMyReview(
                        getCustomerId(user),
                        productId
                );

        if (review == null) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(
                toResponse(review)
        );
    }

    // =========================================================
    // 4A. LẤY REVIEW THEO ORDER DETAIL
    //
    // GET
    // /api/reviews/order-detail/{orderDetailId}
    //
    // Dùng để xác định chính xác:
    // sản phẩm này trong ĐƠN HÀNG NÀO đã được đánh giá.
    //
    // Đây là API mới, không thay thế API cũ.
    // =========================================================

    @GetMapping("/order-detail/{orderDetailId}")
    public ResponseEntity<?> getMyReviewByOrderDetail(
            Authentication authentication,
            @PathVariable Long orderDetailId
    ) {

        try {

            User user =
                    (User) authentication.getPrincipal();

            Long customerId =
                    getCustomerId(user);

            Review review =
                    reviewService.getMyReviewByOrderDetail(
                            customerId,
                            null,
                            orderDetailId
                    );

            if (review == null) {
                return ResponseEntity.ok(null);
            }

            return ResponseEntity.ok(
                    toResponse(review)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // 5. TẠO ĐÁNH GIÁ
    //
    // POST /api/reviews/product/{productId}
    //
    // Body:
    //
    // {
    //     "orderDetailId": 16,
    //     "rating": 5,
    //     "comment": "Sản phẩm rất tốt"
    // }
    // =========================================================

    @PostMapping("/product/{productId}")
    public ResponseEntity<?> createReview(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestBody ReviewRequest request
    ) {

        try {

            User user =
                    (User) authentication.getPrincipal();

            Review review =
                    reviewService.createReview(
                            getCustomerId(user),
                            productId,
                            request.getOrderDetailId(),
                            request.getRating(),
                            request.getComment()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            toResponse(review)
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // 6. SỬA ĐÁNH GIÁ
    //
    // PUT /api/reviews/product/{productId}
    //
    // Body:
    //
    // {
    //     "orderDetailId": 16,
    //     "rating": 4,
    //     "comment": "Sau khi sử dụng..."
    // }
    // =========================================================

    @PutMapping("/product/{productId}")
    public ResponseEntity<?> updateReview(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestBody ReviewRequest request
    ) {

        try {

            User user =
                    (User) authentication.getPrincipal();

            Review review =
                    reviewService.updateReview(
                            getCustomerId(user),
                            productId,
                            request.getOrderDetailId(),
                            request.getRating(),
                            request.getComment()
                    );

            return ResponseEntity.ok(
                    toResponse(review)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // 7. UPLOAD ẢNH / VIDEO CHO REVIEW
    //
    // POST /api/reviews/{reviewId}/media
    // =========================================================

    @PostMapping(
            value = "/{reviewId}/media",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> uploadMedia(
            Authentication authentication,
            @PathVariable Long reviewId,
            @RequestParam("files")
            List<MultipartFile> files
    ) {

        try {

            User user =
                    (User) authentication.getPrincipal();

            Review review =
                    reviewService.getReviewById(
                            reviewId
                    );

            if (review == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Không tìm thấy đánh giá."
                                )
                        );
            }

            Long customerId =
                    getCustomerId(user);

            if (!review
                    .getCustomer()
                    .getId()
                    .equals(customerId)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new MessageResponse(
                                        "Bạn không có quyền chỉnh sửa đánh giá này."
                                )
                        );
            }

            List<ReviewMedia> media =
                    reviewMediaService.uploadMedia(
                            reviewId,
                            files
                    );

            return ResponseEntity.ok(
                    media.stream()
                            .map(this::toMediaResponse)
                            .collect(Collectors.toList())
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // 8. XÓA MEDIA REVIEW
    //
    // DELETE /api/reviews/media/{mediaId}
    // =========================================================

    @DeleteMapping("/media/{mediaId}")
    public ResponseEntity<?> deleteMedia(
            Authentication authentication,
            @PathVariable Long mediaId
    ) {

        try {

            User user =
                    (User) authentication.getPrincipal();

            Long customerId =
                    getCustomerId(user);

            ReviewMedia media =
                    reviewMediaService.getMediaById(
                            mediaId
                    );

            if (media == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new MessageResponse(
                                        "Không tìm thấy ảnh/video đánh giá."
                                )
                        );
            }

            if (media.getReview() == null ||
                    media.getReview().getCustomer() == null) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new MessageResponse(
                                        "Không xác định được chủ sở hữu media."
                                )
                        );
            }

            Long reviewCustomerId =
                    media
                            .getReview()
                            .getCustomer()
                            .getId();

            if (!reviewCustomerId.equals(
                    customerId
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new MessageResponse(
                                        "Bạn không có quyền xóa ảnh/video này."
                                )
                        );
            }

            reviewMediaService.deleteMedia(
                    mediaId
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Đã xóa ảnh/video đánh giá."
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // 9. LẤY RATING DISTRIBUTION
    //
    // GET /api/reviews/product/{productId}/rating-distribution
    // =========================================================

    @GetMapping("/product/{productId}/rating-distribution")
    public ResponseEntity<?> getRatingDistribution(
            @PathVariable Long productId
    ) {

        try {

            Map<Integer, Long> distribution =
                    reviewService.getRatingDistribution(
                            productId
                    );

            return ResponseEntity.ok(
                    distribution
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // LẤY CUSTOMER ID TỪ USER ĐĂNG NHẬP
    // =========================================================

    private Long getCustomerId(User user) {

        if (user == null || user.getId() == null) {

            throw new IllegalArgumentException(
                    "Không xác định được tài khoản đăng nhập."
            );
        }

        Customer customer =
                customerRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Không tìm thấy thông tin khách hàng."
                                )
                        );

        return customer.getId();
    }

    // =========================================================
    // REVIEW -> RESPONSE
    // =========================================================

    private ReviewResponse toResponse(
            Review review
    ) {

        if (review == null) {
            return null;
        }

        List<ReviewMediaResponse> media =
                review.getMedia()
                        .stream()
                        .map(this::toMediaResponse)
                        .collect(Collectors.toList());

        String customerName = null;

        if (review.getCustomer() != null &&
                review.getCustomer().getUser() != null) {

            customerName =
                    review.getCustomer()
                            .getUser()
                            .getFullName();
        }

        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                customerName,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUpdatedAt(),
                media
        );
    }

    // =========================================================
    // MEDIA -> RESPONSE
    // =========================================================

    private ReviewMediaResponse toMediaResponse(
            ReviewMedia media
    ) {

        return new ReviewMediaResponse(
                media.getId(),
                media.getMediaType(),
                media.getFileUrl(),
                media.getFileName(),
                media.getFileSize(),
                media.getMimeType(),
                media.getDurationSeconds(),
                media.getDisplayOrder()
        );
    }

    // =========================================================
    // REQUEST
    // =========================================================

    public static class ReviewRequest {

        // ID của OrderDetail mà khách hàng đang đánh giá
        private Long orderDetailId;

        private Integer rating;

        private String comment;

        public ReviewRequest() {
        }

        public Long getOrderDetailId() {
            return orderDetailId;
        }

        public void setOrderDetailId(
                Long orderDetailId
        ) {
            this.orderDetailId = orderDetailId;
        }

        public Integer getRating() {
            return rating;
        }

        public void setRating(
                Integer rating
        ) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(
                String comment
        ) {
            this.comment = comment;
        }
    }

    // =========================================================
    // REVIEW RESPONSE
    // =========================================================

    public static class ReviewResponse {

        private Long id;

        private Long productId;

        private String customerName;

        private Integer rating;

        private String comment;

        private Object createdAt;

        private Object updatedAt;

        private List<ReviewMediaResponse> media;

        public ReviewResponse(
                Long id,
                Long productId,
                String customerName,
                Integer rating,
                String comment,
                Object createdAt,
                Object updatedAt,
                List<ReviewMediaResponse> media
        ) {

            this.id = id;
            this.productId = productId;
            this.customerName = customerName;
            this.rating = rating;
            this.comment = comment;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.media = media;
        }

        public Long getId() {
            return id;
        }

        public Long getProductId() {
            return productId;
        }

        public String getCustomerName() {
            return customerName;
        }

        public Integer getRating() {
            return rating;
        }

        public String getComment() {
            return comment;
        }

        public Object getCreatedAt() {
            return createdAt;
        }

        public Object getUpdatedAt() {
            return updatedAt;
        }

        public List<ReviewMediaResponse> getMedia() {
            return media;
        }
    }

    // =========================================================
    // MEDIA RESPONSE
    // =========================================================

    public static class ReviewMediaResponse {

        private Long id;

        private String mediaType;

        private String fileUrl;

        private String fileName;

        private Long fileSize;

        private String mimeType;

        private Integer durationSeconds;

        private Integer displayOrder;

        public ReviewMediaResponse(
                Long id,
                String mediaType,
                String fileUrl,
                String fileName,
                Long fileSize,
                String mimeType,
                Integer durationSeconds,
                Integer displayOrder
        ) {

            this.id = id;
            this.mediaType = mediaType;
            this.fileUrl = fileUrl;
            this.fileName = fileName;
            this.fileName = fileName;
            this.fileSize = fileSize;
            this.mimeType = mimeType;
            this.durationSeconds = durationSeconds;
            this.displayOrder = displayOrder;
        }

        public Long getId() {
            return id;
        }

        public String getMediaType() {
            return mediaType;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public String getFileName() {
            return fileName;
        }

        public Long getFileSize() {
            return fileSize;
        }

        public String getMimeType() {
            return mimeType;
        }

        public Integer getDurationSeconds() {
            return durationSeconds;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }
    }

    // =========================================================
    // SUMMARY RESPONSE
    // =========================================================

    public static class ReviewSummaryResponse {

        private double averageRating;

        private long reviewCount;

        public ReviewSummaryResponse(
                double averageRating,
                long reviewCount
        ) {

            this.averageRating = averageRating;
            this.reviewCount = reviewCount;
        }

        public double getAverageRating() {
            return averageRating;
        }

        public long getReviewCount() {
            return reviewCount;
        }
    }

    // =========================================================
    // CAN REVIEW RESPONSE
    // =========================================================

    public static class CanReviewResponse {

        private boolean canReview;

        public CanReviewResponse(
                boolean canReview
        ) {

            this.canReview = canReview;
        }

        public boolean isCanReview() {
            return canReview;
        }
    }

    // =========================================================
    // MESSAGE RESPONSE
    // =========================================================

    public static class MessageResponse {

        private String message;

        public MessageResponse(
                String message
        ) {

            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(
                String message
        ) {

            this.message = message;
        }
    }
}