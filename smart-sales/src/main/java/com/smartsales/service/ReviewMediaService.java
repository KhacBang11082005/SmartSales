package com.smartsales.service;

import com.smartsales.entity.Review;
import com.smartsales.entity.ReviewMedia;
import com.smartsales.repository.ReviewMediaRepository;
import com.smartsales.repository.ReviewRepository;
import org.jcodec.api.FrameGrab;
import org.jcodec.common.io.NIOUtils;
import org.jcodec.common.io.SeekableByteChannel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ReviewMediaService {

    // =========================================================
    // GIỚI HẠN REVIEW MEDIA
    // =========================================================

    private static final int MAX_IMAGES = 5;

    private static final int MAX_VIDEOS = 1;

    private static final int MAX_VIDEO_DURATION_SECONDS = 30;

    // Mỗi ảnh tối đa 5MB
    private static final long MAX_IMAGE_SIZE =
            5L * 1024 * 1024;

    // Video tối đa 100MB
    //
    // Đây là giới hạn dung lượng kỹ thuật của upload.
    // Giới hạn nghiệp vụ thời lượng vẫn là 30 giây.
    private static final long MAX_VIDEO_SIZE =
            100L * 1024 * 1024;

    // =========================================================
    // THƯ MỤC LƯU REVIEW MEDIA
    //
    // Không dùng chung tên file với ảnh sản phẩm.
    // =========================================================

    private final Path reviewUploadDirectory =
            Paths.get("uploads", "reviews");

    private final ReviewRepository reviewRepository;

    private final ReviewMediaRepository reviewMediaRepository;

    public ReviewMediaService(
            ReviewRepository reviewRepository,
            ReviewMediaRepository reviewMediaRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.reviewMediaRepository = reviewMediaRepository;
    }

    // =========================================================
    // UPLOAD MEDIA CHO REVIEW
    //
    // - Tối đa 5 ảnh
    // - Tối đa 1 video
    // - Video tối đa 30 giây
    // =========================================================

    public List<ReviewMedia> uploadMedia(
            Long reviewId,
            List<MultipartFile> files
    ) {

        // -----------------------------------------------------
        // Kiểm tra review
        // -----------------------------------------------------

        if (reviewId == null) {
            throw new IllegalArgumentException(
                    "Không xác định được đánh giá."
            );
        }

        Review review = reviewRepository
                .findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy đánh giá."
                        )
                );

        // -----------------------------------------------------
        // Kiểm tra file
        // -----------------------------------------------------

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException(
                    "Vui lòng chọn ảnh hoặc video."
            );
        }

        // -----------------------------------------------------
        // Đếm media hiện tại
        // -----------------------------------------------------

        long currentImages =
                reviewMediaRepository
                        .countByReviewIdAndMediaType(
                                reviewId,
                                "IMAGE"
                        );

        long currentVideos =
                reviewMediaRepository
                        .countByReviewIdAndMediaType(
                                reviewId,
                                "VIDEO"
                        );

        // -----------------------------------------------------
        // Đếm file mới
        // -----------------------------------------------------

        int newImages = 0;
        int newVideos = 0;

        for (MultipartFile file : files) {

            if (file == null || file.isEmpty()) {
                continue;
            }

            String contentType =
                    file.getContentType();

            if (contentType == null) {
                throw new IllegalArgumentException(
                        "Không xác định được loại file."
                );
            }

            if (contentType.startsWith("image/")) {

                newImages++;

            } else if (contentType.startsWith("video/")) {

                newVideos++;

            } else {

                throw new IllegalArgumentException(
                        "Chỉ được phép tải lên ảnh hoặc video."
                );
            }
        }

        // -----------------------------------------------------
        // Kiểm tra tổng số ảnh
        // -----------------------------------------------------

        if (currentImages + newImages > MAX_IMAGES) {

            throw new IllegalArgumentException(
                    "Mỗi đánh giá chỉ được tối đa "
                            + MAX_IMAGES
                            + " ảnh."
            );
        }

        // -----------------------------------------------------
        // Kiểm tra tổng số video
        // -----------------------------------------------------

        if (currentVideos + newVideos > MAX_VIDEOS) {

            throw new IllegalArgumentException(
                    "Mỗi đánh giá chỉ được tối đa 1 video."
            );
        }

        // -----------------------------------------------------
        // Tạo thư mục
        // -----------------------------------------------------

        try {

            Files.createDirectories(
                    reviewUploadDirectory
            );

        } catch (IOException e) {

            throw new IllegalArgumentException(
                    "Không thể tạo thư mục lưu media đánh giá.",
                    e
            );
        }

        // -----------------------------------------------------
        // Lấy display order hiện tại
        // -----------------------------------------------------

        int nextDisplayOrder =
                getNextDisplayOrder(reviewId);

        List<ReviewMedia> savedMedia =
                new ArrayList<>();

        // =====================================================
        // XỬ LÝ TỪNG FILE
        // =====================================================

        for (MultipartFile file : files) {

            if (file == null || file.isEmpty()) {
                continue;
            }

            String contentType =
                    file.getContentType();

            // -------------------------------------------------
            // ẢNH
            // -------------------------------------------------

            if (contentType != null &&
                    contentType.startsWith("image/")) {

                ReviewMedia media =
                        saveImage(
                                review,
                                file,
                                nextDisplayOrder++
                        );

                savedMedia.add(media);

                continue;
            }

            // -------------------------------------------------
            // VIDEO
            // -------------------------------------------------

            if (contentType != null &&
                    contentType.startsWith("video/")) {

                ReviewMedia media =
                        saveVideo(
                                review,
                                file,
                                nextDisplayOrder++
                        );

                savedMedia.add(media);

                continue;
            }

            throw new IllegalArgumentException(
                    "File không được hỗ trợ."
            );
        }

        return savedMedia;
    }
