package com.smartsales.repository;

import com.smartsales.entity.ReviewMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewMediaRepository
        extends JpaRepository<ReviewMedia, Long> {

    List<ReviewMedia> findByReviewIdOrderByDisplayOrderAsc(
            Long reviewId
    );

    long countByReviewId(Long reviewId);

    long countByReviewIdAndMediaType(
            Long reviewId,
            String mediaType
    );

    // =========================================================
    // LẤY MEDIA KÈM REVIEW VÀ CUSTOMER
    //
    // Dùng để kiểm tra quyền sở hữu khi xóa media.
    // =========================================================

    @Query("""
            SELECT rm
            FROM ReviewMedia rm
            JOIN FETCH rm.review r
            JOIN FETCH r.customer c
            WHERE rm.id = :mediaId
            """)
    Optional<ReviewMedia> findByIdWithReviewAndCustomer(
            @Param("mediaId") Long mediaId
    );
}