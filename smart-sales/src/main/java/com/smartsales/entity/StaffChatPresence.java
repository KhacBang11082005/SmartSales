package com.smartsales.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff_chat_presence")
public class StaffChatPresence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nhân viên đang sử dụng hệ thống chat.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "staff_id",
            nullable = false,
            unique = true
    )
    private User staff;

    /**
     * Lần cuối nhân viên gửi heartbeat.
     */
    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;

    // =========================
    // GETTERS / SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStaff() {
        return staff;
    }

    public void setStaff(User staff) {
        this.staff = staff;
    }

    public LocalDateTime getLastSeenAt() {
        return lastSeenAt;
    }

    public void setLastSeenAt(LocalDateTime lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }
}