// =========================================================
// LẤY MEDIA THEO ID
//
// Có JOIN FETCH review + customer để kiểm tra ownership.
// =========================================================

    @Transactional(readOnly = true)
    public ReviewMedia getMediaById(Long mediaId) {

        if (mediaId == null) {
            return null;
        }

        return reviewMediaRepository
                .findByIdWithReviewAndCustomer(mediaId)
                .orElse(null);
    }
    // =========================================================
    // LƯU ẢNH
    // =========================================================

    private ReviewMedia saveImage(
            Review review,
            MultipartFile file,
            int displayOrder
    ) {

        // -----------------------------------------------------
        // Kiểm tra dung lượng
        // -----------------------------------------------------

        if (file.getSize() > MAX_IMAGE_SIZE) {

            throw new IllegalArgumentException(
                    "Mỗi ảnh đánh giá không được vượt quá 5MB."
            );
        }

        // -----------------------------------------------------
        // Tạo tên file
        // -----------------------------------------------------

        String extension =
                getFileExtension(
                        file.getOriginalFilename()
                );

        String newFileName =
                UUID.randomUUID()
                        + extension;

        Path targetLocation =
                reviewUploadDirectory
                        .resolve(newFileName);

        // -----------------------------------------------------
        // Lưu file
        // -----------------------------------------------------

        try {

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new IllegalArgumentException(
                    "Không thể lưu ảnh đánh giá.",
                    e
            );
        }

        // -----------------------------------------------------
        // Tạo entity
        // -----------------------------------------------------

        ReviewMedia media =
                new ReviewMedia();

        media.setReview(review);

        media.setMediaType("IMAGE");

        media.setFileUrl(
                "/uploads/reviews/"
                        + newFileName
        );

        media.setFileName(
                file.getOriginalFilename()
        );

        media.setFileSize(
                file.getSize()
        );

        media.setMimeType(
                file.getContentType()
        );

        media.setDurationSeconds(null);

        media.setDisplayOrder(
                displayOrder
        );
        media.setCreatedAt(LocalDateTime.now());
        return reviewMediaRepository.save(
                media
        );
    }

    // =========================================================
    // LƯU VIDEO
    // =========================================================

    private ReviewMedia saveVideo(
            Review review,
            MultipartFile file,
            int displayOrder
    ) {

        // -----------------------------------------------------
        // Kiểm tra dung lượng
        // -----------------------------------------------------

        if (file.getSize() > MAX_VIDEO_SIZE) {

            throw new IllegalArgumentException(
                    "Video đánh giá không được vượt quá 100MB."
            );
        }

        // -----------------------------------------------------
        // Chỉ cho phép một số định dạng video phổ biến
        // -----------------------------------------------------

        String contentType =
                file.getContentType();

        if (!isSupportedVideoType(contentType)) {

            throw new IllegalArgumentException(
                    "Định dạng video không được hỗ trợ. "
                            + "Vui lòng sử dụng MP4, MOV hoặc WebM."
            );
        }

        // -----------------------------------------------------
        // Tạo file tạm để đọc duration
        // -----------------------------------------------------

        Path tempFile = null;

        try {

            String extension =
                    getFileExtension(
                            file.getOriginalFilename()
                    );

            tempFile = Files.createTempFile(
                    "smartsales-review-video-",
                    extension.isEmpty()
                            ? ".tmp"
                            : extension
            );

            Files.copy(
                    file.getInputStream(),
                    tempFile,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // -------------------------------------------------
            // Đọc thời lượng video
            // -------------------------------------------------

            double duration =
                    getVideoDuration(
                            tempFile.toFile()
                    );

            // -------------------------------------------------
            // Kiểm tra 30 giây
            // -------------------------------------------------

            if (duration > MAX_VIDEO_DURATION_SECONDS) {

                throw new IllegalArgumentException(
                        "Video đánh giá không được dài quá "
                                + MAX_VIDEO_DURATION_SECONDS
                                + " giây."
                );
            }

            // -------------------------------------------------
            // Chuyển sang số giây để lưu DB
            // -------------------------------------------------

            int durationSeconds =
                    (int) Math.ceil(duration);

            // -------------------------------------------------
            // Tạo tên file thật
            // -------------------------------------------------

            String newFileName =
                    UUID.randomUUID()
                            + extension;

            Path targetLocation =
                    reviewUploadDirectory
                            .resolve(newFileName);

            // -------------------------------------------------
            // Lưu video
            // -------------------------------------------------

            Files.copy(
                    tempFile,
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // -------------------------------------------------
            // Tạo entity
            // -------------------------------------------------

            ReviewMedia media =
                    new ReviewMedia();

            media.setReview(review);

            media.setMediaType("VIDEO");

            media.setFileUrl(
                    "/uploads/reviews/"
                            + newFileName
            );

            media.setFileName(
                    file.getOriginalFilename()
            );

            media.setFileSize(
                    file.getSize()
            );

            media.setMimeType(
                    contentType
            );

            media.setDurationSeconds(
                    durationSeconds
            );

            media.setDisplayOrder(
                    displayOrder
            );
            media.setCreatedAt(LocalDateTime.now());
            return reviewMediaRepository.save(
                    media
            );

        } catch (IOException e) {

            throw new IllegalArgumentException(
                    "Không thể xử lý video đánh giá.",
                    e
            );

        } finally {

            // -------------------------------------------------
            // Xóa file tạm
            // -------------------------------------------------

            if (tempFile != null) {

                try {

                    Files.deleteIfExists(
                            tempFile
                    );

                } catch (IOException ignored) {
                    // Không làm ảnh hưởng quá trình xử lý
                }
            }
        }
    }

    // =========================================================
// ĐỌC THỜI LƯỢNG VIDEO
// =========================================================

    private double getVideoDuration(
            File videoFile
    ) throws IOException {

        SeekableByteChannel channel = null;

        try {

            channel = NIOUtils.readableChannel(videoFile);

            FrameGrab frameGrab;

            try {

                frameGrab =
                        FrameGrab.createFrameGrab(channel);

            } catch (org.jcodec.api.JCodecException e) {

                throw new IOException(
                        "Không thể đọc metadata của video.",
                        e
                );
            }

            // Lấy thời lượng trực tiếp từ metadata.
            // Không cần đọc toàn bộ từng frame của video.
            return frameGrab
                    .getVideoTrack()
                    .getMeta()
                    .getTotalDuration();

        } finally {

            NIOUtils.closeQuietly(channel);
        }
    }

    // =========================================================
    // KIỂM TRA VIDEO MIME TYPE
    // =========================================================

    private boolean isSupportedVideoType(
            String contentType
    ) {

        if (contentType == null) {
            return false;
        }

        return contentType.equalsIgnoreCase(
                "video/mp4"
        )
                ||
                contentType.equalsIgnoreCase(
                        "video/quicktime"
                )
                ||
                contentType.equalsIgnoreCase(
                        "video/webm"
                );
    }

    // =========================================================
    // LẤY EXTENSION
    // =========================================================

    private String getFileExtension(
            String fileName
    ) {

        if (fileName == null ||
                fileName.isBlank()) {

            return "";
        }

        int lastDot =
                fileName.lastIndexOf('.');

        if (lastDot < 0) {
            return "";
        }

        return fileName.substring(
                lastDot
        );
    }

    // =========================================================
    // LẤY DISPLAY ORDER TIẾP THEO
    // =========================================================

    private int getNextDisplayOrder(
            Long reviewId
    ) {

        List<ReviewMedia> mediaList =
                reviewMediaRepository
                        .findByReviewIdOrderByDisplayOrderAsc(
                                reviewId
                        );

        if (mediaList == null ||
                mediaList.isEmpty()) {

            return 0;
        }

        ReviewMedia last =
                mediaList.get(
                        mediaList.size() - 1
                );

        if (last.getDisplayOrder() == null) {
            return 0;
        }

        return last.getDisplayOrder() + 1;
    }
// =========================================================
// XÓA MEDIA REVIEW
//
// Chỉ xóa DB + file vật lý.
// Việc kiểm tra customer sở hữu review được thực hiện
// tại Controller trước khi gọi method này.
// =========================================================

    public void deleteMedia(
            Long mediaId
    ) {

        if (mediaId == null) {

            throw new IllegalArgumentException(
                    "Không xác định được media cần xóa."
            );
        }

        ReviewMedia media =
                reviewMediaRepository
                        .findById(mediaId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Không tìm thấy media đánh giá."
                                )
                        );

        // ---------------------------------------------------------
        // Xóa file vật lý
        // ---------------------------------------------------------

        String fileUrl =
                media.getFileUrl();

        if (fileUrl != null &&
                fileUrl.startsWith(
                        "/uploads/reviews/"
                )) {

            String fileName =
                    fileUrl.substring(
                            "/uploads/reviews/"
                                    .length()
                    );

            Path filePath =
                    reviewUploadDirectory
                            .resolve(fileName)
                            .normalize();

            // -----------------------------------------------------
            // Bảo vệ không cho path thoát khỏi thư mục reviews
            // -----------------------------------------------------

            Path normalizedDirectory =
                    reviewUploadDirectory
                            .toAbsolutePath()
                            .normalize();

            Path normalizedFile =
                    filePath
                            .toAbsolutePath()
                            .normalize();

            if (!normalizedFile.startsWith(
                    normalizedDirectory
            )) {

                throw new IllegalArgumentException(
                        "Đường dẫn file không hợp lệ."
                );
            }

            try {

                Files.deleteIfExists(
                        normalizedFile
                );

            } catch (IOException e) {

                throw new IllegalArgumentException(
                        "Không thể xóa file media.",
                        e
                );
            }
        }

        // ---------------------------------------------------------
        // Xóa bản ghi database
        // ---------------------------------------------------------

        reviewMediaRepository.delete(
                media
        );
    }

}