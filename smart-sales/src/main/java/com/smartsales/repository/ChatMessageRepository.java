package com.smartsales.repository;

import com.smartsales.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {

    /**
     * Lấy toàn bộ tin nhắn của một cuộc trò chuyện.
     * Tin cũ trước, tin mới sau.
     */
    List<ChatMessage> findByConversationIdOrderByIdAsc(
            Long conversationId
    );

    /**
     * Đánh dấu các tin nhắn của người gửi khác
     * là đã đọc.
     */
    @Modifying
    @Query("""
        UPDATE ChatMessage m
        SET m.readAt = CURRENT_TIMESTAMP
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :userId
          AND m.readAt IS NULL
    """)
    int markMessagesAsRead(
            @Param("conversationId") Long conversationId,
            @Param("userId") Long userId
    );

    /**
     * Đếm số tin nhắn chưa đọc của một cuộc trò chuyện.
     */
    long countByConversationIdAndSenderIdNotAndReadAtIsNull(
            Long conversationId,
            Long senderId
    );

    /**
     * Đếm số tin nhắn chưa đọc mà user nhận được
     * trong nhiều cuộc trò chuyện.
     */
    @Query("""
        SELECT COUNT(m)
        FROM ChatMessage m
        WHERE m.conversation.id IN :conversationIds
          AND m.sender.id <> :userId
          AND m.readAt IS NULL
    """)
    long countUnreadMessages(
            @Param("conversationIds")
            List<Long> conversationIds,

            @Param("userId")
            Long userId
    );
}