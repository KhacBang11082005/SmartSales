import { useEffect, useMemo, useRef, useState } from "react";

import {
    ArrowLeft,
    CheckCircle2,
    Edit3,
    ImagePlus,
    MessageSquare,
    Star,
    Trash2,
    Upload,
    Video,
    X
} from "lucide-react";

import { Link } from "react-router-dom";

import { getMyOrders } from "../../services/orderApi";

import {
    getMyReview,
    canReviewProduct,
    createReview,
    updateReview,
    uploadReviewMedia,
    deleteReviewMedia
} from "../../services/reviewApi";

import "./Reviews.css";


// =========================================================
// CONSTANT
// =========================================================

const MAX_IMAGES = 5;
const MAX_VIDEO = 1;
const MAX_VIDEO_DURATION = 30;


// =========================================================
// XỬ LÝ URL ẢNH
// =========================================================

function getImageUrl(imageUrl) {

    if (!imageUrl) {
        return "";
    }

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    return `http://localhost:8080${imageUrl}`;
}


// =========================================================
// FORMAT PRICE
// =========================================================

function formatPrice(price) {

    return (
        new Intl.NumberFormat("vi-VN").format(
            Number(price || 0)
        ) + " ₫"
    );
}


// =========================================================
// COMPONENT
// =========================================================

