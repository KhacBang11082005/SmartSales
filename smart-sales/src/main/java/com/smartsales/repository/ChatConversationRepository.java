package com.smartsales.repository;

import com.smartsales.entity.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository
        extends JpaRepository<ChatConversation, Long> {

    /**
     * Lấy các cuộc trò chuyện của một khách hàng,
     * mới nhất lên trước.
     */
    List<ChatConversation> findByCustomerIdOrderByLastMessageAtDescIdDesc(
            Long customerId
    );

    /**
     * Lấy cuộc trò chuyện đang hoạt động của khách hàng.
     */
    Optional<ChatConversation> findFirstByCustomerIdAndStatusInOrderByIdDesc(
            Long customerId,
            List<ChatConversation.Status> statuses
    );

    /**
     * Lấy các cuộc trò chuyện được phân cho một nhân viên.
     */
    List<ChatConversation> findByStaffIdAndStatusInOrderByLastMessageAtDescIdDesc(
            Long staffId,
            List<ChatConversation.Status> statuses
    );

    /**
     * Đếm số cuộc trò chuyện nhân viên đang xử lý.
     *
     * Dùng để phân khách cho nhân viên có ít tải nhất.
     */
    long countByStaffIdAndStatusIn(
            Long staffId,
            List<ChatConversation.Status> statuses
    );

    /**
     * Lấy các yêu cầu đang chờ.
     */
    List<ChatConversation> findByStatusOrderByRequestedAtAsc(
            ChatConversation.Status status
    );

    /**
     * Tìm cuộc trò chuyện thuộc về khách hàng
     * và nhân viên cụ thể.
     */
    Optional<ChatConversation> findByIdAndCustomerId(
            Long id,
            Long customerId
    );

    /**
     * Tìm cuộc trò chuyện thuộc về nhân viên cụ thể.
     */
    Optional<ChatConversation> findByIdAndStaffId(
            Long id,
            Long staffId
    );

    /**
     * Lấy danh sách cuộc trò chuyện đang chờ hoặc đã
     * được phân công nhưng chưa đóng.
     *
     * Query này dùng cho Inbox nhân viên.
     */
    @Query("""
        SELECT c
        FROM ChatConversation c
        WHERE c.status IN :statuses
        ORDER BY
            CASE
                WHEN c.status = com.smartsales.entity.ChatConversation$Status.WAITING
                THEN 0
                ELSE 1
            END,
            c.lastMessageAt DESC,
            c.requestedAt DESC
    """)
    List<ChatConversation> findInboxConversations(
            @Param("statuses")
            List<ChatConversation.Status> statuses
    );
}