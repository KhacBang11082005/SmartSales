package com.smartsales.controller;

import com.smartsales.dto.ChatConversationResponse;
import com.smartsales.dto.ChatMessageResponse;
import com.smartsales.dto.CreateChatRequest;
import com.smartsales.dto.SendChatMessageRequest;
import com.smartsales.entity.User;
import com.smartsales.service.ChatService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // =========================================================
    // CUSTOMER
    // TẠO / MỞ CUỘC TRÒ CHUYỆN
    // =========================================================

    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(
            Authentication authentication,
            @RequestBody(required = false)
            CreateChatRequest request
    ) {

        try {

            Long userId =
                    getUserId(authentication);

            ChatConversationResponse response =
                    chatService.createConversation(
                            userId,
                            request
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // CUSTOMER
    // LẤY CUỘC CHAT HIỆN TẠI
    // =========================================================

    @GetMapping("/conversations/current")
    public ResponseEntity<?> getCurrentConversation(
            Authentication authentication
    ) {

        try {

            Long userId =
                    getUserId(authentication);

            ChatConversationResponse response =
                    chatService.getCurrentConversation(
                            userId
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // CUSTOMER
    // LẤY LỊCH SỬ CUỘC TRÒ CHUYỆN
    // =========================================================

    @GetMapping("/conversations/my")
    public ResponseEntity<?> getCustomerConversations(
            Authentication authentication
    ) {

        try {

            Long userId =
                    getUserId(authentication);

            List<ChatConversationResponse> response =
                    chatService.getCustomerConversations(
                            userId
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // EMPLOYEE
    // LẤY INBOX CSKH
    //
    // Bao gồm:
    //
    // WAITING
    // ASSIGNED
    // ACTIVE
    // =========================================================

    @GetMapping("/staff/inbox")
    public ResponseEntity<?> getStaffInbox(
            Authentication authentication
    ) {

        try {

            Long staffId =
                    getUserId(authentication);

            List<ChatConversationResponse> response =
                    chatService.getStaffInbox(
                            staffId
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // EMPLOYEE
    // LẤY CHI TIẾT CUỘC CHAT
    // =========================================================

    @GetMapping("/staff/conversations/{conversationId}")
    public ResponseEntity<?> getStaffConversation(
            Authentication authentication,
            @PathVariable Long conversationId
    ) {

        try {

            Long staffId =
                    getUserId(authentication);

            ChatConversationResponse response =
                    chatService.getStaffConversation(
                            staffId,
                            conversationId
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // EMPLOYEE
    // TIẾP NHẬN CUỘC CHAT
    // =========================================================

    @PostMapping(
            "/staff/conversations/{conversationId}/accept"
    )
    public ResponseEntity<?> acceptConversation(
            Authentication authentication,
            @PathVariable Long conversationId
    ) {

        try {

            Long staffId =
                    getUserId(authentication);

            ChatConversationResponse response =
                    chatService.acceptConversation(
                            staffId,
                            conversationId
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // CUSTOMER / EMPLOYEE
    // LẤY TIN NHẮN
    // =========================================================

    @GetMapping(
            "/conversations/{conversationId}/messages"
    )
    public ResponseEntity<?> getMessages(
            Authentication authentication,
            @PathVariable Long conversationId
    ) {

        try {

            Long userId =
                    getUserId(authentication);

            List<ChatMessageResponse> response =
                    chatService.getMessages(
                            userId,
                            conversationId
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // CUSTOMER / EMPLOYEE
    // GỬI TIN NHẮN
    // =========================================================

    @PostMapping(
            "/conversations/{conversationId}/messages"
    )
    public ResponseEntity<?> sendMessage(
            Authentication authentication,
            @PathVariable Long conversationId,
            @RequestBody SendChatMessageRequest request
    ) {

        try {

            Long userId =
                    getUserId(authentication);

            ChatMessageResponse response =
                    chatService.sendMessage(
                            userId,
                            conversationId,
                            request
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // CUSTOMER / EMPLOYEE
    // ĐÓNG CUỘC TRÒ CHUYỆN
    // =========================================================

    @PostMapping(
            "/conversations/{conversationId}/close"
    )
    public ResponseEntity<?> closeConversation(
            Authentication authentication,
            @PathVariable Long conversationId
    ) {

        try {

            Long userId =
                    getUserId(authentication);

            ChatConversationResponse response =
                    chatService.closeConversation(
                            userId,
                            conversationId
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // EMPLOYEE
    // HEARTBEAT ONLINE
    //
    // StaffLayout sẽ gọi API này khoảng 10 giây/lần.
    // Backend coi nhân viên online trong vòng 30 giây.
    // =========================================================

    @PostMapping("/staff/presence")
    public ResponseEntity<?> updateStaffPresence(
            Authentication authentication
    ) {

        try {

            Long staffId =
                    getUserId(authentication);

            chatService.updateStaffPresence(
                    staffId
            );

            return ResponseEntity.ok(
                    Map.of(
                            "success",
                            true
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // LẤY USER ID TỪ JWT / AUTHENTICATION
    // =========================================================
    private Long getUserId(
            Authentication authentication
    ) {

        if (authentication == null) {
            throw new RuntimeException(
                    "Chưa đăng nhập"
            );
        }

        Object principal =
                authentication.getPrincipal();

        // =========================================================
        // PROJECT SMARTSALES:
        //
        // JwtAuthenticationFilter đang đặt User entity
        // trực tiếp vào Authentication principal.
        // =========================================================

        if (principal instanceof User) {

            return ((User) principal).getId();
        }

        throw new RuntimeException(
                "Không xác định được userId từ thông tin đăng nhập"
        );
    }

}