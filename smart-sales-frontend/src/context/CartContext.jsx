import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { useAuth } from "./AuthContext";

import { getProductById } from "../services/productApi";


const CartContext = createContext();


export const CartProvider = ({ children }) => {

    const { user } = useAuth();


    // ==========================================
    // GIỎ HÀNG
    // ==========================================

    const [cartItems, setCartItems] = useState([]);

    const [cartLoaded, setCartLoaded] = useState(false);


    // ==========================================
    // KEY LOCAL STORAGE THEO USER
    // ==========================================

    const cartStorageKey = user
        ? `smart_sales_cart_${user.id}`
        : null;


    // ==========================================
    // LOAD CART + CẬP NHẬT TỒN KHO MỚI NHẤT
    // ==========================================

    useEffect(() => {

        let cancelled = false;


        const loadCart = async () => {

            // Chưa đăng nhập
            if (!user || !cartStorageKey) {

                setCartItems([]);

                setCartLoaded(true);

                return;

            }


            setCartLoaded(false);


            try {

                // ==========================================
                // 1. LẤY GIỎ HÀNG TỪ LOCAL STORAGE
                // ==========================================

                const savedCart =
                    localStorage.getItem(
                        cartStorageKey
                    );


                if (!savedCart) {

                    if (!cancelled) {

                        setCartItems([]);

                        setCartLoaded(true);

                    }

                    return;

                }


                let storedItems = [];


                try {

                    storedItems =
                        JSON.parse(savedCart);

                } catch (error) {

                    console.error(
                        "Lỗi đọc giỏ hàng:",
                        error
                    );

                    storedItems = [];

                }


                if (
                    !Array.isArray(storedItems) ||
                    storedItems.length === 0
                ) {

                    if (!cancelled) {

                        setCartItems([]);

                        setCartLoaded(true);

                    }

                    return;

                }


                // ==========================================
                // 2. LẤY TỒN KHO MỚI NHẤT TỪ BACKEND
                // ==========================================

                const updatedItems =
                    await Promise.all(

                        storedItems.map(
                            async (item) => {

                                try {

                                    /*
                                     * Gọi:
                                     *
                                     * GET /api/products/{id}
                                     *
                                     * để lấy sản phẩm
                                     * mới nhất từ backend.
                                     */

                                    const latestProduct =
                                        await getProductById(
                                            item.id
                                        );


                                    // ==================================
                                    // SẢN PHẨM KHÔNG CÒN TỒN TẠI
                                    // ==================================

                                    if (!latestProduct) {

                                        return {
                                            ...item,
                                            stockQuantity: 0,
                                            quantity: 0
                                        };

                                    }


                                    // ==================================
                                    // LẤY TỒN KHO MỚI NHẤT
                                    // ==================================

                                    const latestStock =
                                        Number(
                                            latestProduct.quantity ?? 0
                                        );


                                    // ==================================
                                    // LẤY SỐ LƯỢNG ĐANG CÓ TRONG GIỎ
                                    // ==================================

                                    let currentQuantity =
                                        Number(
                                            item.quantity ?? 1
                                        );


                                    if (
                                        !Number.isInteger(
                                            currentQuantity
                                        )
                                    ) {

                                        currentQuantity = 1;

                                    }


                                    // ==================================
                                    // KHÔNG NHỎ HƠN 1
                                    // ==================================

                                    if (
                                        currentQuantity < 1
                                    ) {

                                        currentQuantity = 1;

                                    }


                                    // ==================================
                                    // KHÔNG VƯỢT TỒN KHO
                                    // ==================================

                                    if (
                                        latestStock <= 0
                                    ) {

                                        currentQuantity = 0;

                                    } else if (
                                        currentQuantity >
                                        latestStock
                                    ) {

                                        currentQuantity =
                                            latestStock;

                                    }


                                    // ==================================
                                    // CẬP NHẬT ITEM
                                    // ==================================

                                    return {

                                        ...item,

                                        /*
                                         * Cập nhật lại các thông tin
                                         * mới nhất từ backend.
                                         */

                                        name:
                                            latestProduct.name ??
                                            item.name,

                                        description:
                                            latestProduct.description ??
                                            item.description,

                                        price:
                                            latestProduct.price ??
                                            item.price,

                                        imageUrl:
                                            latestProduct.imageUrl ??
                                            item.imageUrl,

                                        image_url:
                                            latestProduct.imageUrl ??
                                            item.image_url,

                                        /*
                                         * QUAN TRỌNG:
                                         *
                                         * Đây là tồn kho mới nhất.
                                         */

                                        stockQuantity:
                                        latestStock,

                                        /*
                                         * Số lượng trong giỏ
                                         * cũng được giới hạn theo
                                         * tồn kho mới nhất.
                                         */

                                        quantity:
                                        currentQuantity

                                    };

                                } catch (error) {

                                    /*
                                     * Nếu một sản phẩm không gọi
                                     * được backend thì giữ nguyên
                                     * item cũ.
                                     *
                                     * Không làm mất giỏ hàng.
                                     */

                                    console.error(
                                        `Không thể cập nhật tồn kho sản phẩm ${item.id}:`,
                                        error
                                    );


                                    return item;

                                }

                            }
                        )

                    );


                // ==========================================
                // 3. KIỂM TRA COMPONENT CÒN MOUNT KHÔNG
                // ==========================================

                if (cancelled) {
                    return;
                }


                // ==========================================
                // 4. CẬP NHẬT STATE
                // ==========================================

                setCartItems(updatedItems);


                // ==========================================
                // 5. LƯU LẠI LOCAL STORAGE
                // ==========================================

                localStorage.setItem(
                    cartStorageKey,
                    JSON.stringify(updatedItems)
                );


                setCartLoaded(true);


            } catch (error) {

                console.error(
                    "Lỗi load giỏ hàng:",
                    error
                );


                if (!cancelled) {

                    setCartItems([]);

                    setCartLoaded(true);

                }

            }

        };


        loadCart();


        // ==========================================
        // CLEANUP
        // ==========================================

        return () => {

            cancelled = true;

        };

    }, [user, cartStorageKey]);


    // ==========================================
    // TỰ ĐỘNG LƯU CART VÀO LOCAL STORAGE
    // ==========================================

    useEffect(() => {

        if (
            !user ||
            !cartStorageKey ||
            !cartLoaded
        ) {
            return;
        }


        localStorage.setItem(
            cartStorageKey,
            JSON.stringify(cartItems)
        );

    }, [
        cartItems,
        user,
        cartStorageKey,
        cartLoaded
    ]);


    // ==========================================
    // THÊM SẢN PHẨM VÀO GIỎ
    // ==========================================

    const addToCart = (
        product,
        quantity = 1
    ) => {

        if (!user) {

            alert(
                "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng."
            );

            return;

        }


        if (!product) {
            return;
        }


        // ==========================================
        // LẤY TỒN KHO TỪ PRODUCT
        // ==========================================

        const stockQuantity =
            Number(
                product.quantity ?? 0
            );


        // ==========================================
        // KHÔNG CÓ HÀNG
        // ==========================================

        if (stockQuantity <= 0) {

            alert(
                "Sản phẩm hiện đã hết hàng."
            );

            return;

        }


        let addQuantity =
            Number(quantity);


        if (
            !Number.isInteger(
                addQuantity
            ) ||
            addQuantity < 1
        ) {

            addQuantity = 1;

        }


        // ==========================================
        // KHÔNG ĐƯỢC THÊM QUÁ TỒN KHO
        // ==========================================

        if (
            addQuantity >
            stockQuantity
        ) {

            addQuantity =
                stockQuantity;

        }


        setCartItems(
            currentItems => {

                const existingItem =
                    currentItems.find(
                        item =>
                            item.id === product.id
                    );


                // ==========================================
                // SẢN PHẨM ĐÃ CÓ TRONG GIỎ
                // ==========================================

                if (existingItem) {

                    const currentQuantity =
                        Number(
                            existingItem.quantity ?? 0
                        );


                    let newQuantity =
                        currentQuantity +
                        addQuantity;


                    // Không vượt tồn kho
                    if (
                        newQuantity >
                        stockQuantity
                    ) {

                        newQuantity =
                            stockQuantity;

                    }


                    return currentItems.map(
                        item => {

                            if (
                                item.id !==
                                product.id
                            ) {

                                return item;

                            }


                            return {

                                ...item,

                                quantity:
                                newQuantity,

                                stockQuantity:
                                stockQuantity

                            };

                        }
                    );

                }


                // ==========================================
                // SẢN PHẨM CHƯA CÓ TRONG GIỎ
                // ==========================================

                return [

                    ...currentItems,

                    {

                        ...product,

                        quantity:
                        addQuantity,

                        stockQuantity:
                        stockQuantity

                    }

                ];

            }
        );

    };


    // ==========================================
    // TĂNG SỐ LƯỢNG
    // ==========================================

    const increaseQuantity = (
        productId
    ) => {

        setCartItems(
            currentItems => {

                return currentItems.map(
                    item => {

                        if (
                            item.id !==
                            productId
                        ) {

                            return item;

                        }


                        const stockQuantity =
                            Number(
                                item.stockQuantity ??
                                0
                            );


                        const currentQuantity =
                            Number(
                                item.quantity ?? 1
                            );


                        // ==================================
                        // ĐÃ ĐẠT TỒN KHO
                        // ==================================

                        if (
                            currentQuantity >=
                            stockQuantity
                        ) {

                            return item;

                        }


                        return {

                            ...item,

                            quantity:
                                currentQuantity + 1

                        };

                    }
                );

            }
        );

    };


    // ==========================================
    // GIẢM SỐ LƯỢNG
    // ==========================================

    const decreaseQuantity = (
        productId
    ) => {

        setCartItems(
            currentItems => {

                return currentItems.map(
                    item => {

                        if (
                            item.id !==
                            productId
                        ) {

                            return item;

                        }


                        const currentQuantity =
                            Number(
                                item.quantity ?? 1
                            );


                        return {

                            ...item,

                            quantity:
                                Math.max(
                                    1,
                                    currentQuantity - 1
                                )

                        };

                    }
                );

            }
        );

    };


    // ==========================================
    // NHẬP TRỰC TIẾP SỐ LƯỢNG
    // ==========================================

    const setQuantity = (
        productId,
        quantity
    ) => {

        setCartItems(
            currentItems => {

                return currentItems.map(
                    item => {

                        if (
                            item.id !==
                            productId
                        ) {

                            return item;

                        }


                        const stockQuantity =
                            Number(
                                item.stockQuantity ??
                                0
                            );


                        let newQuantity =
                            Number(quantity);


                        // ==================================
                        // DỮ LIỆU KHÔNG HỢP LỆ
                        // ==================================

                        if (
                            !Number.isFinite(
                                newQuantity
                            )
                        ) {

                            return item;

                        }


                        newQuantity =
                            Math.floor(
                                newQuantity
                            );


                        // ==================================
                        // TỒN KHO = 0
                        // ==================================

                        if (
                            stockQuantity <= 0
                        ) {

                            return {

                                ...item,

                                quantity: 0,

                                stockQuantity: 0

                            };

                        }


                        // ==================================
                        // KHÔNG NHỎ HƠN 1
                        // ==================================

                        if (
                            newQuantity < 1
                        ) {

                            newQuantity = 1;

                        }


                        // ==================================
                        // KHÔNG VƯỢT TỒN KHO
                        // ==================================

                        if (
                            newQuantity >
                            stockQuantity
                        ) {

                            newQuantity =
                                stockQuantity;

                        }


                        return {

                            ...item,

                            quantity:
                            newQuantity

                        };

                    }
                );

            }
        );

    };


    // ==========================================
    // XÓA SẢN PHẨM
    // ==========================================

    const removeFromCart = (
        productId
    ) => {

        setCartItems(
            currentItems =>
                currentItems.filter(
                    item =>
                        item.id !== productId
                )
        );

    };


    // ==========================================
    // XÓA TOÀN BỘ GIỎ HÀNG
    // ==========================================

    const clearCart = () => {

        setCartItems([]);

    };


    // ==========================================
    // PROVIDER
    // ==========================================

    return (

        <CartContext.Provider
            value={{

                cartItems,

                cartLoaded,

                addToCart,

                increaseQuantity,

                decreaseQuantity,

                setQuantity,

                removeFromCart,

                clearCart

            }}
        >

            {children}

        </CartContext.Provider>

    );

};


// ==========================================
// CUSTOM HOOK
// ==========================================

export const useCart = () => {

    return useContext(
        CartContext
    );

};