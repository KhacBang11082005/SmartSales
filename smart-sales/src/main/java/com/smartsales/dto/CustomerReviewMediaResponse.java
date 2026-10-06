package com.smartsales.dto;

public class CustomerReviewMediaResponse {

    private Long id;

    /**
     * IMAGE hoặc VIDEO
     */
    private String mediaType;

    /**
     * Đường dẫn file.
     *
     * Ví dụ:
     * /uploads/reviews/abc.jpg
     * /uploads/reviews/xyz.mp4
     */
    private String fileUrl;

    private String fileName;

    private Long fileSize;

    private String mimeType;

    private Integer durationSeconds;

    private Integer displayOrder;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CustomerReviewMediaResponse() {
    }


    public CustomerReviewMediaResponse(
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
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.durationSeconds = durationSeconds;
        this.displayOrder = displayOrder;
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

    public void setDurationSeconds(
            Integer durationSeconds
    ) {
        this.durationSeconds = durationSeconds;
    }


    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(
            Integer displayOrder
    ) {
        this.displayOrder = displayOrder;
    }
}