
import {
    Edit3,
    LoaderCircle,
    Plus,
    Search,
    Trash2,
    X,
    ImagePlus,
    Star,
    Trash,
    ChevronUp,
    ChevronDown
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState
} from "react";


import {
    createProduct,
    deleteProduct,
    getAdminProducts,
    updateProduct,
    uploadProductImages,
    getProductImages,
    addProductImages,

    // API quản lý ảnh
    deleteProductImage,
    reorderProductImages,
    setPrimaryProductImage

} from "../../services/adminProductApi";


import {
    getCategories
} from "../../services/categoryApi";

import "./AdminProducts.css";


/* =========================================================
   FORMAT GIÁ
========================================================= */

function formatPrice(price) {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {
        return "0 ₫";
    }

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(price) + " ₫";
}


/* =========================================================
   CHUYỂN IMAGE PATH THÀNH URL ĐẦY ĐỦ
========================================================= */

function getImageUrl(imageUrl) {

    if (!imageUrl) {
        return "";
    }

    // Nếu đã là URL đầy đủ
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    // Nếu là ảnh upload từ Backend
    return `http://localhost:8080${imageUrl}`;
    }


/* =========================================================
   FORM MẶC ĐỊNH
========================================================= */

const emptyForm = {

    name: "",

    categoryId: "",

    description: "",

    price: "",

    quantity: 0,

    imageUrl: "",

    status: "ACTIVE"

};


/* =========================================================
   ADMIN PRODUCTS
========================================================= */

