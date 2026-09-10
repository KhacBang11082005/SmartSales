import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {

    const {
        user,
        isLoggedIn
    } = useAuth();


    // ==========================================
    // CART ITEMS
    // ==========================================

    const [cartItems, setCartItems] = useState([]);


    // ==========================================
    // CART ĐÃ ĐƯỢC LOAD XONG CHƯA?
    // Dùng để tránh việc localStorage bị ghi đè
    // bằng [] khi React vừa khởi động
    // ==========================================

    const [cartLoaded, setCartLoaded] = useState(false);


    // ==========================================
    // KEY LOCAL STORAGE THEO USER
    //
    // Customer id = 1
    // => smart_sales_cart_1
    // ==========================================

    const getCartKey = () => {

        if (!user?.id) {
            return null;
        }

        return `smart_sales_cart_${user.id}`;

    };


    // ==========================================
    // LOAD CART KHI ĐĂNG NHẬP
    // ==========================================

    useEffect(() => {

        // Chưa đăng nhập
        if (!isLoggedIn || !user?.id) {

            setCartItems([]);

            setCartLoaded(false);

            return;
        }


        const cartKey =
            `smart_sales_cart_${user.id}`;


        try {

            const savedCart =
                localStorage.getItem(cartKey);


            if (savedCart) {

                const parsedCart =
                    JSON.parse(savedCart);


                if (Array.isArray(parsedCart)) {

                    console.log(
                        "🛒 LOAD CART:",
                        parsedCart
                    );

                    setCartItems(parsedCart);

                } else {

                    setCartItems([]);

                }

            } else {

                console.log(
                    "🛒 Chưa có giỏ hàng cho user:",
                    user.id
                );

                setCartItems([]);

            }

        } catch (error) {

            console.error(
                "❌ Lỗi đọc giỏ hàng:",
                error
            );

            setCartItems([]);

        }


        // Đánh dấu đã load xong
        setCartLoaded(true);


    }, [
        isLoggedIn,
        user?.id
    ]);


    // ==========================================
    // SAVE CART
    // Chỉ save SAU KHI cart đã load xong
    // ==========================================

    useEffect(() => {

        if (
            !isLoggedIn ||
            !user?.id ||
            !cartLoaded
        ) {

            return;

        }


        const cartKey =
            `smart_sales_cart_${user.id}`;


        try {

            localStorage.setItem(
                cartKey,
                JSON.stringify(cartItems)
            );


            console.log(
                "💾 SAVE CART:",
                cartItems
            );


        } catch (error) {

            console.error(
                "❌ Lỗi lưu giỏ hàng:",
                error
            );

        }


    }, [
        cartItems,
        isLoggedIn,
        user?.id,
        cartLoaded
    ]);


    // ==========================================
    // ADD TO CART
    // ==========================================

    const addToCart = (product, quantity = 1) => {

        if (!isLoggedIn || !user?.id) {

            console.log(
                "⚠️ Người dùng chưa đăng nhập"
            );

            return false;
        }

        if (!product) {
            return false;
        }


        // ==========================================
        // TỒN KHO THỰC TẾ TỪ PRODUCT
        // Backend Product đang dùng "quantity"
        // ==========================================

        const stockQuantity =
            Number(product.quantity ?? 0);


        if (stockQuantity <= 0) {

            console.log(
                "⚠️ Sản phẩm đã hết hàng"
            );

            return false;
        }


        setCartItems(currentItems => {

            const existingItem =
                currentItems.find(
                    item => item.id === product.id
                );


            // ==========================================
            // SẢN PHẨM ĐÃ CÓ TRONG GIỎ
            // ==========================================

            if (existingItem) {

                const newQuantity =
                    existingItem.quantity + quantity;


                // Không cho vượt quá tồn kho
                if (newQuantity > existingItem.stockQuantity) {

                    console.log(
                        `⚠️ Chỉ còn ${existingItem.stockQuantity} sản phẩm trong kho`
                    );

                    return currentItems;
                }


                return currentItems.map(item => {

                    if (item.id === product.id) {

                        return {
                            ...item,

                            quantity: newQuantity,

                            // Cập nhật tồn kho mới nhất
                            stockQuantity: stockQuantity
                        };

                    }

                    return item;

                });

            }


            // ==========================================
            // SẢN PHẨM CHƯA CÓ TRONG GIỎ
            // ==========================================

            if (quantity > stockQuantity) {

                console.log(
                    `⚠️ Chỉ còn ${stockQuantity} sản phẩm trong kho`
                );

                return currentItems;
            }


            return [
                ...currentItems,

                {
                    ...product,

                    // Số lượng khách mua
                    quantity: quantity,

                    // Lưu riêng tồn kho
                    stockQuantity: stockQuantity
                }
            ];

        });


        console.log(
            "🛒 ADD TO CART:",
            product.name,
            "quantity:",
            quantity,
            "stock:",
            stockQuantity
        );


        return true;
    };

    // ==========================================
    // INCREASE QUANTITY
    // ==========================================

    const increaseQuantity = (productId) => {

        setCartItems(currentItems => {

            return currentItems.map(item => {

                if (item.id !== productId) {
                    return item;
                }


                const stockQuantity =
                    Number(
                        item.stockQuantity ?? 0
                    );


                // Đã đạt tồn kho
                if (
                    item.quantity >=
                    stockQuantity
                ) {

                    console.log(
                        "⚠️ Đã đạt số lượng tồn kho:",
                        stockQuantity
                    );

                    return item;
                }


                return {
                    ...item,

                    quantity:
                        item.quantity + 1
                };

            });

        });

    };


    // ==========================================
    // DECREASE QUANTITY
    // Không cho nhỏ hơn 1
    // ==========================================

    const decreaseQuantity = (
        productId
    ) => {

        setCartItems(currentItems => {

            return currentItems.map(item => {

                if (
                    item.id !== productId
                ) {

                    return item;

                }


                return {

                    ...item,

                    quantity:
                        Math.max(
                            1,
                            item.quantity - 1
                        )

                };

            });

        });

    };


    // ==========================================
    // REMOVE PRODUCT
    // ==========================================

    const removeFromCart = (
        productId
    ) => {

        setCartItems(currentItems => {

            return currentItems.filter(
                item =>
                    item.id !== productId
            );

        });

    };


    // ==========================================
    // CLEAR CART
    // ==========================================

    const clearCart = () => {

        setCartItems([]);

    };


    // ==========================================
    // CART COUNT
    // ==========================================

    const cartCount =
        cartItems.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );


    // ==========================================
    // CART TOTAL
    // ==========================================

    const cartTotal =
        cartItems.reduce(
            (total, item) =>
                total +
                Number(item.price || 0) *
                Number(item.quantity || 0),
            0
        );


    // ==========================================
    // CONTEXT PROVIDER
    // ==========================================

    return (

        <CartContext.Provider
            value={{

                cartItems,

                cartCount,

                cartTotal,

                addToCart,

                increaseQuantity,

                decreaseQuantity,

                removeFromCart,

                clearCart

            }}
        >

            {children}

        </CartContext.Provider>

    );

}


// ==========================================
// USE CART
// ==========================================

export function useCart() {

    const context =
        useContext(CartContext);


    if (!context) {

        throw new Error(
            "useCart phải được sử dụng bên trong CartProvider"
        );

    }


    return context;

}