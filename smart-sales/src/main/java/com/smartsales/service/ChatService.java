package com.smartsales.service;

import com.smartsales.dto.ChatConversationResponse;
import com.smartsales.dto.ChatMessageResponse;
import com.smartsales.dto.CreateChatRequest;
import com.smartsales.dto.SendChatMessageRequest;
import com.smartsales.entity.ChatConversation;
import com.smartsales.entity.ChatMessage;
import com.smartsales.entity.Customer;
import com.smartsales.entity.Product;
import com.smartsales.entity.StaffChatPresence;
import com.smartsales.entity.User;
import com.smartsales.repository.ChatConversationRepository;
import com.smartsales.repository.ChatMessageRepository;
import com.smartsales.repository.CustomerRepository;
import com.smartsales.repository.ProductRepository;
import com.smartsales.repository.StaffChatPresenceRepository;
import com.smartsales.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;


/**
 * ============================================================
 * CHAT SERVICE
 * ============================================================
 *
 * Xử lý toàn bộ nghiệp vụ chat giữa:
 *
 * CUSTOMER <-> EMPLOYEE
 *
 * Luồng chính:
 *
 * CUSTOMER
 *      |
 *      v
 * Tạo yêu cầu chat
 *      |
 *      +---- Có nhân viên online
 *      |          |
 *      |          v
 *      |    Tự động phân nhân viên
 *      |          |
 *      |          v
 *      |       ASSIGNED
 *      |
 *      +---- Không có nhân viên online
 *                 |
 *                 v
 *              WAITING
 *
 * EMPLOYEE
 *      |
 *      v
 * TIẾP NHẬN
 *      |
 *      v
 * ACTIVE
 *      |
 *      v
 * Chat
 *      |
 *      v
 * CLOSED
 *
 * ============================================================
 */
@Service
public class ChatService {

    private final ChatConversationRepository chatConversationRepository;

    private final ChatMessageRepository chatMessageRepository;

    private final StaffChatPresenceRepository staffChatPresenceRepository;

    private final CustomerRepository customerRepository;

    private final UserRepository userRepository;

    private final ProductRepository productRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ChatService(
            ChatConversationRepository chatConversationRepository,
            ChatMessageRepository chatMessageRepository,
            StaffChatPresenceRepository staffChatPresenceRepository,
            CustomerRepository customerRepository,
            UserRepository userRepository,
            ProductRepository productRepository
    ) {

        this.chatConversationRepository =
                chatConversationRepository;

        this.chatMessageRepository =
                chatMessageRepository;

        this.staffChatPresenceRepository =
                staffChatPresenceRepository;

        this.customerRepository =
                customerRepository;

        this.userRepository =
                userRepository;

        this.productRepository =
                productRepository;
    }


    // =========================================================
    // CUSTOMER
    //
    // TẠO / MỞ CUỘC TRÒ CHUYỆN
    // =========================================================

