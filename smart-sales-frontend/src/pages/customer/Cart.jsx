
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    ArrowLeft
} from "lucide-react";

import { useCart } from "../../context/CartContext";

import "./Cart.css";


function formatPrice(price) {

    return new Intl.NumberFormat("vi-VN")
        .format(price) + " ₫";

}


function Cart() {

    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart
    } = useCart();


    // ==========================================
    // SẢN PHẨM ĐƯỢC CHỌN
    // ==========================================

    const [selectedItems, setSelectedItems] = useState([]);


    // ==========================================
    // KHI CART ITEMS THAY ĐỔI
    // LOẠI BỎ ID KHÔNG CÒN TRONG GIỎ
    // ==========================================

    useEffect(() => {

        setSelectedItems(currentSelected =>
            currentSelected.filter(id =>
                cartItems.some(item => item.id === id)
            )
        );

    }, [cartItems]);


    // ==========================================
    // CHỌN / BỎ CHỌN SẢN PHẨM
    // ==========================================

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


    // ==========================================
    // CHỌN TẤT CẢ
    // ==========================================

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


    // ==========================================
    // TỔNG SỐ SẢN PHẨM ĐƯỢC CHỌN
    // ==========================================

    const selectedCount =
        selectedItems.reduce(
            (total, productId) => {

                const item =
                    cartItems.find(
                        item => item.id === productId
                    );

                return total +
                    (item?.quantity || 0);

            },
            0
        );


    // ==========================================
    // TỔNG TIỀN SẢN PHẨM ĐƯỢC CHỌN
    // ==========================================

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


    // ==========================================
    // CHECK ALL
    // ==========================================

    const isAllSelected =
        cartItems.length > 0 &&
        selectedItems.length === cartItems.length;


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
                SELECT ALL
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
                EMPTY CART
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
                        CART ITEMS
                    ================================== */}

                    <div className="cart-items">

                        {cartItems.map(item => (

                            <div
                                className="cart-item"
                                key={item.id}
                            >


                                {/* CHECKBOX */}

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
                                    />

                                </label>


                                {/* IMAGE */}

                                <div className="cart-item-image">

                                    {item.image_url ? (

                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                        />

                                    ) : (

                                        <ShoppingCart size={45} />

                                    )}

                                </div>


                                {/* INFO */}

                                <div className="cart-item-info">

                                    <h3>
                                        {item.name}
                                    </h3>

                                    <p>
                                        {item.description}
                                    </p>

                                    <strong>
                                        {formatPrice(item.price)}
                                    </strong>

                                </div>


                                {/* QUANTITY */}

                                <div className="cart-quantity">

                                    <button
                                        onClick={() =>
                                            decreaseQuantity(
                                                item.id
                                            )
                                        }
                                        disabled={
                                            item.quantity <= 1
                                        }
                                        title="Giảm số lượng"
                                    >

                                        <Minus size={16} />

                                    </button>


                                    <span>
                                        {item.quantity}
                                    </span>

                                    <button
                                        disabled={
                                            item.quantity >= item.stockQuantity
                                        }
                                        onClick={() =>
                                            increaseQuantity(item.id)
                                        }
                                        title="Tăng số lượng"
                                    >
                                        <Plus size={16} />
                                    </button>

                                </div>


                                {/* DELETE */}

                                <button
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

                        ))}

                    </div>


                    {/* ==================================
                        SUMMARY
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
                            CHECKOUT BUTTON
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
