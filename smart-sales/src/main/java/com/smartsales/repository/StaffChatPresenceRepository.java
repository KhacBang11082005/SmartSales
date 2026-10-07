package com.smartsales.repository;

import com.smartsales.entity.StaffChatPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StaffChatPresenceRepository
        extends JpaRepository<StaffChatPresence, Long> {

    /**
     * Tìm trạng thái online của một nhân viên.
     */
    Optional<StaffChatPresence> findByStaffId(
            Long staffId
    );

    /**
     * Lấy các nhân viên có heartbeat còn mới.
     *
     * :onlineSince sẽ được truyền vào thời điểm
     * hiện tại trừ 30 giây.
     */
    @Query("""
        SELECT p
        FROM StaffChatPresence p
        JOIN FETCH p.staff s
        WHERE p.lastSeenAt >= :onlineSince
        ORDER BY p.lastSeenAt DESC
    """)
    List<StaffChatPresence> findOnlineStaff(
            @Param("onlineSince")
            LocalDateTime onlineSince
    );
}