package com.smartsales.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_review_media")
public class ReviewMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // REVIEW CHỨA MEDIA NÀY
    // =========================================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    // =========================================================
    // LOẠI MEDIA
    // IMAGE / VIDEO
    // =========================================================
    @Column(name = "media_type", nullable = false, length = 20)
    private String mediaType;

    // =========================================================
    // ĐƯỜNG DẪN FILE
    // =========================================================
    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    // =========================================================
    // TÊN FILE GỐC
    // =========================================================
    @Column(name = "file_name", length = 255)
    private String fileName;

    // =========================================================
    // DUNG LƯỢNG FILE
    // =========================================================
    @Column(name = "file_size")
    private Long fileSize;

    // =========================================================
    // MIME TYPE
    // Ví dụ:
    // image/jpeg
    // image/png
    // video/mp4
    // =========================================================
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    // =========================================================
    // THỜI LƯỢNG VIDEO
    // Chỉ sử dụng đối với VIDEO
    // =========================================================
    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    // =========================================================
    // THỨ TỰ HIỂN THỊ
    // =========================================================
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    // =========================================================
    // THỜI GIAN TẠO
    // =========================================================
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ReviewMedia() {
    }


    // =========================================================
    // GETTER / SETTER
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Review getReview() {
        return review;
    }

    public void setReview(Review review) {
        this.review = review;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}