function Reviews() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =====================================================
    // PRODUCT ĐANG ĐÁNH GIÁ
    // =====================================================

    const [activeProductId, setActiveProductId] =
        useState(null);


    // =====================================================
    // FORM
    // =====================================================

    const [rating, setRating] = useState(5);

    const [comment, setComment] = useState("");

    const [selectedImages, setSelectedImages] =
        useState([]);

    const [selectedVideo, setSelectedVideo] =
        useState(null);


    // =====================================================
    // FORM STATE
    // =====================================================

    const [submitting, setSubmitting] =
        useState(false);

    const [formError, setFormError] =
        useState("");

    const [formSuccess, setFormSuccess] =
        useState("");


    // =====================================================
    // MEDIA STATE
    // =====================================================

    const [uploadingMedia, setUploadingMedia] =
        useState(false);

    const [deletingMediaId, setDeletingMediaId] =
        useState(null);


    // =====================================================
    // INPUT REFS
    // =====================================================

    const imageInputRef = useRef(null);

    const videoInputRef = useRef(null);


    // =====================================================
    // LẤY SẢN PHẨM ĐÃ MUA
    // =====================================================

    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const orders = await getMyOrders();

            if (!Array.isArray(orders)) {

                setProducts([]);

                return;
            }


            // =================================================
            // CHỈ LẤY ĐƠN HÀNG ĐÃ HOÀN THÀNH
            // =================================================

            const completedOrders =
                orders.filter(
                    (order) =>
                        order?.status === "COMPLETED"
                );


            // =================================================
            // GOM SẢN PHẨM
            // =================================================

            const productMap = new Map();


            completedOrders.forEach((order) => {

                if (
                    !Array.isArray(
                        order?.orderDetails
                    )
                ) {
                    return;
                }


                order.orderDetails.forEach((item) => {

                    const product =
                        item?.product;

                    if (!product?.id) {
                        return;
                    }


                    const productId =
                        Number(product.id);


                    if (
                        productMap.has(productId)
                    ) {
                        return;
                    }


                    productMap.set(
                        productId,
                        {
                            productId,

                            name:
                                product.name ||
                                "Sản phẩm",

                            imageUrl:
                                product.imageUrl ||
                                "",

                            price:
                                Number(
                                    product.price || 0
                                ),

                            quantity:
                                Number(
                                    item?.quantity || 0
                                ),

                            canReview: false,

                            myReview: null,

                            reviewLoading: true
                        }
                    );

                });

            });


            const productList =
                Array.from(
                    productMap.values()
                );


            // =================================================
            // LẤY TRẠNG THÁI ĐÁNH GIÁ
            // =================================================

            const productsWithReviews =
                await Promise.all(

                    productList.map(
                        async (product) => {

                            let canReview =
                                false;

                            let myReview =
                                null;


                            // ---------------------------------
                            // KIỂM TRA CÓ QUYỀN ĐÁNH GIÁ
                            // ---------------------------------

                            try {

                                const result =
                                    await canReviewProduct(
                                        product.productId
                                    );

                                canReview =
                                    result?.canReview === true;

                            } catch (error) {

                                console.warn(
                                    "CAN REVIEW ERROR:",
                                    product.productId,
                                    error
                                );

                            }


                            // ---------------------------------
                            // LẤY ĐÁNH GIÁ CỦA BẢN THÂN
                            // ---------------------------------

                            try {

                                myReview =
                                    await getMyReview(
                                        product.productId
                                    );

                            } catch (error) {

                                console.warn(
                                    "GET MY REVIEW ERROR:",
                                    product.productId,
                                    error
                                );

                            }


                            return {
                                ...product,

                                canReview,

                                myReview:
                                    myReview || null,

                                reviewLoading:
                                    false
                            };

                        }
                    )
                );


            setProducts(
                productsWithReviews
            );

        } catch (error) {

            console.error(
                "LOAD REVIEW PRODUCTS ERROR:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Không thể tải danh sách sản phẩm đã mua."
            );

            setProducts([]);

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOAD
    // =====================================================

    useEffect(() => {

        loadProducts();

    }, []);


    // =====================================================
    // CHỈ HIỂN THỊ SẢN PHẨM CÓ THỂ ĐÁNH GIÁ
    // =====================================================

    const reviewProducts = useMemo(() => {

        return products.filter(
            (product) =>
                product.canReview
        );

    }, [products]);


    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {

        setRating(5);

        setComment("");

        setSelectedImages([]);

        setSelectedVideo(null);

        setFormError("");

        setFormSuccess("");

        setSubmitting(false);

        setUploadingMedia(false);

        setDeletingMediaId(null);

    };


    // =====================================================
    // MỞ FORM
    // =====================================================

    const openReviewForm = (product) => {

        setActiveProductId(
            product.productId
        );

        setRating(
            Number(
                product.myReview?.rating || 5
            )
        );

        setComment(
            product.myReview?.comment || ""
        );

        setSelectedImages([]);

        setSelectedVideo(null);

        setFormError("");

        setFormSuccess("");

        setSubmitting(false);

    };


    // =====================================================
    // ĐÓNG FORM
    // =====================================================

    const closeReviewForm = () => {

        if (submitting || uploadingMedia) {
            return;
        }

        setActiveProductId(null);

        resetForm();

    };


    // =====================================================
    // CHỌN ẢNH
    // =====================================================

    const handleImageChange = (event) => {

        const files =
            Array.from(
                event.target.files || []
            );

        event.target.value = "";


        if (files.length === 0) {
            return;
        }


        const activeProduct =
            products.find(
                (product) =>
                    product.productId ===
                    activeProductId
            );


        const existingImages =
            activeProduct?.myReview?.media?.filter(
                (media) =>
                    media.mediaType === "IMAGE"
            ) || [];


        const totalImages =
            existingImages.length +
            selectedImages.length;


        const remainingSlots =
            MAX_IMAGES - totalImages;


        if (remainingSlots <= 0) {

            setFormError(
                `Mỗi đánh giá chỉ được tối đa ${MAX_IMAGES} ảnh.`
            );

            return;
        }


        const imageFiles =
            files.filter(
                (file) =>
                    file.type.startsWith("image/")
            );


        if (imageFiles.length === 0) {

            setFormError(
                "Vui lòng chọn file hình ảnh."
            );

            return;
        }


        const filesToAdd =
            imageFiles.slice(
                0,
                remainingSlots
            );


        if (
            imageFiles.length >
            remainingSlots
        ) {

            setFormError(
                `Bạn chỉ có thể thêm tối đa ${remainingSlots} ảnh nữa.`
            );

        } else {

            setFormError("");

        }


        setSelectedImages(
            (prev) => [
                ...prev,
                ...filesToAdd
            ]
        );

    };


    // =====================================================
    // XÓA ẢNH CHƯA UPLOAD
    // =====================================================

    const removeSelectedImage = (index) => {

        setSelectedImages(
            (prev) =>
                prev.filter(
                    (_, imageIndex) =>
                        imageIndex !== index
                )
        );

    };


    // =====================================================
    // KIỂM TRA VIDEO
    // =====================================================

    const validateVideoDuration = (
        file
    ) => {

        return new Promise(
            (resolve) => {

                const video =
                    document.createElement(
                        "video"
                    );

                const objectUrl =
                    URL.createObjectURL(
                        file
                    );


                video.preload = "metadata";


                video.onloadedmetadata = () => {

                    const duration =
                        video.duration;


                    URL.revokeObjectURL(
                        objectUrl
                    );


                    if (
                        duration >
                        MAX_VIDEO_DURATION
                    ) {

                        resolve(false);

                        return;
                    }


                    resolve(true);

                };


                video.onerror = () => {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                    resolve(false);

                };


                video.src =
                    objectUrl;

            }
        );

    };


    // =====================================================
    // CHỌN VIDEO
    // =====================================================

    const handleVideoChange = async (
        event
    ) => {

        const file =
            event.target.files?.[0];

        event.target.value = "";


        if (!file) {
            return;
        }


        if (
            !file.type.startsWith(
                "video/"
            )
        ) {

            setFormError(
                "Vui lòng chọn file video."
            );

            return;
        }


        const activeProduct =
            products.find(
                (product) =>
                    product.productId ===
                    activeProductId
            );


        const existingVideo =
            activeProduct?.myReview?.media?.find(
                (media) =>
                    media.mediaType === "VIDEO"
            );


        if (
            existingVideo ||
            selectedVideo
        ) {

            setFormError(
                "Mỗi đánh giá chỉ được thêm tối đa 1 video."
            );

            return;
        }


        const validDuration =
            await validateVideoDuration(
                file
            );


        if (!validDuration) {

            setFormError(
                "Video phải có thời lượng không quá 30 giây hoặc không thể đọc được video."
            );

            return;
        }


        setFormError("");

        setSelectedVideo(file);

    };


    // =====================================================
    // XÓA VIDEO CHƯA UPLOAD
    // =====================================================

    const removeSelectedVideo = () => {

        setSelectedVideo(null);

    };


    // =====================================================
    // SUBMIT REVIEW
    // =====================================================

    const handleSubmitReview = async (
        product
    ) => {

        if (!product) {
            return;
        }


        if (
            !rating ||
            rating < 1 ||
            rating > 5
        ) {

            setFormError(
                "Vui lòng chọn số sao từ 1 đến 5."
            );

            return;
        }


        try {

            setSubmitting(true);

            setFormError("");

            setFormSuccess("");


            let savedReview;


            // =================================================
            // TẠO HOẶC CẬP NHẬT REVIEW
            // =================================================

            if (product.myReview) {

                savedReview =
                    await updateReview(
                        product.productId,
                        rating,
                        comment
                    );

            } else {

                savedReview =
                    await createReview(
                        product.productId,
                        rating,
                        comment
                    );

            }


            // =================================================
            // UPLOAD ẢNH + VIDEO
            // =================================================

            const mediaFiles = [
                ...selectedImages
            ];


            if (selectedVideo) {

                mediaFiles.push(
                    selectedVideo
                );

            }


            if (
                mediaFiles.length > 0 &&
                savedReview?.id
            ) {

                try {

                    setUploadingMedia(true);

                    await uploadReviewMedia(
                        savedReview.id,
                        mediaFiles
                    );

                } catch (mediaError) {

                    console.error(
                        "UPLOAD REVIEW MEDIA ERROR:",
                        mediaError
                    );

                    setFormError(
                        mediaError?.response?.data?.message ||
                        mediaError?.message ||
                        "Đánh giá đã được lưu nhưng tải ảnh/video thất bại."
                    );

                    return;

                } finally {

                    setUploadingMedia(false);

                }

            }


            // =================================================
            // TẢI LẠI DỮ LIỆU
            // =================================================

            setFormSuccess(
                product.myReview
                    ? "Đã cập nhật đánh giá."
                    : "Đã gửi đánh giá thành công."
            );


            await loadProducts();


            setSelectedImages([]);

            setSelectedVideo(null);


        } catch (error) {

            console.error(
                "SAVE REVIEW ERROR:",
                error
            );

            setFormError(
                error?.response?.data?.message ||
                error?.message ||
                "Không thể lưu đánh giá."
            );

        } finally {

            setSubmitting(false);

        }

    };


    // =====================================================
    // XÓA MEDIA ĐÃ UPLOAD
    // =====================================================

    const handleDeleteMedia = async (
        mediaId
    ) => {

        if (!mediaId) {
            return;
        }


        try {

            setDeletingMediaId(
                mediaId
            );

            setFormError("");


            await deleteReviewMedia(
                mediaId
            );


            await loadProducts();


            setFormSuccess(
                "Đã xóa media khỏi đánh giá."
            );

        } catch (error) {

            console.error(
                "DELETE REVIEW MEDIA ERROR:",
                error
            );

            setFormError(
                error?.response?.data?.message ||
                error?.message ||
                "Không thể xóa media."
            );

        } finally {

            setDeletingMediaId(null);

        }

    };


    // =====================================================
    // LẤY MEDIA CỦA REVIEW
    // =====================================================

    const getReviewImages = (
        review
    ) => {

        if (
            !Array.isArray(
                review?.media
            )
        ) {
            return [];
        }


        return review.media.filter(
            (media) =>
                media.mediaType ===
                "IMAGE"
        );

    };


    const getReviewVideo = (
        review
    ) => {

        if (
            !Array.isArray(
                review?.media
            )
        ) {
            return null;
        }


        return (
            review.media.find(
                (media) =>
                    media.mediaType ===
                    "VIDEO"
            ) || null
        );

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="reviews-page">

                <div className="reviews-container">

                    <div className="reviews-loading">
                        Đang tải sản phẩm đã mua...
                    </div>

                </div>

            </div>
        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (
            <div className="reviews-page">

                <div className="reviews-container">

                    <Link
                        to="/"
                        className="reviews-back-link"
                    >
                        <ArrowLeft size={18} />
                        Quay lại trang chủ
                    </Link>

                    <div className="reviews-error">
                        {error}
                    </div>

                </div>

            </div>
        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="reviews-page">

            <div className="reviews-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="reviews-header">

                    <div>

                        <div className="reviews-brand">
                            SMART SALES
                        </div>

                        <h1>
                            Đánh giá sản phẩm
                        </h1>

                        <p>
                            Đánh giá những sản phẩm bạn
                            đã mua và nhận hàng thành công.
                        </p>

                    </div>


                    <Link
                        to="/orders"
                        className="reviews-back-button"
                    >
                        <ArrowLeft size={18} />
                        Xem đơn hàng
                    </Link>

                </div>


                {/* =================================================
                    KHÔNG CÓ SẢN PHẨM
                ================================================= */}

                {reviewProducts.length === 0 ? (

                    <div className="reviews-empty">

                        <div className="reviews-empty-icon">
                            <MessageSquare size={34} />
                        </div>

                        <h2>
                            Chưa có sản phẩm để đánh giá
                        </h2>

                        <p>
                            Bạn chỉ có thể đánh giá sản phẩm
                            trong các đơn hàng đã hoàn thành.
                        </p>

                        <Link
                            to="/orders"
                            className="reviews-empty-button"
                        >
                            Xem đơn hàng
                        </Link>

                    </div>

                ) : (

                    <div className="reviews-product-list">

                        {reviewProducts.map(
                            (product) => {

                                const hasReview =
                                    !!product.myReview;


                                const isActive =
                                    activeProductId ===
                                    product.productId;


                                const reviewImages =
                                    getReviewImages(
                                        product.myReview
                                    );


                                const reviewVideo =
                                    getReviewVideo(
                                        product.myReview
                                    );


                                return (

                                    <div
                                        className="review-product-card"
                                        key={
                                            product.productId
                                        }
                                    >

                                        {/* =================================================
                                            ẢNH
                                        ================================================= */}

                                        <div className="review-product-image">

                                            {product.imageUrl ? (

                                                <img
                                                    src={getImageUrl(
                                                        product.imageUrl
                                                    )}
                                                    alt={
                                                        product.name
                                                    }
                                                />

                                            ) : (

                                                <div className="review-product-no-image">

                                                    <MessageSquare
                                                        size={28}
                                                    />

                                                </div>

                                            )}

                                        </div>


                                        {/* =================================================
                                            THÔNG TIN
                                        ================================================= */}

                                        <div className="review-product-info">

                                            <h2>
                                                {product.name}
                                            </h2>

                                            <div className="review-product-price">
                                                {formatPrice(
                                                    product.price
                                                )}
                                            </div>

                                            <div className="review-product-status">

                                                <CheckCircle2
                                                    size={16}
                                                />

                                                Đã mua và
                                                hoàn thành

                                            </div>


                                            {/* =================================================
                                                ĐÃ ĐÁNH GIÁ
                                            ================================================= */}

                                            {hasReview ? (

                                                <div className="review-existing">

                                                    <div className="review-existing-title">

                                                        <span>
                                                            Đánh giá của bạn
                                                        </span>

                                                        <div className="review-existing-stars">

                                                            {[
                                                                1,
                                                                2,
                                                                3,
                                                                4,
                                                                5
                                                            ].map(
                                                                (star) => (

                                                                    <Star
                                                                        key={
                                                                            star
                                                                        }
                                                                        size={
                                                                            17
                                                                        }
                                                                        fill={
                                                                            star <=
                                                                            Number(
                                                                                product.myReview.rating
                                                                            )
                                                                                ? "currentColor"
                                                                                : "none"
                                                                        }
                                                                    />

                                                                )
                                                            )}

                                                        </div>

                                                    </div>


                                                    {product.myReview.comment && (

                                                        <p>
                                                            {
                                                                product.myReview
                                                                    .comment
                                                            }
                                                        </p>

                                                    )}

                                                </div>

                                            ) : (

                                                <div className="review-not-yet">

                                                    <Star
                                                        size={18}
                                                    />

                                                    Bạn chưa đánh giá
                                                    sản phẩm này.

                                                </div>

                                            )}

                                        </div>


                                        {/* =================================================
                                            NÚT
                                        ================================================= */}

                                        <div className="review-product-action">

                                            <button
                                                type="button"
                                                className="review-product-button"
                                                onClick={() => {

                                                    if (
                                                        isActive
                                                    ) {

                                                        closeReviewForm();

                                                    } else {

                                                        openReviewForm(
                                                            product
                                                        );

                                                    }

                                                }}
                                                disabled={
                                                    submitting ||
                                                    uploadingMedia
                                                }
                                            >

                                                {isActive ? (

                                                    <>
                                                        <X
                                                            size={17}
                                                        />

                                                        Đóng

                                                    </>

                                                ) : hasReview ? (

                                                    <>
                                                        <Edit3
                                                            size={17}
                                                        />

                                                        Chỉnh sửa

                                                    </>

                                                ) : (

                                                    <>
                                                        <Star
                                                            size={17}
                                                        />

                                                        Đánh giá ngay

                                                    </>

                                                )}

                                            </button>

                                        </div>


                                        {/* =================================================
                                            FORM ĐÁNH GIÁ
                                        ================================================= */}

                                        {isActive && (

                                            <div
                                                className="review-form-card"
                                                style={{
                                                    gridColumn:
                                                        "1 / -1"
                                                }}
                                            >

                                                {/* HEADER FORM */}

                                                <div className="review-form-header">

                                                    <div>

                                                        <h2>
                                                            {hasReview
                                                                ? "Chỉnh sửa đánh giá"
                                                                : "Đánh giá sản phẩm"}
                                                        </h2>

                                                        <p>
                                                            {product.name}
                                                        </p>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="review-form-close"
                                                        onClick={
                                                            closeReviewForm
                                                        }
                                                        disabled={
                                                            submitting ||
                                                            uploadingMedia
                                                        }
                                                    >
                                                        <X
                                                            size={19}
                                                        />
                                                    </button>

                                                </div>


                                                {/* =================================================
                                                    CHỌN SAO
                                                ================================================= */}

                                                <div className="review-form-section">

                                                    <label>
                                                        Mức độ đánh giá
                                                    </label>


                                                    <div className="review-star-selector">

                                                        {[
                                                            1,
                                                            2,
                                                            3,
                                                            4,
                                                            5
                                                        ].map(
                                                            (star) => (

                                                                <button
                                                                    type="button"
                                                                    key={
                                                                        star
                                                                    }
                                                                    className={
                                                                        star <=
                                                                        rating
                                                                            ? "active"
                                                                            : ""
                                                                    }
                                                                    onClick={() =>
                                                                        setRating(
                                                                            star
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        submitting ||
                                                                        uploadingMedia
                                                                    }
                                                                    aria-label={
                                                                        `${star} sao`
                                                                    }
                                                                >

                                                                    <Star
                                                                        size={
                                                                            27
                                                                        }
                                                                        fill={
                                                                            star <=
                                                                            rating
                                                                                ? "currentColor"
                                                                                : "none"
                                                                        }
                                                                    />

                                                                </button>

                                                            )
                                                        )}

                                                    </div>


                                                    <div className="review-rating-text">

                                                        {rating === 1 &&
                                                            "Rất không hài lòng"}

                                                        {rating === 2 &&
                                                            "Không hài lòng"}

                                                        {rating === 3 &&
                                                            "Bình thường"}

                                                        {rating === 4 &&
                                                            "Hài lòng"}

                                                        {rating === 5 &&
                                                            "Rất hài lòng"}

                                                    </div>

                                                </div>


                                                {/* =================================================
                                                    NHẬN XÉT
                                                ================================================= */}

                                                <div className="review-form-section">

                                                    <label>
                                                        Nhận xét
                                                    </label>


                                                    <textarea
                                                        className="review-comment-input"
                                                        value={
                                                            comment
                                                        }
                                                        onChange={(event) =>
                                                            setComment(
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                                                        maxLength={
                                                            1000
                                                        }
                                                        disabled={
                                                            submitting ||
                                                            uploadingMedia
                                                        }
                                                    />


                                                    <div className="review-comment-count">
                                                        {comment.length}
                                                        /1000
                                                    </div>

                                                </div>


                                                {/* =================================================
                                                    MEDIA
                                                ================================================= */}

                                                <div className="review-form-section">

                                                    <label>
                                                        Hình ảnh / video
                                                    </label>


                                                    <div className="review-media-actions">

                                                        {/* INPUT ẢNH */}

                                                        <input
                                                            ref={
                                                                imageInputRef
                                                            }
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            hidden
                                                            onChange={
                                                                handleImageChange
                                                            }
                                                        />


                                                        <button
                                                            type="button"
                                                            className="review-media-button"
                                                            onClick={() =>
                                                                imageInputRef.current?.click()
                                                            }
                                                            disabled={
                                                                submitting ||
                                                                uploadingMedia ||
                                                                (
                                                                    reviewImages.length +
                                                                    selectedImages.length
                                                                ) >=
                                                                MAX_IMAGES
                                                            }
                                                        >

                                                            <ImagePlus
                                                                size={17}
                                                            />

                                                            Thêm ảnh

                                                            <span>
                                                                {reviewImages.length +
                                                                    selectedImages.length}
                                                                /{MAX_IMAGES}
                                                            </span>

                                                        </button>


                                                        {/* INPUT VIDEO */}

                                                        <input
                                                            ref={
                                                                videoInputRef
                                                            }
                                                            type="file"
                                                            accept="video/*"
                                                            hidden
                                                            onChange={
                                                                handleVideoChange
                                                            }
                                                        />


                                                        <button
                                                            type="button"
                                                            className="review-media-button"
                                                            onClick={() =>
                                                                videoInputRef.current?.click()
                                                            }
                                                            disabled={
                                                                submitting ||
                                                                uploadingMedia ||
                                                                !!reviewVideo ||
                                                                !!selectedVideo
                                                            }
                                                        >

                                                            <Video
                                                                size={17}
                                                            />

                                                            Thêm video

                                                            <span>
                                                                {reviewVideo ||
                                                                selectedVideo
                                                                    ? "1/1"
                                                                    : "0/1"}
                                                            </span>

                                                        </button>

                                                    </div>


                                                    {/* =================================================
                                                        MEDIA CŨ
                                                    ================================================= */}

                                                    {(
                                                        reviewImages.length >
                                                        0 ||
                                                        reviewVideo
                                                    ) && (

                                                        <div className="review-existing-media">

                                                            {reviewImages.map(
                                                                (media) => (

                                                                    <div
                                                                        className="review-media-item"
                                                                        key={
                                                                            media.id
                                                                        }
                                                                    >

                                                                        <img
                                                                            src={getImageUrl(
                                                                                media.fileUrl
                                                                            )}
                                                                            alt="Ảnh đánh giá"
                                                                        />


                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteMedia(
                                                                                    media.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                deletingMediaId ===
                                                                                media.id
                                                                            }
                                                                            title="Xóa ảnh"
                                                                        >

                                                                            <Trash2
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />

                                                                        </button>

                                                                    </div>

                                                                )
                                                            )}


                                                            {reviewVideo && (

                                                                <div className="review-media-item">

                                                                    <video
                                                                        src={getImageUrl(
                                                                            reviewVideo.fileUrl
                                                                        )}
                                                                        controls
                                                                    />


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteMedia(
                                                                                reviewVideo.id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            deletingMediaId ===
                                                                            reviewVideo.id
                                                                        }
                                                                        title="Xóa video"
                                                                    >

                                                                        <Trash2
                                                                            size={
                                                                                14
                                                                            }
                                                                        />

                                                                    </button>

                                                                </div>

                                                            )}

                                                        </div>

                                                    )}


                                                    {/* =================================================
                                                        ẢNH MỚI
                                                    ================================================= */}

                                                    {selectedImages.length >
                                                        0 && (

                                                            <div className="review-new-images">

                                                                {selectedImages.map(
                                                                    (
                                                                        file,
                                                                        index
                                                                    ) => (

                                                                        <div
                                                                            className="review-new-image"
                                                                            key={`${file.name}-${index}`}
                                                                        >

                                                                            <img
                                                                                src={URL.createObjectURL(
                                                                                    file
                                                                                )}
                                                                                alt="Ảnh mới"
                                                                            />


                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    removeSelectedImage(
                                                                                        index
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    submitting ||
                                                                                    uploadingMedia
                                                                                }
                                                                                title="Xóa ảnh"
                                                                            >

                                                                                <X
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                />

                                                                            </button>

                                                                        </div>

                                                                    )
                                                                )}

                                                            </div>

                                                        )}


                                                    {/* =================================================
                                                        VIDEO MỚI
                                                    ================================================= */}

                                                    {selectedVideo && (

                                                        <div className="review-selected-video">

                                                            <Video
                                                                size={18}
                                                            />

                                                            <span>
                                                                {
                                                                    selectedVideo.name
                                                                }
                                                            </span>


                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    removeSelectedVideo
                                                                }
                                                                disabled={
                                                                    submitting ||
                                                                    uploadingMedia
                                                                }
                                                                title="Xóa video"
                                                            >

                                                                <X
                                                                    size={
                                                                        16
                                                                    }
                                                                />

                                                            </button>

                                                        </div>

                                                    )}

                                                </div>


                                                {/* =================================================
                                                    ERROR
                                                ================================================= */}

                                                {formError && (

                                                    <div className="review-form-error">

                                                        {formError}

                                                    </div>

                                                )}


                                                {/* =================================================
                                                    SUCCESS
                                                ================================================= */}

                                                {formSuccess && (

                                                    <div className="review-form-success">

                                                        {formSuccess}

                                                    </div>

                                                )}


                                                {/* =================================================
                                                    ACTION
                                                ================================================= */}

                                                <div className="review-form-actions">

                                                    <button
                                                        type="button"
                                                        className="review-cancel-button"
                                                        onClick={
                                                            closeReviewForm
                                                        }
                                                        disabled={
                                                            submitting ||
                                                            uploadingMedia
                                                        }
                                                    >

                                                        Hủy

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="review-submit-button"
                                                        onClick={() =>
                                                            handleSubmitReview(
                                                                product
                                                            )
                                                        }
                                                        disabled={
                                                            submitting ||
                                                            uploadingMedia
                                                        }
                                                    >

                                                        {submitting ||
                                                        uploadingMedia ? (

                                                            <>
                                                                <Upload
                                                                    size={
                                                                        16
                                                                    }
                                                                />

                                                                {uploadingMedia
                                                                    ? "Đang tải media..."
                                                                    : "Đang lưu..."}

                                                            </>

                                                        ) : (

                                                            <>
                                                                <CheckCircle2
                                                                    size={
                                                                        16
                                                                    }
                                                                />

                                                                {hasReview
                                                                    ? "Lưu thay đổi"
                                                                    : "Gửi đánh giá"}

                                                            </>

                                                        )}

                                                    </button>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}

export default Reviews;