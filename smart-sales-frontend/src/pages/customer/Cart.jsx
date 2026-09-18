import { useEffect, useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    ArrowLeft
} from "lucide-react";

import { useCart } from "../../context/CartContext";

import "./Cart.css";


/* ==========================================
   FORMAT GIÁ TIỀN
========================================== */

function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN")
        .format(Number(price) || 0) + " ₫";
}

/* ==========================================
   XỬ LÝ ĐƯỜNG DẪN ẢNH SẢN PHẨM

   Backend lưu:
   /uploads/abc.jpg

   Nhưng ảnh nằm trên:
   http://localhost:8080/uploads/abc.jpg

   Nếu ảnh đã là URL đầy đủ:
   http://...
   https://...

   thì giữ nguyên.
========================================== */

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

    // Nếu là đường dẫn /uploads/...
    return `http://localhost:8080${imageUrl}`;
}

/* ==========================================
   CART
========================================== */

function Cart() {

    const navigate = useNavigate();

    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        setQuantity,
        removeFromCart
    } = useCart();


    /* ==========================================
       SẢN PHẨM ĐƯỢC CHỌN
    ========================================== */

    const [selectedItems, setSelectedItems] = useState([]);


    /* ==========================================
       GIÁ TRỊ ĐANG NHẬP
    ========================================== */

    const [editingQuantities, setEditingQuantities] = useState({});


    /* ==========================================
       SỐ LƯỢNG BAN ĐẦU
    ========================================== */

    const [originalQuantities, setOriginalQuantities] = useState({});


    /* ==========================================
       ĐI ĐẾN CHI TIẾT SẢN PHẨM
    ========================================== */

    const handleProductClick = (productId) => {

        if (!productId) {
            return;
        }

        navigate(`/products/${productId}`);

    };


    /* ==========================================
       ĐỒNG BỘ SẢN PHẨM ĐƯỢC CHỌN
    ========================================== */

    useEffect(() => {

        localStorage.setItem(
            "selectedCartItems",
            JSON.stringify(selectedItems)
        );

        window.dispatchEvent(
            new Event("cartSelectionChanged")
        );

    }, [selectedItems]);


    /* ==========================================
       XÓA ID KHÔNG CÒN TRONG GIỎ
    ========================================== */

    useEffect(() => {

        setSelectedItems(currentSelected =>
            currentSelected.filter(id =>
                cartItems.some(item => item.id === id)
            )
        );

    }, [cartItems]);


    /* ==========================================
       CHỌN / BỎ CHỌN
    ========================================== */

    const handleSelectItem = (productId) => {

        setSelectedItems(current => {

            if (current.includes(productId)) {

                return current.filter(
                    id => id !== productId
                );

            }

            return [
                ...current,
                productId
            ];

        });

    };


    /* ==========================================
       CHỌN TẤT CẢ
    ========================================== */

    const handleSelectAll = () => {

        if (
            selectedItems.length === cartItems.length
        ) {

            setSelectedItems([]);

            return;

        }

        setSelectedItems(
            cartItems.map(item => item.id)
        );

    };


    /* ==========================================
       FOCUS INPUT SỐ LƯỢNG
    ========================================== */

    const handleQuantityFocus = (productId) => {

        const item = cartItems.find(
            item => item.id === productId
        );

        if (!item) {
            return;
        }


        const currentQuantity = Number(
            item.quantity || 1
        );


        setOriginalQuantities(prev => {

            if (prev[productId] !== undefined) {
                return prev;
            }

            return {
                ...prev,
                [productId]: currentQuantity
            };

        });


        setEditingQuantities(prev => ({
            ...prev,
            [productId]: String(currentQuantity)
        }));

    };


    /* ==========================================
       THAY ĐỔI SỐ LƯỢNG
    ========================================== */

    const handleQuantityChange = (
        productId,
        value
    ) => {

        if (!/^\d*$/.test(value)) {
            return;
        }


        setEditingQuantities(prev => ({
            ...prev,
            [productId]: value
        }));


        /*
         * Cho phép ô trống.
         */
        if (value === "") {
            return;
        }


        const item = cartItems.find(
            item => item.id === productId
        );

        if (!item) {
            return;
        }


        const stock = Number(
            item.stockQuantity ?? 0
        );


        if (stock <= 0) {
            return;
        }


        let quantity = Number(value);


        /*
         * Không cho vượt tồn kho.
         */
        if (quantity > stock) {

            quantity = stock;

            setEditingQuantities(prev => ({
                ...prev,
                [productId]: String(stock)
            }));

        }


        /*
         * Không cập nhật quantity thật thành 0.
         */
        if (quantity === 0) {
            return;
        }


        setQuantity(
            productId,
            quantity
        );

    };


    /* ==========================================
       RỜI KHỎI INPUT
    ========================================== */

    const handleQuantityBlur = (
        productId,
        value
    ) => {

        const item = cartItems.find(
            item => item.id === productId
        );

        if (!item) {
            return;
        }


        const stock = Number(
            item.stockQuantity ?? 0
        );


        const originalQuantity =
            originalQuantities[productId] ??
            Number(item.quantity || 1);


        /*
         * Nếu xóa hết rồi click ra ngoài
         * → quay lại số lượng ban đầu.
         */

        if (value === "") {

            if (stock > 0) {

                setQuantity(
                    productId,
                    Math.min(
                        originalQuantity,
                        stock
                    )
                );

            }


            setEditingQuantities(prev => {

                const next = {
                    ...prev
                };

                delete next[productId];

                return next;

            });


            setOriginalQuantities(prev => {

                const next = {
                    ...prev
                };

                delete next[productId];

                return next;

            });


            return;

        }


        let quantity = Number(value);


        /*
         * Không hợp lệ hoặc bằng 0
         * → quay lại số lượng ban đầu.
         */

        if (
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {

            quantity = originalQuantity;

        }


        /*
         * Không vượt tồn kho.
         */

        if (
            stock > 0 &&
            quantity > stock
        ) {

            quantity = stock;

        }


        /*
         * Hết hàng.
         */

        if (stock <= 0) {

            quantity = 0;

        }


        setQuantity(
            productId,
            quantity
        );


        setEditingQuantities(prev => {

            const next = {
                ...prev
            };

            delete next[productId];

            return next;

        });


        setOriginalQuantities(prev => {

            const next = {
                ...prev
            };

            delete next[productId];

            return next;

        });

    };


    /* ==========================================
       TỔNG SỐ LƯỢNG ĐÃ CHỌN
    ========================================== */

    const selectedCount =
        selectedItems.reduce(
            (total, productId) => {

                const item =
                    cartItems.find(
                        item => item.id === productId
                    );

                return total +
                    Number(item?.quantity || 0);

            },
            0
        );


    /* ==========================================
       TỔNG TIỀN
    ========================================== */

    const selectedTotal =
        cartItems
            .filter(item =>
                selectedItems.includes(item.id)
            )
            .reduce(
                (total, item) =>
                    total +
                    Number(item.price || 0) *
                    Number(item.quantity || 0),
                0
            );


    /* ==========================================
       CHỌN TẤT CẢ
    ========================================== */

    const isAllSelected =
        cartItems.length > 0 &&
        selectedItems.length === cartItems.length;


    /* ==========================================
       RENDER
    ========================================== */

    return (

        <div className="cart-page">


            {/* ==================================
                TOP
            ================================== */}

            <div className="cart-top">

                <Link
                    to="/products"
                    className="continue-shopping-top"
                >

                    <ArrowLeft size={18} />

                    Tiếp tục mua hàng

                </Link>

            </div>


            {/* ==================================
                CHỌN TẤT CẢ
            ================================== */}

            {cartItems.length > 0 && (

                <div className="select-all-row">

                    <label className="select-all">

                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                        />

                        <span>
                            Chọn tất cả sản phẩm
                        </span>

                    </label>


                    <span className="selected-count">

                        Đã chọn{" "}

                        {selectedItems.length}/
                        {cartItems.length}

                    </span>

                </div>

            )}


            {/* ==================================
                GIỎ HÀNG TRỐNG
            ================================== */}

            {cartItems.length === 0 ? (

                <div className="empty-cart">

                    <p>
                        Chưa có sản phẩm nào trong giỏ hàng.
                    </p>

                </div>

            ) : (

                <div className="cart-content">


                    {/* ==================================
                        DANH SÁCH SẢN PHẨM
                    ================================== */}

                    <div className="cart-items">

                        {cartItems.map(item => {

                            const stock = Number(
                                item.stockQuantity ?? 0
                            );

                            const currentQuantity = Number(
                                item.quantity ?? 1
                            );


                            return (

                                <div
                                    className="cart-item"
                                    key={item.id}
                                >


                                    {/* ==========================
                                        CHECKBOX
                                    ========================== */}

                                    <label className="product-checkbox">

                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedItems.includes(
                                                    item.id
                                                )
                                            }
                                            onChange={() =>
                                                handleSelectItem(
                                                    item.id
                                                )
                                            }
                                            disabled={
                                                stock <= 0
                                            }
                                        />

                                    </label>


                                    {/* ==========================
                                        ẢNH SẢN PHẨM

                                        CLICK → CHI TIẾT
                                    ========================== */}

                                    <div
                                        className="cart-item-image product-link"
                                        onClick={() =>
                                            handleProductClick(
                                                item.id
                                            )
                                        }
                                        title="Xem chi tiết sản phẩm"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {

                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {

                                                handleProductClick(
                                                    item.id
                                                );

                                            }

                                        }}
                                    >

                                        {item.image_url ? (

                                            <img
                                                src={getImageUrl(item.image_url)}
                                                alt={item.name}
                                            />

                                        ) : item.imageUrl ? (

                                            <img
                                                src={getImageUrl(item.imageUrl)}
                                                alt={item.name}
                                            />

                                        ) : (

                                            <ShoppingCart
                                                size={45}
                                            />

                                        )}

                                    </div>


                                    {/* ==========================
                                        THÔNG TIN SẢN PHẨM

                                        CLICK TÊN → CHI TIẾT
                                    ========================== */}

                                    <div className="cart-item-info">

                                        <h3
                                            className="product-link"
                                            onClick={() =>
                                                handleProductClick(
                                                    item.id
                                                )
                                            }
                                            title="Xem chi tiết sản phẩm"
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {

                                                if (
                                                    e.key === "Enter" ||
                                                    e.key === " "
                                                ) {

                                                    handleProductClick(
                                                        item.id
                                                    );

                                                }

                                            }}
                                        >

                                            {item.name}

                                        </h3>


                                        <p>
                                            {item.description}
                                        </p>


                                        <strong>
                                            {formatPrice(
                                                item.price
                                            )}
                                        </strong>


                                        {/* TỒN KHO */}

                                        <small
                                            style={{
                                                display: "block",
                                                marginTop: "5px",
                                                color:
                                                    stock > 0
                                                        ? "#64748b"
                                                        : "#dc2626"
                                            }}
                                        >

                                            {stock > 0
                                                ? `Còn ${stock} sản phẩm`
                                                : "Hết hàng"
                                            }

                                        </small>

                                    </div>


                                    {/* ==========================
                                        SỐ LƯỢNG
                                    ========================== */}

                                    <div className="cart-quantity">


                                        {/* GIẢM */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                decreaseQuantity(
                                                    item.id
                                                )
                                            }
                                            disabled={
                                                currentQuantity <= 1 ||
                                                stock <= 0
                                            }
                                            title="Giảm số lượng"
                                        >

                                            <Minus size={16} />

                                        </button>


                                        {/* INPUT */}

                                        <input
                                            type="text"
                                            inputMode="numeric"

                                            value={
                                                editingQuantities[
                                                    item.id
                                                    ] !== undefined
                                                    ? editingQuantities[
                                                        item.id
                                                        ]
                                                    : currentQuantity
                                            }

                                            min="1"
                                            max={stock}
                                            maxLength={6}

                                            onFocus={() =>
                                                handleQuantityFocus(
                                                    item.id
                                                )
                                            }

                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    item.id,
                                                    e.target.value
                                                )
                                            }

                                            onBlur={(e) =>
                                                handleQuantityBlur(
                                                    item.id,
                                                    e.target.value
                                                )
                                            }

                                            onKeyDown={(e) => {

                                                const allowedKeys = [
                                                    "Backspace",
                                                    "Delete",
                                                    "ArrowLeft",
                                                    "ArrowRight",
                                                    "ArrowUp",
                                                    "ArrowDown",
                                                    "Tab",
                                                    "Enter"
                                                ];


                                                if (
                                                    !/[0-9]/.test(e.key) &&
                                                    !allowedKeys.includes(
                                                        e.key
                                                    ) &&
                                                    !e.ctrlKey &&
                                                    !e.metaKey
                                                ) {

                                                    e.preventDefault();

                                                }


                                                if (
                                                    e.key === "Enter"
                                                ) {

                                                    e.currentTarget.blur();

                                                }

                                            }}

                                            aria-label={
                                                `Số lượng ${item.name}`
                                            }

                                        />


                                        {/* TĂNG */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                increaseQuantity(
                                                    item.id
                                                )
                                            }
                                            disabled={
                                                stock <= 0 ||
                                                currentQuantity >= stock
                                            }
                                            title={
                                                stock <= 0
                                                    ? "Sản phẩm hết hàng"
                                                    : currentQuantity >= stock
                                                        ? "Đã đạt số lượng tồn kho"
                                                        : "Tăng số lượng"
                                            }
                                        >

                                            <Plus size={16} />

                                        </button>

                                    </div>


                                    {/* ==========================
                                        XÓA SẢN PHẨM
                                    ========================== */}

                                    <button
                                        type="button"
                                        className="remove-cart-item"
                                        onClick={() =>
                                            removeFromCart(
                                                item.id
                                            )
                                        }
                                        title="Xóa sản phẩm"
                                    >

                                        <Trash2 size={19} />

                                    </button>

                                </div>

                            );

                        })}

                    </div>


                    {/* ==================================
                        TỔNG ĐƠN HÀNG
                    ================================== */}

                    <div className="cart-summary">

                        <h2>
                            Tổng đơn hàng
                        </h2>


                        <div className="summary-row">

                            <span>
                                Sản phẩm đã chọn
                            </span>

                            <strong>
                                {selectedCount}
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Tạm tính
                            </span>

                            <strong>
                                {formatPrice(
                                    selectedTotal
                                )}
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Phí vận chuyển
                            </span>

                            <strong>
                                Miễn phí
                            </strong>

                        </div>


                        <div className="summary-line" />


                        <div className="summary-total">

                            <span>
                                Tổng cộng
                            </span>

                            <strong>
                                {formatPrice(
                                    selectedTotal
                                )}
                            </strong>

                        </div>


                        {/* ==================================
                            THANH TOÁN
                        ================================== */}

                        {selectedItems.length > 0 ? (

                            <Link
                                to="/checkout"
                                state={{
                                    selectedItems
                                }}
                                className="checkout-button"
                            >

                                Tiến hành thanh toán

                            </Link>

                        ) : (

                            <button
                                type="button"
                                className="checkout-button checkout-disabled"
                                disabled
                            >

                                Chọn sản phẩm để thanh toán

                            </button>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}


export default Cart;