function AdminProducts({ employeeMode = false }) {

    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [showModal, setShowModal] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);


    /* =====================================================
       ẢNH CŨ CỦA SẢN PHẨM
    ===================================================== */

    const [existingImages, setExistingImages] =
        useState([]);


    /* =====================================================
       FILE ẢNH MỚI ADMIN CHỌN
    ===================================================== */

    const [newImageFiles, setNewImageFiles] =
        useState([]);


    /* =====================================================
       PREVIEW ẢNH MỚI
    ===================================================== */

    const [newImagePreviews, setNewImagePreviews] =
        useState([]);


    /* =====================================================
       ẢNH ĐƯỢC CHỌN LÀM ẢNH CHÍNH

       Có thể là:

       old-15
       old-16
       new-0
       new-1
    ===================================================== */

    const [primaryImage, setPrimaryImage] =
        useState(null);


    /* =====================================================
       LOAD PRODUCTS + CATEGORIES
    ===================================================== */

    const loadData = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                productsData,
                categoriesData
            ] = await Promise.all([

                getAdminProducts(),

                getCategories()

            ]);


            setProducts(
                Array.isArray(productsData)
                    ? productsData
                    : []
            );


            setCategories(
                Array.isArray(categoriesData)
                    ? categoriesData
                    : []
            );


        } catch (err) {

            console.error(
                "Không thể tải dữ liệu:",
                err
            );

            setError(
                "Không thể tải danh sách sản phẩm."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    /* =====================================================
       SEARCH + FILTER
    ===================================================== */

    const filteredProducts = useMemo(() => {

        const keyword =
            search.trim().toLowerCase();


        return products.filter(product => {

            const matchesSearch =
                !keyword ||
                product.name
                    ?.toLowerCase()
                    .includes(keyword) ||
                product.description
                    ?.toLowerCase()
                    .includes(keyword);


            const matchesCategory =
                categoryFilter === "ALL" ||
                String(
                    product.category?.id
                ) === String(categoryFilter);


            return (
                matchesSearch &&
                matchesCategory
            );

        });

    }, [
        products,
        search,
        categoryFilter
    ]);


    /* =====================================================
       RESET ẢNH
    ===================================================== */

    const resetImages = () => {

        // Giải phóng URL preview
        newImagePreviews.forEach(
            preview => {

                if (preview.url) {

                    URL.revokeObjectURL(
                        preview.url
                    );

                }

            }
        );


        setExistingImages([]);

        setNewImageFiles([]);

        setNewImagePreviews([]);

        setPrimaryImage(null);

    };


    /* =====================================================
       MỞ FORM THÊM
    ===================================================== */

    const handleAdd = () => {

        setEditingId(null);

        resetImages();


        setForm({

            ...emptyForm,

            categoryId:
                categories.length > 0
                    ? categories[0].id
                    : ""

        });


        setShowModal(true);

        setError("");

    };


    /* =====================================================
       MỞ FORM SỬA
    ===================================================== */

    const handleEdit = async (product) => {

        setEditingId(product.id);

        resetImages();


        setForm({

            name:
                product.name || "",

            categoryId:
                product.category?.id || "",

            description:
                product.description || "",

            price:
                product.price ?? "",

            quantity:
                product.quantity ?? 0,

            imageUrl:
                product.imageUrl || "",

            status:
                product.status || "ACTIVE"

        });


        try {

            /* =============================================
               LẤY DANH SÁCH ẢNH CŨ
            ============================================= */

            const images =
                await getProductImages(
                    product.id
                );


            if (
                Array.isArray(images) &&
                images.length > 0
            ) {

                // Sắp xếp theo displayOrder
                const sortedImages =
                    [...images].sort(
                        (a, b) =>
                            Number(
                                a.displayOrder || 0
                            ) -
                            Number(
                                b.displayOrder || 0
                            )
                    );


                setExistingImages(
                    sortedImages
                );


                /* =========================================
                   TÌM ẢNH CHÍNH
                ========================================= */

                const primary =
                    sortedImages.find(
                        image =>
                            image.primary === true
                    );


                if (primary) {

                    setPrimaryImage(
                        `old-${primary.id}`
                    );

                    setForm(prev => ({

                        ...prev,

                        imageUrl:
                        primary.imageUrl

                    }));

                } else {

                    /* =====================================
                       Nếu Backend chưa có is_primary
                       thì tìm theo image_url
                    ===================================== */

                    const current =
                        sortedImages.find(
                            image =>
                                image.imageUrl ===
                                product.imageUrl
                        );


                    if (current) {

                        setPrimaryImage(
                            `old-${current.id}`
                        );

                    } else {

                        // Mặc định ảnh đầu tiên
                        setPrimaryImage(
                            `old-${sortedImages[0].id}`
                        );

                    }

                }

            } else {

                /* =========================================
                   SẢN PHẨM CŨ CHƯA CÓ product_images
                ========================================= */

                if (product.imageUrl) {

                    const legacyImage = {

                        id:
                            `legacy-${product.id}`,

                        imageUrl:
                        product.imageUrl,

                        primary:
                            true,

                        displayOrder:
                            1

                    };


                    setExistingImages([
                        legacyImage
                    ]);


                    setPrimaryImage(
                        `old-${legacyImage.id}`
                    );

                }

            }


        } catch (err) {

            console.warn(
                "Không lấy được ảnh sản phẩm:",
                err
            );


            /* =============================================
               FALLBACK ẢNH CŨ
            ============================================= */

            if (product.imageUrl) {

                const legacyImage = {

                    id:
                        `legacy-${product.id}`,

                    imageUrl:
                    product.imageUrl,

                    primary:
                        true,

                    displayOrder:
                        1

                };


                setExistingImages([
                    legacyImage
                ]);


                setPrimaryImage(
                    `old-${legacyImage.id}`
                );

            }

        }


        setShowModal(true);

        setError("");

    };


    /* =====================================================
       ĐÓNG FORM
    ===================================================== */

    const handleCloseModal = () => {

        if (saving) {
            return;
        }


        resetImages();


        setShowModal(false);

        setEditingId(null);

        setForm(emptyForm);

    };


    /* =====================================================
       HANDLE CHANGE
    ===================================================== */

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setForm(prev => ({

            ...prev,

            [name]: value

        }));

    };


    /* =====================================================
       CHỌN NHIỀU ẢNH
    ===================================================== */

    const handleImageChange = (event) => {

        const files =
            Array.from(
                event.target.files || []
            );


        if (files.length === 0) {
            return;
        }


        const MAX_NEW_IMAGES = 10;


        if (
            newImageFiles.length +
            files.length >
            MAX_NEW_IMAGES
        ) {

            alert(
                `Bạn chỉ có thể chọn tối đa ${MAX_NEW_IMAGES} ảnh mới.`
            );

            event.target.value = "";

            return;
        }


        const validFiles = [];


        for (const file of files) {

            /* =============================================
               KIỂM TRA ĐỊNH DẠNG
            ============================================= */

            if (
                !file.type.startsWith("image/")
            ) {

                alert(
                    `File "${file.name}" không phải là hình ảnh.`
                );

                continue;
            }


            /* =============================================
               GIỚI HẠN 5MB
            ============================================= */

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    `Ảnh "${file.name}" vượt quá 5MB.`
                );

                continue;
            }


            validFiles.push(file);

        }


        if (validFiles.length === 0) {

            event.target.value = "";

            return;
        }


        /* =============================================
           TẠO PREVIEW
        ============================================= */

        const startIndex =
            newImageFiles.length;


        const previews =
            validFiles.map(
                (file, index) => ({

                    file,

                    url:
                        URL.createObjectURL(
                            file
                        ),

                    originalIndex:
                        startIndex + index

                })
            );


        setNewImageFiles(
            prev => [
                ...prev,
                ...validFiles
            ]
        );


        setNewImagePreviews(
            prev => [
                ...prev,
                ...previews
            ]
        );


        /* =============================================
           NẾU CHƯA CÓ ẢNH CHÍNH
           -> chọn ảnh mới đầu tiên
        ============================================= */

        if (!primaryImage) {

            setPrimaryImage(
                `new-${startIndex}`
            );

        }


        event.target.value = "";

    };


    /* =====================================================
       XÓA ẢNH MỚI
    ===================================================== */

    const handleRemoveNewImage = (index) => {

        const image =
            newImagePreviews[index];


        if (image?.url) {

            URL.revokeObjectURL(
                image.url
            );

        }


        const oldPrimary =
            primaryImage;


        /* =============================================
           XÓA FILE
        ============================================= */

        setNewImageFiles(prev =>
            prev.filter(
                (_, i) =>
                    i !== index
            )
        );


        /* =============================================
           XÓA PREVIEW
        ============================================= */

        setNewImagePreviews(prev =>
            prev.filter(
                (_, i) =>
                    i !== index
            )
        );


        /* =============================================
           CẬP NHẬT ẢNH CHÍNH
        ============================================= */

        if (
            oldPrimary ===
            `new-${index}`
        ) {

            const remainingNew =
                newImagePreviews.filter(
                    (_, i) =>
                        i !== index
                );


            if (
                remainingNew.length > 0
            ) {

                setPrimaryImage(
                    `new-${
                        index === 0
                            ? 0
                            : 0
                    }`
                );

            } else if (
                existingImages.length > 0
            ) {

                setPrimaryImage(
                    `old-${existingImages[0].id}`
                );

                setForm(prev => ({

                    ...prev,

                    imageUrl:
                    existingImages[0].imageUrl

                }));

            } else {

                setPrimaryImage(null);

                setForm(prev => ({

                    ...prev,

                    imageUrl: ""

                }));

            }

        } else if (
            oldPrimary?.startsWith("new-")
        ) {

            /* =========================================
               Nếu xóa ảnh đứng trước ảnh chính
               -> giảm index ảnh chính
            ========================================= */

            const primaryIndex =
                Number(
                    oldPrimary.replace(
                        "new-",
                        ""
                    )
                );


            if (
                primaryIndex > index
            ) {

                setPrimaryImage(
                    `new-${primaryIndex - 1}`
                );

            }

        }

    };


    /* =====================================================
       CHỌN ẢNH CHÍNH
    ===================================================== */

    const handleSetPrimary = (imageKey) => {

        setPrimaryImage(
            imageKey
        );


        /* =============================================
           Nếu là ảnh cũ
           -> cập nhật imageUrl ngay trên form
        ============================================= */

        if (
            imageKey.startsWith("old-")
        ) {

            const oldId =
                imageKey.replace(
                    "old-",
                    ""
                );


            const image =
                existingImages.find(
                    item =>
                        String(item.id) ===
                        String(oldId)
                );


            if (image) {

                setForm(prev => ({

                    ...prev,

                    imageUrl:
                    image.imageUrl

                }));

            }

        }

    };


    /* =========================================================
       XÓA ẢNH CŨ ĐÃ LƯU
    ========================================================= */

    const handleDeleteOldImage = async (image) => {

        /* =============================================
           ẢNH LEGACY

           legacy-10

           Không có ID database thật
        ============================================= */

        if (
            String(image.id)
                .startsWith("legacy-")
        ) {

            alert(
                "Ảnh này là ảnh cũ chưa được lưu trong danh sách ảnh. Bạn không thể xóa trực tiếp ảnh này."
            );

            return;
        }


        /* =============================================
           XÁC NHẬN
        ============================================= */

        const confirmed =
            window.confirm(
                "Bạn có chắc chắn muốn xóa ảnh này không?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setSaving(true);


            /* =========================================
               GỌI API XÓA
            ========================================= */

            let updatedImages =
                await deleteProductImage(
                    editingId,
                    image.id
                );


            if (
                !Array.isArray(updatedImages)
            ) {

                updatedImages =
                    await getProductImages(
                        editingId
                    );

            }


            /* =========================================
               SẮP XẾP LẠI
            ========================================= */

            const sortedImages =
                [...(updatedImages || [])]
                    .sort(
                        (a, b) =>
                            Number(
                                a.displayOrder || 0
                            ) -
                            Number(
                                b.displayOrder || 0
                            )
                    );


            setExistingImages(
                sortedImages
            );


            /* =========================================
               KIỂM TRA ẢNH CHÍNH
            ========================================= */

            const currentPrimary =
                sortedImages.find(
                    item =>
                        item.primary === true
                );


            if (currentPrimary) {

                setPrimaryImage(
                    `old-${currentPrimary.id}`
                );

                setForm(prev => ({

                    ...prev,

                    imageUrl:
                    currentPrimary.imageUrl

                }));

            } else if (
                sortedImages.length > 0
            ) {

                /* =====================================
                   Nếu Backend chưa tự chọn ảnh chính
                   -> chọn ảnh đầu tiên
                ===================================== */

                const firstImage =
                    sortedImages[0];


                try {

                    const primaryResult =
                        await setPrimaryProductImage(
                            editingId,
                            firstImage.id
                        );


                    if (
                        Array.isArray(
                            primaryResult
                        )
                    ) {

                        setExistingImages(
                            primaryResult
                        );

                    }

                } catch (primaryError) {

                    console.warn(
                        "Không thể tự chọn ảnh chính:",
                        primaryError
                    );

                }


                setPrimaryImage(
                    `old-${firstImage.id}`
                );


                setForm(prev => ({

                    ...prev,

                    imageUrl:
                    firstImage.imageUrl

                }));

            } else {

                /* =====================================
                   Không còn ảnh
                ===================================== */

                setPrimaryImage(null);

                setForm(prev => ({

                    ...prev,

                    imageUrl: ""

                }));

            }


            alert(
                "Đã xóa ảnh thành công."
            );


        } catch (error) {

            console.error(
                "DELETE PRODUCT IMAGE ERROR:",
                error
            );


            alert(
                error?.response?.data?.message ||
                error?.response?.data ||
                "Không thể xóa ảnh. Vui lòng thử lại."
            );

        } finally {

            setSaving(false);

        }

    };


    /* =========================================================
       ĐỔI VỊ TRÍ ẢNH CŨ
    ========================================================= */

    const handleMoveOldImage = async (
        index,
        direction
    ) => {

        const newIndex =
            index + direction;


        /* =============================================
           Không vượt giới hạn
        ============================================= */

        if (
            newIndex < 0 ||
            newIndex >= existingImages.length
        ) {

            return;
        }


        /* =============================================
           ẢNH LEGACY KHÔNG REORDER ĐƯỢC
        ============================================= */

        const currentImage =
            existingImages[index];

        const targetImage =
            existingImages[newIndex];


        if (
            String(currentImage.id)
                .startsWith("legacy-") ||
            String(targetImage.id)
                .startsWith("legacy-")
        ) {

            alert(
                "Ảnh cũ này chưa được lưu trong danh sách ảnh nên chưa thể đổi thứ tự."
            );

            return;
        }


        /* =============================================
           TẠO DANH SÁCH MỚI
        ============================================= */

        const reorderedImages =
            [...existingImages];


        [
            reorderedImages[index],
            reorderedImages[newIndex]
        ] = [
            reorderedImages[newIndex],
            reorderedImages[index]
        ];


        /* =============================================
           HIỂN THỊ NGAY TRÊN GIAO DIỆN
        ============================================= */

        setExistingImages(
            reorderedImages
        );


        try {

            setSaving(true);


            const imageIds =
                reorderedImages.map(
                    image =>
                        Number(image.id)
                );


            /* =========================================
               GỌI BACKEND
            ========================================= */

            const updatedImages =
                await reorderProductImages(
                    editingId,
                    imageIds
                );


            if (
                Array.isArray(updatedImages)
            ) {

                setExistingImages(
                    [...updatedImages].sort(
                        (a, b) =>
                            Number(
                                a.displayOrder || 0
                            ) -
                            Number(
                                b.displayOrder || 0
                            )
                    )
                );

            }


        } catch (error) {

            console.error(
                "REORDER IMAGE ERROR:",
                error
            );


            alert(
                error?.response?.data?.message ||
                error?.response?.data ||
                "Không thể thay đổi thứ tự ảnh."
            );


            /* =========================================
               LOAD LẠI THỨ TỰ THẬT
            ========================================= */

            try {

                const images =
                    await getProductImages(
                        editingId
                    );


                setExistingImages(
                    [...(images || [])].sort(
                        (a, b) =>
                            Number(
                                a.displayOrder || 0
                            ) -
                            Number(
                                b.displayOrder || 0
                            )
                    )
                );

            } catch (reloadError) {

                console.error(
                    reloadError
                );

            }

        } finally {

            setSaving(false);

        }

    };


    /* =========================================================
       ĐỔI VỊ TRÍ ẢNH MỚI

       Ảnh mới chưa lưu Backend nên chỉ đổi trong Frontend.
    ========================================================= */

    const handleMoveNewImage = (
        index,
        direction
    ) => {

        const newIndex =
            index + direction;


        if (
            newIndex < 0 ||
            newIndex >= newImagePreviews.length
        ) {

            return;
        }


        /* =============================================
           ĐỔI FILE
        ============================================= */

        const updatedFiles =
            [...newImageFiles];


        [
            updatedFiles[index],
            updatedFiles[newIndex]
        ] = [
            updatedFiles[newIndex],
            updatedFiles[index]
        ];


        /* =============================================
           ĐỔI PREVIEW
        ============================================= */

        const updatedPreviews =
            [...newImagePreviews];


        [
            updatedPreviews[index],
            updatedPreviews[newIndex]
        ] = [
            updatedPreviews[newIndex],
            updatedPreviews[index]
        ];


        setNewImageFiles(
            updatedFiles
        );


        setNewImagePreviews(
            updatedPreviews
        );


        /* =============================================
           CẬP NHẬT PRIMARY INDEX
        ============================================= */

        if (
            primaryImage?.startsWith("new-")
        ) {

            const primaryIndex =
                Number(
                    primaryImage.replace(
                        "new-",
                        ""
                    )
                );


            if (
                primaryIndex === index
            ) {

                setPrimaryImage(
                    `new-${newIndex}`
                );

            } else if (
                primaryIndex === newIndex
            ) {

                setPrimaryImage(
                    `new-${index}`
                );

            }

        }

    };


    /* =========================================================
       CHỌN ẢNH CŨ LÀM ẢNH CHÍNH
    ========================================================= */

    const handleSetOldImagePrimary = async (
        image
    ) => {

        /* =============================================
           LEGACY IMAGE
        ============================================= */

        if (
            String(image.id)
                .startsWith("legacy-")
        ) {

            setPrimaryImage(
                `old-${image.id}`
            );


            setForm(prev => ({

                ...prev,

                imageUrl:
                image.imageUrl

            }));


            return;
        }


        try {

            setSaving(true);


            /* =========================================
               GỌI BACKEND
            ========================================= */

            const updatedImages =
                await setPrimaryProductImage(
                    editingId,
                    image.id
                );


            if (
                Array.isArray(updatedImages)
            ) {

                setExistingImages(
                    updatedImages
                );

            }


            /* =========================================
               CẬP NHẬT STATE
            ========================================= */

            setPrimaryImage(
                `old-${image.id}`
            );


            setForm(prev => ({

                ...prev,

                imageUrl:
                image.imageUrl

            }));


        } catch (error) {

            console.error(
                "SET PRIMARY IMAGE ERROR:",
                error
            );


            alert(
                error?.response?.data?.message ||
                error?.response?.data ||
                "Không thể chọn ảnh chính."
            );

        } finally {

            setSaving(false);

        }

    };


    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = async (event) => {

        event.preventDefault();


        /* =================================================
           VALIDATE
        ================================================= */

        if (!form.name.trim()) {

            alert(
                "Vui lòng nhập tên sản phẩm."
            );

            return;
        }


        if (!form.categoryId) {

            alert(
                "Vui lòng chọn danh mục."
            );

            return;
        }


        if (
            form.price === "" ||
            Number(form.price) < 0
        ) {

            alert(
                "Giá sản phẩm không hợp lệ."
            );

            return;
        }


        if (
            form.quantity === "" ||
            Number(form.quantity) < 0
        ) {

            alert(
                "Số lượng không hợp lệ."
            );

            return;
        }


        try {

            setSaving(true);


            /* =================================================
               1. UPLOAD ẢNH MỚI
            ================================================= */

            let uploadedImageUrls = [];


            if (
                newImageFiles.length > 0
            ) {

                const uploadResult =
                    await uploadProductImages(
                        newImageFiles
                    );


                uploadedImageUrls =
                    Array.isArray(
                        uploadResult?.imageUrls
                    )
                        ? uploadResult.imageUrls
                        : [];


                if (
                    uploadedImageUrls.length !==
                    newImageFiles.length
                ) {

                    throw new Error(
                        "Upload ảnh không đầy đủ. Vui lòng thử lại."
                    );

                }

            }


            /* =================================================
               2. XÁC ĐỊNH ẢNH CHÍNH
            ================================================= */

            let mainImageUrl =
                form.imageUrl || null;


            /* =================================================
               NẾU ẢNH CHÍNH LÀ ẢNH MỚI
            ================================================= */

            if (
                primaryImage?.startsWith("new-")
            ) {

                const newIndex =
                    Number(
                        primaryImage.replace(
                            "new-",
                            ""
                        )
                    );


                if (
                    uploadedImageUrls[newIndex]
                ) {

                    mainImageUrl =
                        uploadedImageUrls[
                            newIndex
                            ];

                }

            }


            /* =================================================
               NẾU ẢNH CHÍNH LÀ ẢNH CŨ
            ================================================= */

            if (
                primaryImage?.startsWith("old-")
            ) {

                const oldId =
                    primaryImage.replace(
                        "old-",
                        ""
                    );


                const oldImage =
                    existingImages.find(
                        image =>
                            String(image.id) ===
                            String(oldId)
                    );


                if (oldImage) {

                    mainImageUrl =
                        oldImage.imageUrl;

                }

            }


            /* =================================================
               3. PRODUCT DATA
            ================================================= */

            const productData = {

                category: {

                    id:
                        Number(
                            form.categoryId
                        )

                },

                name:
                    form.name.trim(),

                description:
                    form.description.trim(),

                price:
                    Number(form.price),

                quantity:
                    Number(form.quantity),

                // imageUrl = ảnh chính
                imageUrl:
                mainImageUrl,

                status:
                form.status

            };


            /* =================================================
               4. THÊM SẢN PHẨM
            ================================================= */

            if (!editingId) {

                /* =============================================
                   TẠO PRODUCT
                ============================================= */

                const createdProduct =
                    await createProduct(
                        productData
                    );


                const productId =
                    createdProduct?.id;


                if (!productId) {

                    throw new Error(
                        "Không lấy được ID sản phẩm sau khi tạo."
                    );

                }


                /* =============================================
                   LƯU NHIỀU ẢNH
                ============================================= */

                if (
                    uploadedImageUrls.length > 0
                ) {

                    await addProductImages(
                        productId,
                        uploadedImageUrls
                    );


                    /* =========================================
                       Nếu ảnh chính không phải ảnh đầu tiên
                       -> cập nhật lại ảnh chính
                    ========================================= */

                    if (
                        primaryImage?.startsWith(
                            "new-"
                        )
                    ) {

                        const newIndex =
                            Number(
                                primaryImage.replace(
                                    "new-",
                                    ""
                                )
                            );


                        const mainUrl =
                            uploadedImageUrls[
                                newIndex
                                ];


                        const savedImages =
                            await getProductImages(
                                productId
                            );


                        const mainImage =
                            savedImages.find(
                                image =>
                                    image.imageUrl ===
                                    mainUrl
                            );


                        if (mainImage) {

                            await setPrimaryProductImage(
                                productId,
                                mainImage.id
                            );

                        }

                    }

                }


                alert(
                    "Thêm sản phẩm thành công!"
                );


            } else {

                /* =================================================
                   5. CẬP NHẬT PRODUCT
                ================================================= */

                await updateProduct(
                    editingId,
                    productData
                );


                /* =================================================
                   6. THÊM ẢNH MỚI
                ================================================= */

                if (
                    uploadedImageUrls.length > 0
                ) {

                    await addProductImages(
                        editingId,
                        uploadedImageUrls
                    );


                    /* =============================================
                       Nếu ảnh mới được chọn làm ảnh chính
                    ============================================= */

                    if (
                        primaryImage?.startsWith(
                            "new-"
                        )
                    ) {

                        const newIndex =
                            Number(
                                primaryImage.replace(
                                    "new-",
                                    ""
                                )
                            );


                        const mainUrl =
                            uploadedImageUrls[
                                newIndex
                                ];


                        const savedImages =
                            await getProductImages(
                                editingId
                            );


                        const mainImage =
                            savedImages.find(
                                image =>
                                    image.imageUrl ===
                                    mainUrl
                            );


                        if (mainImage) {

                            await setPrimaryProductImage(
                                editingId,
                                mainImage.id
                            );

                        }

                    }

                }


                /* =================================================
                   7. NẾU ẢNH CHÍNH LÀ ẢNH CŨ
                   đảm bảo Backend cũng đồng bộ
                ================================================= */

                if (
                    primaryImage?.startsWith(
                        "old-"
                    )
                ) {

                    const oldId =
                        primaryImage.replace(
                            "old-",
                            ""
                        );


                    if (
                        !oldId.startsWith(
                            "legacy-"
                        )
                    ) {

                        await setPrimaryProductImage(
                            editingId,
                            Number(oldId)
                        );

                    }

                }


                alert(
                    "Cập nhật sản phẩm thành công!"
                );

            }


            /* =================================================
               LOAD LẠI DANH SÁCH
            ================================================= */

            await loadData();


            /* =================================================
               ĐÓNG MODAL
            ================================================= */

            handleCloseModal();


        } catch (err) {

            console.error(
                "Lưu sản phẩm thất bại:",
                err
            );


            alert(
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Không thể lưu sản phẩm."
            );

        } finally {

            setSaving(false);

        }

    };


    /* =====================================================
       DELETE PRODUCT
    ===================================================== */

    const handleDelete = async (product) => {

        const confirmed =
            window.confirm(
                `Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteProduct(
                product.id
            );


            setProducts(prev =>
                prev.filter(
                    item =>
                        item.id !== product.id
                )
            );


            alert(
                "Xóa sản phẩm thành công!"
            );


        } catch (err) {

            console.error(
                "Xóa sản phẩm thất bại:",
                err
            );


            alert(
                err?.response?.data?.message ||
                "Không thể xóa sản phẩm."
            );

        }

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="admin-products-loading">

                <LoaderCircle
                    size={30}
                    className="admin-products-spinner"
                />

                <span>
                    Đang tải sản phẩm...
                </span>

            </div>

        );

    }


    return (

        <div className="admin-products">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-products-header">

                <div>

                    <span className="admin-page-label">
                        QUẢN LÝ
                    </span>

                    <h1>
                        Sản phẩm
                    </h1>

                    <p>
                        {employeeMode
                            ? "Thêm và cập nhật sản phẩm trong hệ thống Smart Sales."
                            : "Quản lý toàn bộ sản phẩm trong hệ thống Smart Sales."
                        }
                    </p>

                </div>


                <button
                    className="admin-primary-button"
                    onClick={handleAdd}
                >

                    <Plus size={18} />

                    Thêm sản phẩm

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="admin-products-error">

                    {error}

                </div>

            )}


            {/* =================================================
                FILTER
            ================================================= */}

            <div className="admin-products-toolbar">

                <div className="admin-search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={categoryFilter}
                    onChange={event =>
                        setCategoryFilter(
                            event.target.value
                        )
                    }
                    className="admin-filter-select"
                >

                    <option value="ALL">
                        Tất cả danh mục
                    </option>


                    {categories.map(
                        category => (

                            <option
                                key={category.id}
                                value={category.id}
                            >

                                {category.name}

                            </option>

                        )
                    )}

                </select>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="admin-products-table-wrapper">

                <table className="admin-products-table">

                    <thead>

                    <tr>

                        <th>
                            ID
                        </th>

                        <th>
                            Sản phẩm
                        </th>

                        <th>
                            Danh mục
                        </th>

                        <th>
                            Giá
                        </th>

                        <th>
                            Số lượng
                        </th>

                        <th>
                            Trạng thái
                        </th>

                        <th>
                            Thao tác
                        </th>

                    </tr>

                    </thead>


                    <tbody>

                    {filteredProducts.length === 0 ? (

                        <tr>

                            <td
                                colSpan="7"
                                className="admin-products-empty"
                            >

                                Không tìm thấy sản phẩm.

                            </td>

                        </tr>

                    ) : (

                        filteredProducts.map(
                            product => (

                                <tr
                                    key={
                                        product.id
                                    }
                                >

                                    {/* ID */}

                                    <td>

                                        <span className="admin-product-id">

                                            #{product.id}

                                        </span>

                                    </td>


                                    {/* PRODUCT */}

                                    <td>

                                        <div className="admin-product-info">

                                            <div className="admin-product-image">

                                                {product.imageUrl ? (

                                                    <img
                                                        src={
                                                            getImageUrl(
                                                                product.imageUrl
                                                            )
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                    />

                                                ) : (

                                                    <span>
                                                        📦
                                                    </span>

                                                )}

                                            </div>


                                            <div>

                                                <strong>

                                                    {product.name}

                                                </strong>

                                                <span>

                                                    {
                                                        product.description ||
                                                        "Không có mô tả"
                                                    }

                                                </span>

                                            </div>

                                        </div>

                                    </td>


                                    {/* CATEGORY */}

                                    <td>

                                        <span className="admin-category-badge">

                                            {
                                                product
                                                    .category
                                                    ?.name
                                                ||
                                                "Chưa phân loại"
                                            }

                                        </span>

                                    </td>


                                    {/* PRICE */}

                                    <td>

                                        <strong className="admin-product-price">

                                            {formatPrice(
                                                product.price
                                            )}

                                        </strong>

                                    </td>


                                    {/* QUANTITY */}

                                    <td>

                                        <span
                                            className={
                                                Number(
                                                    product.quantity
                                                ) <= 0
                                                    ? "admin-stock out"
                                                    : Number(
                                                        product.quantity
                                                    ) <= 5
                                                        ? "admin-stock low"
                                                        : "admin-stock"
                                            }
                                        >

                                            {
                                                product.quantity ??
                                                0
                                            }

                                        </span>

                                    </td>


                                    {/* STATUS */}

                                    <td>

                                        <span
                                            className={
                                                `admin-status ${
                                                    product.status ===
                                                    "ACTIVE"
                                                        ? "active"
                                                        : "inactive"
                                                }`
                                            }
                                        >

                                            {product.status ===
                                            "ACTIVE"
                                                ? "Đang bán"
                                                : "Ngừng bán"
                                            }

                                        </span>

                                    </td>


                                    {/* ACTION */}

                                    <td>

                                        <div className="admin-product-actions">

                                            <button
                                                className="admin-action-edit"
                                                title="Sửa"
                                                onClick={() =>
                                                    handleEdit(
                                                        product
                                                    )
                                                }
                                            >

                                                <Edit3
                                                    size={17}
                                                />

                                            </button>


                                            {!employeeMode && (

                                                <button
                                                    className="admin-action-delete"
                                                    title="Xóa"
                                                    onClick={() =>
                                                        handleDelete(
                                                            product
                                                        )
                                                    }
                                                >

                                                    <Trash2
                                                        size={17}
                                                    />

                                                </button>

                                            )}

                                        </div>

                                    </td>

                                </tr>

                            )

                        )

                    )}

                    </tbody>

                </table>

            </div>


            {/* =================================================
                COUNT
            ================================================= */}

            <div className="admin-products-count">

                Hiển thị{" "}

                <strong>
                    {filteredProducts.length}
                </strong>

                {" "} / {" "}

                <strong>
                    {products.length}
                </strong>

                {" "} sản phẩm

            </div>


            {/* =================================================
                MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="admin-modal-overlay"

                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            handleCloseModal();

                        }

                    }}
                >

                    <div className="admin-product-modal">


                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="admin-modal-header">

                            <div>

                                <span>

                                    {editingId
                                        ? "CẬP NHẬT"
                                        : "THÊM MỚI"
                                    }

                                </span>

                                <h2>

                                    {editingId
                                        ? "Sửa sản phẩm"
                                        : "Thêm sản phẩm"
                                    }

                                </h2>

                            </div>


                            <button
                                className="admin-modal-close"
                                onClick={
                                    handleCloseModal
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form
                            className="admin-product-form"
                            onSubmit={
                                handleSubmit
                            }
                        >


                            {/* =================================================
                                NAME
                            ================================================= */}

                            <div className="admin-form-group">

                                <label>

                                    Tên sản phẩm

                                    <span>
                                        *
                                    </span>

                                </label>

                                <input
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Nhập tên sản phẩm"
                                />

                            </div>


                            {/* =================================================
                                CATEGORY + STATUS
                            ================================================= */}

                            <div className="admin-form-row">

                                <div className="admin-form-group">

                                    <label>

                                        Danh mục

                                        <span>
                                            *
                                        </span>

                                    </label>

                                    <select
                                        name="categoryId"
                                        value={
                                            form.categoryId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">

                                            -- Chọn danh mục --

                                        </option>


                                        {categories.map(
                                            category => (

                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >

                                                    {
                                                        category.name
                                                    }

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Trạng thái
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            form.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="ACTIVE">
                                            Đang bán
                                        </option>

                                        <option value="INACTIVE">
                                            Ngừng bán
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* =================================================
                                PRICE + QUANTITY
                            ================================================= */}

                            <div className="admin-form-row">

                                <div className="admin-form-group">

                                    <label>

                                        Giá bán

                                        <span>
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        step="0.01"
                                        value={
                                            form.price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>

                                        Số lượng

                                        <span>
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="number"
                                        name="quantity"
                                        min="0"
                                        step="1"
                                        value={
                                            form.quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                NHIỀU ẢNH
                            ================================================= */}

                            <div className="admin-form-group">

                                <label>

                                    Hình ảnh sản phẩm

                                </label>


                                <div
                                    style={{
                                        border:
                                            "1px dashed #cbd5e1",
                                        borderRadius:
                                            "10px",
                                        padding:
                                            "16px",
                                        background:
                                            "#f8fafc"
                                    }}
                                >

                                    {/* =================================================
                                        INPUT CHỌN NHIỀU FILE
                                    ================================================= */}

                                    <label
                                        htmlFor="product-images"
                                        style={{
                                            display:
                                                "inline-flex",
                                            alignItems:
                                                "center",
                                            gap:
                                                "8px",
                                            padding:
                                                "10px 16px",
                                            borderRadius:
                                                "8px",
                                            background:
                                                "#2563eb",
                                            color:
                                                "#fff",
                                            cursor:
                                                "pointer",
                                            fontWeight:
                                                "600"
                                        }}
                                    >

                                        <ImagePlus
                                            size={18}
                                        />

                                        Chọn nhiều ảnh

                                    </label>


                                    <input
                                        id="product-images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={
                                            handleImageChange
                                        }
                                        style={{
                                            display:
                                                "none"
                                        }}
                                    />


                                    <p
                                        style={{
                                            margin:
                                                "10px 0 0",
                                            fontSize:
                                                "13px",
                                            color:
                                                "#64748b"
                                        }}
                                    >

                                        Có thể chọn nhiều ảnh.
                                        Mỗi ảnh tối đa 5MB.

                                    </p>


                                    {/* =================================================
                                        ẢNH CŨ
                                    ================================================= */}

                                    {existingImages.length >
                                        0 && (

                                            <div
                                                style={{
                                                    marginTop:
                                                        "18px"
                                                }}
                                            >

                                                <h4
                                                    style={{
                                                        margin:
                                                            "0 0 10px",
                                                        fontSize:
                                                            "14px"
                                                    }}
                                                >

                                                    Ảnh hiện tại

                                                </h4>


                                                <div
                                                    style={{
                                                        display:
                                                            "grid",
                                                        gridTemplateColumns:
                                                            "repeat(auto-fill, minmax(125px, 1fr))",
                                                        gap:
                                                            "12px"
                                                    }}
                                                >

                                                    {existingImages.map(
                                                        (
                                                            image,
                                                            index
                                                        ) => {

                                                            const imageKey =
                                                                `old-${image.id}`;

                                                            const isPrimary =
                                                                primaryImage ===
                                                                imageKey;

                                                            const isLegacy =
                                                                String(
                                                                    image.id
                                                                ).startsWith(
                                                                    "legacy-"
                                                                );


                                                            return (

                                                                <div
                                                                    key={
                                                                        imageKey
                                                                    }
                                                                    style={{
                                                                        position:
                                                                            "relative",
                                                                        border:
                                                                            isPrimary
                                                                                ? "2px solid #2563eb"
                                                                                : "1px solid #e2e8f0",
                                                                        borderRadius:
                                                                            "8px",
                                                                        padding:
                                                                            "5px",
                                                                        background:
                                                                            "#fff"
                                                                    }}
                                                                >

                                                                    {/* =====================================
                                                                        IMAGE
                                                                    ===================================== */}

                                                                    <img
                                                                        src={
                                                                            getImageUrl(
                                                                                image.imageUrl
                                                                            )
                                                                        }
                                                                        alt="Ảnh sản phẩm"
                                                                        style={{
                                                                            width:
                                                                                "100%",
                                                                            height:
                                                                                "100px",
                                                                            objectFit:
                                                                                "cover",
                                                                            borderRadius:
                                                                                "5px",
                                                                            display:
                                                                                "block"
                                                                        }}
                                                                    />


                                                                    {/* =====================================
                                                                        BADGE ẢNH CHÍNH
                                                                    ===================================== */}

                                                                    {isPrimary && (

                                                                        <span
                                                                            style={{
                                                                                position:
                                                                                    "absolute",
                                                                                top:
                                                                                    "8px",
                                                                                left:
                                                                                    "8px",
                                                                                background:
                                                                                    "#2563eb",
                                                                                color:
                                                                                    "#fff",
                                                                                padding:
                                                                                    "3px 7px",
                                                                                borderRadius:
                                                                                    "5px",
                                                                                fontSize:
                                                                                    "11px",
                                                                                fontWeight:
                                                                                    "600"
                                                                            }}
                                                                        >

                                                                            Ảnh chính

                                                                        </span>

                                                                    )}


                                                                    {/* =====================================
                                                                        NÚT XÓA ẢNH
                                                                    ===================================== */}

                                                                    {!isLegacy && (

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteOldImage(
                                                                                    image
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                saving
                                                                            }
                                                                            style={{
                                                                                position:
                                                                                    "absolute",
                                                                                top:
                                                                                    "5px",
                                                                                right:
                                                                                    "5px",
                                                                                width:
                                                                                    "26px",
                                                                                height:
                                                                                    "26px",
                                                                                border:
                                                                                    "none",
                                                                                borderRadius:
                                                                                    "50%",
                                                                                background:
                                                                                    "#ef4444",
                                                                                color:
                                                                                    "#fff",
                                                                                display:
                                                                                    "flex",
                                                                                alignItems:
                                                                                    "center",
                                                                                justifyContent:
                                                                                    "center",
                                                                                cursor:
                                                                                    saving
                                                                                        ? "not-allowed"
                                                                                        : "pointer",
                                                                                zIndex:
                                                                                    2
                                                                            }}
                                                                            title="Xóa ảnh"
                                                                        >

                                                                            <Trash
                                                                                size={
                                                                                    13
                                                                                }
                                                                            />

                                                                        </button>

                                                                    )}


                                                                    {/* =====================================
                                                                        NÚT ĐỔI VỊ TRÍ
                                                                    ===================================== */}

                                                                    {!isLegacy && (

                                                                        <div
                                                                            style={{
                                                                                display:
                                                                                    "flex",
                                                                                gap:
                                                                                    "4px",
                                                                                marginTop:
                                                                                    "6px"
                                                                            }}
                                                                        >

                                                                            <button
                                                                                type="button"
                                                                                disabled={
                                                                                    saving ||
                                                                                    index === 0
                                                                                }
                                                                                onClick={() =>
                                                                                    handleMoveOldImage(
                                                                                        index,
                                                                                        -1
                                                                                    )
                                                                                }
                                                                                style={{
                                                                                    flex:
                                                                                        1,
                                                                                    border:
                                                                                        "1px solid #e2e8f0",
                                                                                    background:
                                                                                        index === 0
                                                                                            ? "#f8fafc"
                                                                                            : "#fff",
                                                                                    color:
                                                                                        index === 0
                                                                                            ? "#cbd5e1"
                                                                                            : "#334155",
                                                                                    borderRadius:
                                                                                        "5px",
                                                                                    padding:
                                                                                        "4px",
                                                                                    cursor:
                                                                                        index === 0 ||
                                                                                        saving
                                                                                            ? "not-allowed"
                                                                                            : "pointer"
                                                                                }}
                                                                                title="Đưa ảnh lên"
                                                                            >

                                                                                <ChevronUp
                                                                                    size={
                                                                                        15
                                                                                    }
                                                                                />

                                                                            </button>


                                                                            <button
                                                                                type="button"
                                                                                disabled={
                                                                                    saving ||
                                                                                    index ===
                                                                                    existingImages.length -
                                                                                    1
                                                                                }
                                                                                onClick={() =>
                                                                                    handleMoveOldImage(
                                                                                        index,
                                                                                        1
                                                                                    )
                                                                                }
                                                                                style={{
                                                                                    flex:
                                                                                        1,
                                                                                    border:
                                                                                        "1px solid #e2e8f0",
                                                                                    background:
                                                                                        index ===
                                                                                        existingImages.length -
                                                                                        1
                                                                                            ? "#f8fafc"
                                                                                            : "#fff",
                                                                                    color:
                                                                                        index ===
                                                                                        existingImages.length -
                                                                                        1
                                                                                            ? "#cbd5e1"
                                                                                            : "#334155",
                                                                                    borderRadius:
                                                                                        "5px",
                                                                                    padding:
                                                                                        "4px",
                                                                                    cursor:
                                                                                        index ===
                                                                                        existingImages.length -
                                                                                        1 ||
                                                                                        saving
                                                                                            ? "not-allowed"
                                                                                            : "pointer"
                                                                                }}
                                                                                title="Đưa ảnh xuống"
                                                                            >

                                                                                <ChevronDown
                                                                                    size={
                                                                                        15
                                                                                    }
                                                                                />

                                                                            </button>

                                                                        </div>

                                                                    )}


                                                                    {/* =====================================
                                                                        CHỌN ẢNH CHÍNH
                                                                    ===================================== */}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleSetOldImagePrimary(
                                                                                image
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            saving
                                                                        }
                                                                        style={{
                                                                            width:
                                                                                "100%",
                                                                            marginTop:
                                                                                "5px",
                                                                            border:
                                                                                "none",
                                                                            background:
                                                                                isPrimary
                                                                                    ? "#eff6ff"
                                                                                    : "#f1f5f9",
                                                                            color:
                                                                                "#334155",
                                                                            borderRadius:
                                                                                "5px",
                                                                            padding:
                                                                                "6px 3px",
                                                                            cursor:
                                                                                saving
                                                                                    ? "not-allowed"
                                                                                    : "pointer",
                                                                            fontSize:
                                                                                "11px",
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            justifyContent:
                                                                                "center",
                                                                            gap:
                                                                                "3px"
                                                                        }}
                                                                    >

                                                                        <Star
                                                                            size={
                                                                                13
                                                                            }
                                                                            fill={
                                                                                isPrimary
                                                                                    ? "currentColor"
                                                                                    : "none"
                                                                            }
                                                                        />

                                                                        {isPrimary
                                                                            ? "Ảnh chính"
                                                                            : "Chọn ảnh chính"
                                                                        }

                                                                    </button>

                                                                </div>

                                                            );

                                                        }
                                                    )}

                                                </div>

                                            </div>

                                        )}


                                    {/* =================================================
                                        ẢNH MỚI
                                    ================================================= */}

                                    {newImagePreviews.length >
                                        0 && (

                                            <div
                                                style={{
                                                    marginTop:
                                                        "18px"
                                                }}
                                            >

                                                <h4
                                                    style={{
                                                        margin:
                                                            "0 0 10px",
                                                        fontSize:
                                                            "14px"
                                                    }}
                                                >

                                                    Ảnh mới đã chọn

                                                </h4>


                                                <div
                                                    style={{
                                                        display:
                                                            "grid",
                                                        gridTemplateColumns:
                                                            "repeat(auto-fill, minmax(125px, 1fr))",
                                                        gap:
                                                            "12px"
                                                    }}
                                                >

                                                    {newImagePreviews.map(
                                                        (
                                                            image,
                                                            index
                                                        ) => {

                                                            const imageKey =
                                                                `new-${index}`;

                                                            const isPrimary =
                                                                primaryImage ===
                                                                imageKey;


                                                            return (

                                                                <div
                                                                    key={
                                                                        `${image.url}-${index}`
                                                                    }
                                                                    style={{
                                                                        position:
                                                                            "relative",
                                                                        border:
                                                                            isPrimary
                                                                                ? "2px solid #2563eb"
                                                                                : "1px solid #e2e8f0",
                                                                        borderRadius:
                                                                            "8px",
                                                                        padding:
                                                                            "5px",
                                                                        background:
                                                                            "#fff"
                                                                    }}
                                                                >

                                                                    {/* =====================================
                                                                        IMAGE PREVIEW
                                                                    ===================================== */}

                                                                    <img
                                                                        src={
                                                                            image.url
                                                                        }
                                                                        alt={
                                                                            image.file?.name ||
                                                                            `Ảnh mới ${index + 1}`
                                                                        }
                                                                        style={{
                                                                            width:
                                                                                "100%",
                                                                            height:
                                                                                "100px",
                                                                            objectFit:
                                                                                "cover",
                                                                            borderRadius:
                                                                                "5px",
                                                                            display:
                                                                                "block"
                                                                        }}
                                                                    />


                                                                    {/* =====================================
                                                                        BADGE ẢNH CHÍNH
                                                                    ===================================== */}

                                                                    {isPrimary && (

                                                                        <span
                                                                            style={{
                                                                                position:
                                                                                    "absolute",
                                                                                top:
                                                                                    "8px",
                                                                                left:
                                                                                    "8px",
                                                                                background:
                                                                                    "#2563eb",
                                                                                color:
                                                                                    "#fff",
                                                                                padding:
                                                                                    "3px 7px",
                                                                                borderRadius:
                                                                                    "5px",
                                                                                fontSize:
                                                                                    "11px",
                                                                                fontWeight:
                                                                                    "600"
                                                                            }}
                                                                        >

                                                                            Ảnh chính

                                                                        </span>

                                                                    )}


                                                                    {/* =====================================
                                                                        XÓA ẢNH
                                                                    ===================================== */}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRemoveNewImage(
                                                                                index
                                                                            )
                                                                        }
                                                                        style={{
                                                                            position:
                                                                                "absolute",
                                                                            top:
                                                                                "5px",
                                                                            right:
                                                                                "5px",
                                                                            width:
                                                                                "26px",
                                                                            height:
                                                                                "26px",
                                                                            border:
                                                                                "none",
                                                                            borderRadius:
                                                                                "50%",
                                                                            background:
                                                                                "#ef4444",
                                                                            color:
                                                                                "#fff",
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            justifyContent:
                                                                                "center",
                                                                            cursor:
                                                                                "pointer",
                                                                            zIndex:
                                                                                2
                                                                        }}
                                                                        title="Xóa ảnh"
                                                                    >

                                                                        <Trash
                                                                            size={
                                                                                13
                                                                            }
                                                                        />

                                                                    </button>


                                                                    {/* =====================================
                                                                        ĐỔI VỊ TRÍ ẢNH MỚI
                                                                    ===================================== */}

                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                "flex",
                                                                            gap:
                                                                                "4px",
                                                                            marginTop:
                                                                                "6px"
                                                                        }}
                                                                    >

                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                index ===
                                                                                0
                                                                            }
                                                                            onClick={() =>
                                                                                handleMoveNewImage(
                                                                                    index,
                                                                                    -1
                                                                                )
                                                                            }
                                                                            style={{
                                                                                flex:
                                                                                    1,
                                                                                border:
                                                                                    "1px solid #e2e8f0",
                                                                                background:
                                                                                    index ===
                                                                                    0
                                                                                        ? "#f8fafc"
                                                                                        : "#fff",
                                                                                color:
                                                                                    index ===
                                                                                    0
                                                                                        ? "#cbd5e1"
                                                                                        : "#334155",
                                                                                borderRadius:
                                                                                    "5px",
                                                                                padding:
                                                                                    "4px",
                                                                                cursor:
                                                                                    index ===
                                                                                    0
                                                                                        ? "not-allowed"
                                                                                        : "pointer"
                                                                            }}
                                                                            title="Đưa ảnh lên"
                                                                        >

                                                                            <ChevronUp
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />

                                                                        </button>


                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                index ===
                                                                                newImagePreviews.length -
                                                                                1
                                                                            }
                                                                            onClick={() =>
                                                                                handleMoveNewImage(
                                                                                    index,
                                                                                    1
                                                                                )
                                                                            }
                                                                            style={{
                                                                                flex:
                                                                                    1,
                                                                                border:
                                                                                    "1px solid #e2e8f0",
                                                                                background:
                                                                                    index ===
                                                                                    newImagePreviews.length -
                                                                                    1
                                                                                        ? "#f8fafc"
                                                                                        : "#fff",
                                                                                color:
                                                                                    index ===
                                                                                    newImagePreviews.length -
                                                                                    1
                                                                                        ? "#cbd5e1"
                                                                                        : "#334155",
                                                                                borderRadius:
                                                                                    "5px",
                                                                                padding:
                                                                                    "4px",
                                                                                cursor:
                                                                                    index ===
                                                                                    newImagePreviews.length -
                                                                                    1
                                                                                        ? "not-allowed"
                                                                                        : "pointer"
                                                                            }}
                                                                            title="Đưa ảnh xuống"
                                                                        >

                                                                            <ChevronDown
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />

                                                                        </button>

                                                                    </div>


                                                                    {/* =====================================
                                                                        CHỌN ẢNH CHÍNH
                                                                    ===================================== */}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleSetPrimary(
                                                                                imageKey
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width:
                                                                                "100%",
                                                                            marginTop:
                                                                                "5px",
                                                                            border:
                                                                                "none",
                                                                            background:
                                                                                isPrimary
                                                                                    ? "#eff6ff"
                                                                                    : "#f1f5f9",
                                                                            color:
                                                                                "#334155",
                                                                            borderRadius:
                                                                                "5px",
                                                                            padding:
                                                                                "6px 3px",
                                                                            cursor:
                                                                                "pointer",
                                                                            fontSize:
                                                                                "11px",
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            justifyContent:
                                                                                "center",
                                                                            gap:
                                                                                "3px"
                                                                        }}
                                                                    >

                                                                        <Star
                                                                            size={
                                                                                13
                                                                            }
                                                                            fill={
                                                                                isPrimary
                                                                                    ? "currentColor"
                                                                                    : "none"
                                                                            }
                                                                        />

                                                                        {isPrimary
                                                                            ? "Ảnh chính"
                                                                            : "Chọn ảnh chính"
                                                                        }

                                                                    </button>

                                                                </div>

                                                            );

                                                        }
                                                    )}

                                                </div>

                                            </div>

                                        )}


                                    {/* =================================================
                                        CHƯA CÓ ẢNH
                                    ================================================= */}

                                    {existingImages.length === 0 &&
                                        newImagePreviews.length === 0 && (

                                            <div
                                                style={{
                                                    marginTop:
                                                        "15px",
                                                    textAlign:
                                                        "center",
                                                    color:
                                                        "#94a3b8",
                                                    padding:
                                                        "15px"
                                                }}
                                            >

                                                <ImagePlus
                                                    size={35}
                                                />

                                                <p
                                                    style={{
                                                        margin:
                                                            "8px 0 0"
                                                    }}
                                                >

                                                    Chưa có ảnh.
                                                    Hãy chọn ảnh sản phẩm.

                                                </p>

                                            </div>

                                        )}

                                </div>

                            </div>


                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <div className="admin-form-group">

                                <label>
                                    Mô tả
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="Nhập mô tả sản phẩm..."
                                />

                            </div>


                            {/* =================================================
                                FOOTER
                            ================================================= */}

                            <div className="admin-modal-footer">

                                <button
                                    type="button"
                                    className="admin-cancel-button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >

                                    Hủy

                                </button>


                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving ? (

                                        <>

                                            <LoaderCircle
                                                size={17}
                                                className="admin-products-spinner"
                                            />

                                            Đang lưu...

                                        </>

                                    ) : (

                                        <>

                                            {editingId
                                                ? "Lưu thay đổi"
                                                : "Thêm sản phẩm"
                                            }

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default AdminProducts;