    @Transactional
    public ChatConversationResponse createConversation(
            Long userId,
            CreateChatRequest request
    ) {

        // =====================================================
        // 1. TÌM CUSTOMER
        // =====================================================

        Customer customer =
                customerRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy thông tin khách hàng"
                                )
                        );


        // =====================================================
        // 2. KIỂM TRA CUỘC CHAT ĐANG MỞ
        //
        // Nếu khách đã có cuộc chat:
        //
        // WAITING
        // ASSIGNED
        // ACTIVE
        //
        // thì sử dụng lại cuộc chat đó.
        //
        // Không tạo nhiều cuộc chat trùng nhau.
        // =====================================================

        List<ChatConversation.Status> openStatuses =
                List.of(
                        ChatConversation.Status.WAITING,
                        ChatConversation.Status.ASSIGNED,
                        ChatConversation.Status.ACTIVE
                );


        Optional<ChatConversation> existingConversation =
                chatConversationRepository
                        .findFirstByCustomerIdAndStatusInOrderByIdDesc(
                                customer.getId(),
                                openStatuses
                        );


        ChatConversation conversation;


        if (existingConversation.isPresent()) {

            conversation =
                    existingConversation.get();

        } else {

            // =================================================
            // 3. TẠO CUỘC CHAT MỚI
            // =================================================

            conversation =
                    new ChatConversation();

            conversation.setCustomer(
                    customer
            );

            conversation.setStatus(
                    ChatConversation.Status.WAITING
            );

            conversation.setRequestedAt(
                    LocalDateTime.now()
            );


            // =================================================
            // 4. GẮN SẢN PHẨM NẾU KHÁCH ĐANG XEM SẢN PHẨM
            // =================================================

            if (
                    request != null
                            && request.getProductId() != null
            ) {

                Product product =
                        productRepository
                                .findById(
                                        request.getProductId()
                                )
                                .orElse(null);

                if (product != null) {

                    conversation.setProduct(
                            product
                    );
                }
            }


            // =================================================
            // 5. TỰ ĐỘNG PHÂN NHÂN VIÊN ONLINE
            // =================================================

            User selectedStaff =
                    findBestOnlineStaff();


            if (selectedStaff != null) {

                conversation.setStaff(
                        selectedStaff
                );

                conversation.setStatus(
                        ChatConversation.Status.ASSIGNED
                );
            }


            conversation =
                    chatConversationRepository.save(
                            conversation
                    );
        }


        // =====================================================
        // 6. KHÁCH CÓ THỂ GỬI TIN NHẮN NGAY KHI MỞ CHAT
        //
        // Nếu frontend gửi message ban đầu thì lưu luôn.
        // =====================================================

        if (
                request != null
                        && request.getMessage() != null
                        && !request.getMessage()
                        .trim()
                        .isEmpty()
        ) {

            saveMessage(
                    conversation,
                    customer.getUser(),
                    request.getMessage()
            );
        }


        // =====================================================
        // 7. TRẢ RESPONSE
        // =====================================================

        return toConversationResponse(
                conversation,
                userId
        );
    }


    // =========================================================
    // TÌM NHÂN VIÊN ONLINE TỐT NHẤT
    //
    // Quy tắc:
    //
    // 1. last_seen <= 30 giây
    // 2. User ACTIVE
    // 3. Role EMPLOYEE
    // 4. Nhân viên có ít chat ASSIGNED + ACTIVE nhất
    //
    // Đây chính là load balancing.
    // =========================================================

    private User findBestOnlineStaff() {

        LocalDateTime onlineSince =
                LocalDateTime.now()
                        .minusSeconds(30);


        List<StaffChatPresence> onlinePresences =
                staffChatPresenceRepository
                        .findOnlineStaff(
                                onlineSince
                        );


        if (
                onlinePresences == null
                        || onlinePresences.isEmpty()
        ) {

            return null;
        }


        List<User> availableStaff =
                new ArrayList<>();


        for (
                StaffChatPresence presence :
                onlinePresences
        ) {

            if (presence == null) {
                continue;
            }


            User staff =
                    presence.getStaff();


            if (staff == null) {
                continue;
            }


            // =================================================
            // CHỈ EMPLOYEE
            // =================================================

            if (
                    staff.getRole() == null
                            || staff.getRole().getName() == null
                            || !"EMPLOYEE".equalsIgnoreCase(
                            staff.getRole().getName()
                    )
            ) {

                continue;
            }


            // =================================================
            // TÀI KHOẢN PHẢI ACTIVE
            // =================================================

            if (
                    staff.getStatus()
                            != User.Status.ACTIVE
            ) {

                continue;
            }


            availableStaff.add(
                    staff
            );
        }


        if (availableStaff.isEmpty()) {
            return null;
        }


        // =====================================================
        // CHỌN NHÂN VIÊN CÓ ÍT CHAT ĐANG XỬ LÝ NHẤT
        // =====================================================

        User bestStaff = null;

        long lowestLoad =
                Long.MAX_VALUE;


        List<ChatConversation.Status> activeStatuses =
                List.of(
                        ChatConversation.Status.ASSIGNED,
                        ChatConversation.Status.ACTIVE
                );


        for (User staff : availableStaff) {

            long load =
                    chatConversationRepository
                            .countByStaffIdAndStatusIn(
                                    staff.getId(),
                                    activeStatuses
                            );


            if (
                    bestStaff == null
                            || load < lowestLoad
            ) {

                bestStaff =
                        staff;

                lowestLoad =
                        load;
            }
        }


        return bestStaff;
    }


    // =========================================================
    // CUSTOMER
    //
    // LẤY CUỘC CHAT HIỆN TẠI
    // =========================================================

    @Transactional
    public ChatConversationResponse getCurrentConversation(
            Long userId
    ) {

        Customer customer =
                customerRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy thông tin khách hàng"
                                )
                        );


        List<ChatConversation.Status> openStatuses =
                List.of(
                        ChatConversation.Status.WAITING,
                        ChatConversation.Status.ASSIGNED,
                        ChatConversation.Status.ACTIVE
                );


        Optional<ChatConversation> conversation =
                chatConversationRepository
                        .findFirstByCustomerIdAndStatusInOrderByIdDesc(
                                customer.getId(),
                                openStatuses
                        );


        if (conversation.isEmpty()) {
            return null;
        }


        return toConversationResponse(
                conversation.get(),
                userId
        );
    }


    // =========================================================
    // CUSTOMER
    //
    // LẤY LỊCH SỬ CÁC CUỘC CHAT
    // =========================================================

    @Transactional(readOnly = true)
    public List<ChatConversationResponse> getCustomerConversations(
            Long userId
    ) {

        Customer customer =
                customerRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy thông tin khách hàng"
                                )
                        );


        List<ChatConversation> conversations =
                chatConversationRepository
                        .findByCustomerIdOrderByLastMessageAtDescIdDesc(
                                customer.getId()
                        );


        return conversations
                .stream()
                .map(conversation ->
                        toConversationResponse(
                                conversation,
                                userId
                        )
                )
                .toList();
    }


    // =========================================================
    // EMPLOYEE
    //
    // LẤY DANH SÁCH INBOX
    //
    // Bao gồm:
    //
    // WAITING
    // ASSIGNED
    // ACTIVE
    //
    // Để nhân viên nhìn thấy yêu cầu mới và cuộc chat đang xử lý.
    // =========================================================

    @Transactional(readOnly = true)
    public List<ChatConversationResponse> getStaffInbox(
            Long staffId
    ) {

        validateEmployee(
                staffId
        );


        List<ChatConversation.Status> statuses =
                List.of(
                        ChatConversation.Status.WAITING,
                        ChatConversation.Status.ASSIGNED,
                        ChatConversation.Status.ACTIVE
                );


        List<ChatConversation> conversations =
                chatConversationRepository
                        .findInboxConversations(
                                statuses
                        );


        return conversations
                .stream()
                .map(conversation ->
                        toConversationResponse(
                                conversation,
                                staffId
                        )
                )
                .toList();
    }


    // =========================================================
    // EMPLOYEE
    //
    // NHẬN CUỘC CHAT
    //
    // WAITING:
    //     Chưa có nhân viên
    //
    // ASSIGNED:
    //     Đã được phân cho nhân viên
    //
    // Nhân viên chỉ được nhận:
    //
    // - Cuộc chat WAITING
    // - Cuộc chat đã được phân cho chính mình
    // =========================================================

    @Transactional
    public ChatConversationResponse acceptConversation(
            Long staffId,
            Long conversationId
    ) {

        User staff =
                validateEmployee(
                        staffId
                );


        ChatConversation conversation =
                chatConversationRepository
                        .findById(
                                conversationId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy cuộc trò chuyện"
                                )
                        );


        // =====================================================
        // KHÔNG CHO NHẬN CHAT ĐÃ ĐÓNG
        // =====================================================

        if (
                conversation.getStatus()
                        == ChatConversation.Status.CLOSED
        ) {

            throw new RuntimeException(
                    "Cuộc trò chuyện đã kết thúc"
            );
        }


        // =====================================================
        // NẾU ĐÃ CÓ NHÂN VIÊN KHÁC ĐƯỢC PHÂN
        // =====================================================

        if (
                conversation.getStaff() != null
                        && !conversation
                        .getStaff()
                        .getId()
                        .equals(staffId)
        ) {

            throw new RuntimeException(
                    "Cuộc trò chuyện này đã được nhân viên khác tiếp nhận"
            );
        }


        // =====================================================
        // GÁN NHÂN VIÊN
        // =====================================================

        conversation.setStaff(
                staff
        );


        conversation.setStatus(
                ChatConversation.Status.ACTIVE
        );


        conversation.setAcceptedAt(
                LocalDateTime.now()
        );


        conversation =
                chatConversationRepository.save(
                        conversation
                );


        return toConversationResponse(
                conversation,
                staffId
        );
    }


    // =========================================================
    // EMPLOYEE
    //
    // LẤY CHI TIẾT CUỘC CHAT
    // =========================================================

    @Transactional(readOnly = true)
    public ChatConversationResponse getStaffConversation(
            Long staffId,
            Long conversationId
    ) {

        validateEmployee(
                staffId
        );


        ChatConversation conversation =
                chatConversationRepository
                        .findById(
                                conversationId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy cuộc trò chuyện"
                                )
                        );


        // =====================================================
        // STAFF CHỈ XEM:
        //
        // - Chat của chính mình
        // - Hoặc chat WAITING
        //
        // =====================================================

        if (
                conversation.getStaff() != null
                        && !conversation
                        .getStaff()
                        .getId()
                        .equals(staffId)
        ) {

            throw new RuntimeException(
                    "Bạn không có quyền xem cuộc trò chuyện này"
            );
        }


        return toConversationResponse(
                conversation,
                staffId
        );
    }


    // =========================================================
    // LẤY TIN NHẮN
    //
    // CUSTOMER:
    // chỉ được lấy chat của chính mình.
    //
    // EMPLOYEE:
    // chỉ được lấy chat đã phân cho mình hoặc WAITING.
    // =========================================================

    @Transactional
    public List<ChatMessageResponse> getMessages(
            Long userId,
            Long conversationId
    ) {

        ChatConversation conversation =
                chatConversationRepository
                        .findById(
                                conversationId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy cuộc trò chuyện"
                                )
                        );


        validateConversationAccess(
                userId,
                conversation
        );


        // =====================================================
        // ĐÁNH DẤU TIN NHẮN ĐÃ ĐỌC
        // =====================================================

        chatMessageRepository.markMessagesAsRead(
                conversationId,
                userId
        );


        List<ChatMessage> messages =
                chatMessageRepository
                        .findByConversationIdOrderByIdAsc(
                                conversationId
                        );


        return messages
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }


    // =========================================================
    // GỬI TIN NHẮN
    //
    // CUSTOMER / EMPLOYEE đều sử dụng.
    // =========================================================

    @Transactional
    public ChatMessageResponse sendMessage(
            Long userId,
            Long conversationId,
            SendChatMessageRequest request
    ) {

        if (
                request == null
                        || request.getContent() == null
                        || request.getContent()
                        .trim()
                        .isEmpty()
        ) {

            throw new RuntimeException(
                    "Nội dung tin nhắn không được để trống"
            );
        }


        ChatConversation conversation =
                chatConversationRepository
                        .findById(
                                conversationId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy cuộc trò chuyện"
                                )
                        );


        validateConversationAccess(
                userId,
                conversation
        );


        // =====================================================
        // KHÔNG CHO GỬI VÀO CHAT ĐÃ ĐÓNG
        // =====================================================

        if (
                conversation.getStatus()
                        == ChatConversation.Status.CLOSED
        ) {

            throw new RuntimeException(
                    "Cuộc trò chuyện đã kết thúc"
            );
        }


        User sender =
                userRepository
                        .findById(
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy tài khoản"
                                )
                        );


        ChatMessage message =
                saveMessage(
                        conversation,
                        sender,
                        request.getContent()
                );


        return toMessageResponse(
                message
        );
    }


    // =========================================================
    // LƯU MESSAGE
    // =========================================================

    private ChatMessage saveMessage(
            ChatConversation conversation,
            User sender,
            String content
    ) {

        ChatMessage message =
                new ChatMessage();

        message.setConversation(
                conversation
        );

        message.setSender(
                sender
        );

        message.setContent(
                content.trim()
        );

        message.setSentAt(
                LocalDateTime.now()
        );


        message =
                chatMessageRepository.save(
                        message
                );


        conversation.setLastMessageAt(
                message.getSentAt()
        );


        chatConversationRepository.save(
                conversation
        );


        return message;
    }


    // =========================================================
    // ĐÓNG CUỘC TRÒ CHUYỆN
    //
    // CUSTOMER hoặc EMPLOYEE đều có thể đóng.
    // =========================================================

    @Transactional
    public ChatConversationResponse closeConversation(
            Long userId,
            Long conversationId
    ) {

        ChatConversation conversation =
                chatConversationRepository
                        .findById(
                                conversationId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy cuộc trò chuyện"
                                )
                        );


        validateConversationAccess(
                userId,
                conversation
        );


        conversation.setStatus(
                ChatConversation.Status.CLOSED
        );


        conversation =
                chatConversationRepository.save(
                        conversation
                );


        return toConversationResponse(
                conversation,
                userId
        );
    }


    // =========================================================
    // STAFF HEARTBEAT
    //
    // StaffLayout sẽ gọi API này định kỳ.
    //
    // Chỉ cần gọi hàm này:
    //
    // lastSeenAt = NOW
    //
    // Sau 30 giây không heartbeat:
    // nhân viên được coi là OFFLINE.
    // =========================================================

    @Transactional
    public void updateStaffPresence(
            Long staffId
    ) {

        User staff =
                validateEmployee(
                        staffId
                );


        StaffChatPresence presence =
                staffChatPresenceRepository
                        .findByStaffId(
                                staffId
                        )
                        .orElse(null);


        if (presence == null) {

            presence =
                    new StaffChatPresence();

            presence.setStaff(
                    staff
            );
        }


        presence.setLastSeenAt(
                LocalDateTime.now()
        );


        staffChatPresenceRepository.save(
                presence
        );
    }


    // =========================================================
    // VALIDATE EMPLOYEE
    // =========================================================

    private User validateEmployee(
            Long staffId
    ) {

        User staff =
                userRepository
                        .findById(
                                staffId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy nhân viên"
                                )
                        );


        // =====================================================
        // ROLE
        // =====================================================

        if (
                staff.getRole() == null
                        || staff.getRole().getName() == null
                        || !"EMPLOYEE".equalsIgnoreCase(
                        staff.getRole().getName()
                )
        ) {

            throw new RuntimeException(
                    "Tài khoản không phải nhân viên"
            );
        }


        // =====================================================
        // STATUS
        // =====================================================

        if (
                staff.getStatus()
                        != User.Status.ACTIVE
        ) {

            throw new RuntimeException(
                    "Tài khoản nhân viên không hoạt động"
            );
        }


        return staff;
    }


    // =========================================================
    // KIỂM TRA QUYỀN TRUY CẬP CONVERSATION
    // =========================================================

    private void validateConversationAccess(
            Long userId,
            ChatConversation conversation
    ) {

        User user =
                userRepository
                        .findById(
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy tài khoản"
                                )
                        );


        String roleName =
                user.getRole() != null
                        ? user.getRole().getName()
                        : null;


        // =====================================================
        // CUSTOMER
        // =====================================================

        if (
                roleName != null
                        && "CUSTOMER".equalsIgnoreCase(
                        roleName
                )
        ) {

            if (
                    conversation.getCustomer() == null
                            || conversation
                            .getCustomer()
                            .getUser() == null
                            || !conversation
                            .getCustomer()
                            .getUser()
                            .getId()
                            .equals(userId)
            ) {

                throw new RuntimeException(
                        "Bạn không có quyền truy cập cuộc trò chuyện này"
                );
            }


            return;
        }


        // =====================================================
        // EMPLOYEE
        // =====================================================

        if (
                roleName != null
                        && "EMPLOYEE".equalsIgnoreCase(
                        roleName
                )
        ) {

            if (
                    conversation.getStaff() != null
                            && !conversation
                            .getStaff()
                            .getId()
                            .equals(userId)
            ) {

                throw new RuntimeException(
                        "Bạn không có quyền truy cập cuộc trò chuyện này"
                );
            }


            return;
        }


        // =====================================================
        // ROLE KHÁC
        // =====================================================

        throw new RuntimeException(
                "Tài khoản không có quyền sử dụng chức năng chat"
        );
    }


    // =========================================================
    // CONVERSATION -> RESPONSE
    // =========================================================

    private ChatConversationResponse toConversationResponse(
            ChatConversation conversation,
            Long currentUserId
    ) {

        ChatConversationResponse response =
                new ChatConversationResponse();


        response.setId(
                conversation.getId()
        );


        // =====================================================
        // CUSTOMER
        // =====================================================

        if (
                conversation.getCustomer() != null
        ) {

            Customer customer =
                    conversation.getCustomer();


            response.setCustomerId(
                    customer.getId()
            );


            if (
                    customer.getUser() != null
            ) {

                response.setCustomerName(
                        customer
                                .getUser()
                                .getFullName()
                );
            }
        }


        // =====================================================
        // STAFF
        // =====================================================

        if (
                conversation.getStaff() != null
        ) {

            User staff =
                    conversation.getStaff();


            response.setStaffId(
                    staff.getId()
            );


            response.setStaffName(
                    staff.getFullName()
            );
        }


        // =====================================================
        // PRODUCT
        // =====================================================

        if (
                conversation.getProduct() != null
        ) {

            Product product =
                    conversation.getProduct();


            response.setProductId(
                    product.getId()
            );


            response.setProductName(
                    product.getName()
            );
        }


        // =====================================================
        // STATUS
        // =====================================================

        response.setStatus(
                conversation.getStatus() != null
                        ? conversation
                        .getStatus()
                        .name()
                        : null
        );


        response.setRequestedAt(
                conversation.getRequestedAt()
        );


        response.setAcceptedAt(
                conversation.getAcceptedAt()
        );


        response.setLastMessageAt(
                conversation.getLastMessageAt()
        );


        // =====================================================
        // UNREAD COUNT
        //
        // Chỉ tính tin nhắn của phía đối diện.
        // =====================================================

        List<Long> conversationIds =
                List.of(
                        conversation.getId()
                );


        long unread =
                chatMessageRepository
                        .countUnreadMessages(
                                conversationIds,
                                currentUserId
                        );


        response.setUnreadCount(
                unread
        );


        return response;
    }


    // =========================================================
    // MESSAGE -> RESPONSE
    // =========================================================

    private ChatMessageResponse toMessageResponse(
            ChatMessage message
    ) {

        ChatMessageResponse response =
                new ChatMessageResponse();


        response.setId(
                message.getId()
        );


        if (
                message.getConversation() != null
        ) {

            response.setConversationId(
                    message
                            .getConversation()
                            .getId()
            );
        }


        if (
                message.getSender() != null
        ) {

            response.setSenderId(
                    message
                            .getSender()
                            .getId()
            );


            response.setSenderName(
                    message
                            .getSender()
                            .getFullName()
            );
        }


        response.setContent(
                message.getContent()
        );


        response.setSentAt(
                message.getSentAt()
        );


        response.setReadAt(
                message.getReadAt()
        );


        return response;
    }
}