import { useEffect, useMemo, useState } from "react";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    MapPin,
    Package,
    Phone,
    ShoppingBag,
    User
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderApi";
import { getMyProfile } from "../../services/accountApi";

import "./Checkout.css";


const ADDRESS_API =
    "https://www.tinhthanhpho.com/api/v1";


function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN")
        .format(Number(price || 0)) + " ₫";
}
/* ==========================================
   XỬ LÝ ĐƯỜNG DẪN ẢNH SẢN PHẨM
   ========================================== */
function getImageUrl(imageUrl) {

    if (!imageUrl) {
        return "";
    }

    // Nếu ảnh đã là URL đầy đủ thì giữ nguyên
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    // Nếu backend trả về /uploads/...
    return `http://localhost:8080${imageUrl}`;
}

function extractData(response) {

    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    return [];
}


function Checkout() {

    const location = useLocation();
    const navigate = useNavigate();

    const {
        cartItems,
        removeFromCart
    } = useCart();


    /* =====================================================
       SẢN PHẨM ĐƯỢC CHỌN
    ===================================================== */

    const selectedIds =
        location.state?.selectedItems || [];


    const selectedProducts = useMemo(() => {

        return cartItems.filter(item =>
            selectedIds.includes(item.id)
        );

    }, [cartItems, selectedIds]);


    /* =====================================================
       THÔNG TIN KHÁCH HÀNG
    ===================================================== */

    const [formData, setFormData] = useState({

        fullName: "",
        phone: "",
        address: "",
        note: ""

    });


    /* =====================================================
       TỰ ĐỘNG LẤY THÔNG TIN TÀI KHOẢN
    ===================================================== */

    useEffect(() => {

        let cancelled = false;

        const loadProfile = async () => {

            const token =
                localStorage.getItem("token");

            if (!token) {
                return;
            }

            try {

                const profile =
                    await getMyProfile();

                if (
                    cancelled ||
                    !profile
                ) {
                    return;
                }

                setFormData(current => ({

                    ...current,

                    fullName:
                        profile.fullName ||
                        current.fullName ||
                        "",

                    phone:
                        profile.phone ||
                        current.phone ||
                        "",

                    address:
                        profile.address ||
                        current.address ||
                        ""

                }));

            } catch (error) {

                console.error(
                    "Không thể lấy thông tin tài khoản:",
                    error
                );

            }

        };

        loadProfile();

        return () => {
            cancelled = true;
        };

    }, []);


    /* =====================================================
       ĐỊA GIỚI HÀNH CHÍNH
    ===================================================== */

    const [provinces, setProvinces] =
        useState([]);

    const [wards, setWards] =
        useState([]);

    const [selectedProvince, setSelectedProvince] =
        useState("");

    const [selectedWard, setSelectedWard] =
        useState("");

    const [loadingProvinces, setLoadingProvinces] =
        useState(false);

    const [loadingWards, setLoadingWards] =
        useState(false);

    const [addressError, setAddressError] =
        useState("");


    /* =====================================================
       PAYMENT
    ===================================================== */

    const [paymentMethod, setPaymentMethod] =
        useState("COD");


    /* =====================================================
       ERROR
    ===================================================== */

    const [error, setError] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);


    /* =====================================================
       TỔNG SỐ LƯỢNG
    ===================================================== */

    const selectedCount =
        selectedProducts.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );


    /* =====================================================
       TỔNG TIỀN
    ===================================================== */

    const selectedTotal =
        selectedProducts.reduce(
            (total, item) =>
                total +
                Number(item.price || 0) *
                Number(item.quantity || 0),
            0
        );


    /* =====================================================
       LẤY TỈNH / THÀNH
    ===================================================== */

    useEffect(() => {

        let cancelled = false;

        const loadProvinces = async () => {

            setLoadingProvinces(true);
            setAddressError("");

            try {

                const response = await fetch(
                    `${ADDRESS_API}/new-provinces?limit=100&page=1`
                );

                if (!response.ok) {

                    throw new Error(
                        "Không thể tải tỉnh/thành."
                    );

                }

                const result =
                    await response.json();

                const data =
                    extractData(result);

                if (!cancelled) {
                    setProvinces(data);
                }

            } catch (err) {

                console.error(
                    "Lỗi tải tỉnh/thành:",
                    err
                );

                if (!cancelled) {

                    setAddressError(
                        "Không thể tải danh sách tỉnh/thành."
                    );

                }

            } finally {

                if (!cancelled) {
                    setLoadingProvinces(false);
                }

            }

        };

        loadProvinces();

        return () => {
            cancelled = true;
        };

    }, []);


    /* =====================================================
       LẤY XÃ / PHƯỜNG
    ===================================================== */

    useEffect(() => {

        if (!selectedProvince) {

            setWards([]);
            setSelectedWard("");

            return;

        }

        let cancelled = false;

        const loadWards = async () => {

            setLoadingWards(true);
            setAddressError("");
            setWards([]);
            setSelectedWard("");

            try {

                const response = await fetch(
                    `${ADDRESS_API}/new-provinces/${selectedProvince}/wards?limit=500&page=1`
                );

                if (!response.ok) {

                    throw new Error(
                        "Không thể tải xã/phường."
                    );

                }

                const result =
                    await response.json();

                const data =
                    extractData(result);

                if (!cancelled) {
                    setWards(data);
                }

            } catch (err) {

                console.error(
                    "Lỗi tải xã/phường:",
                    err
                );

                if (!cancelled) {

                    setAddressError(
                        "Không thể tải danh sách xã/phường."
                    );

                }

            } finally {

                if (!cancelled) {
                    setLoadingWards(false);
                }

            }

        };

        loadWards();

        return () => {
            cancelled = true;
        };

    }, [selectedProvince]);


    /* =====================================================
       OBJECT TỈNH
    ===================================================== */

    const provinceObject =
        provinces.find(
            province =>
                String(province.code) ===
                String(selectedProvince)
        );


    /* =====================================================
       OBJECT XÃ
    ===================================================== */

    const wardObject =
        wards.find(
            ward =>
                String(ward.code) ===
                String(selectedWard)
        );


    /* =====================================================
       GHÉP ĐỊA CHỈ
    ===================================================== */

    const shippingAddress = useMemo(() => {

        const parts = [

            formData.address.trim(),

            wardObject?.type
                ? `${wardObject.type} ${wardObject.name}`
                : wardObject?.name,

            provinceObject?.type
                ? `${provinceObject.type} ${provinceObject.name}`
                : provinceObject?.name

        ].filter(Boolean);

        return parts.join(", ");

    }, [
        formData.address,
        wardObject,
        provinceObject
    ]);


    /* =====================================================
       HANDLE INPUT
    ===================================================== */

    const handleChange = event => {

        const {
            name,
            value
        } = event.target;

        setFormData(current => ({
            ...current,
            [name]: value
        }));

        setError("");

    };


    /* =====================================================
       CHỌN TỈNH
    ===================================================== */

    const handleProvinceChange = event => {

        setSelectedProvince(
            event.target.value
        );

        setSelectedWard("");

        setError("");

    };


    /* =====================================================
       CHỌN XÃ
    ===================================================== */

    const handleWardChange = event => {

        setSelectedWard(
            event.target.value
        );

        setError("");

    };


    /* =====================================================
       ĐẶT HÀNG
    ===================================================== */

    const handleSubmit = async event => {

        event.preventDefault();

        setError("");


        if (selectedProducts.length === 0) {

            setError(
                "Không có sản phẩm nào được chọn để thanh toán."
            );

            return;
        }


        if (!formData.fullName.trim()) {

            setError(
                "Vui lòng nhập họ và tên người nhận."
            );

            return;
        }


        if (!formData.phone.trim()) {

            setError(
                "Vui lòng nhập số điện thoại."
            );

            return;
        }


        if (!/^0\d{9,10}$/.test(
            formData.phone.trim()
        )) {

            setError(
                "Số điện thoại không hợp lệ."
            );

            return;
        }


        if (!selectedProvince) {

            setError(
                "Vui lòng chọn Tỉnh/Thành phố."
            );

            return;
        }


        if (!selectedWard) {

            setError(
                "Vui lòng chọn Xã/Phường."
            );

            return;
        }


        if (!formData.address.trim()) {

            setError(
                "Vui lòng nhập địa chỉ chi tiết."
            );

            return;
        }


        if (isSubmitting) {
            return;
        }


        const orderData = {

            items: selectedProducts.map(item => ({

                productId: item.id,

                quantity:
                    Number(item.quantity)

            })),

            shippingName:
                formData.fullName.trim(),

            shippingPhone:
                formData.phone.trim(),

            shippingAddress:
            shippingAddress,

            shippingNote:
                formData.note.trim()

        };


        try {

            setIsSubmitting(true);

            const createdOrder =
                await createOrder(orderData);


            selectedProducts.forEach(item => {

                removeFromCart(item.id);

            });


            alert(
                `Đặt hàng thành công! Mã đơn hàng: #${createdOrder.id}`
            );


            navigate("/");

        } catch (err) {

            console.error(
                "Lỗi tạo đơn hàng:",
                err
            );


            const backendMessage =
                err.response?.data?.message;


            if (
                err.response?.status === 401
            ) {

                setError(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );

            } else if (
                err.response?.status === 403
            ) {

                setError(
                    "Bạn không có quyền thực hiện đặt hàng."
                );

            } else if (backendMessage) {

                setError(
                    backendMessage
                );

            } else {

                setError(
                    "Không thể đặt hàng. Vui lòng kiểm tra kết nối với máy chủ."
                );

            }

        } finally {

            setIsSubmitting(false);

        }

    };


    /* =====================================================
       EMPTY
    ===================================================== */

    if (selectedProducts.length === 0) {

        return (

            <div className="checkout-page checkout-empty-page">

                <div className="checkout-empty-card">

                    <div className="checkout-empty-icon">

                        <ShoppingBag size={34} />

                    </div>

                    <h1>
                        Chưa có sản phẩm thanh toán
                    </h1>

                    <p>
                        Vui lòng quay lại giỏ hàng
                        và chọn ít nhất một sản phẩm.
                    </p>

                    <Link
                        to="/cart"
                        className="checkout-back-button"
                    >

                        <ArrowLeft size={18} />

                        Quay lại giỏ hàng

                    </Link>

                </div>

            </div>

        );

    }


    return (

        <div className="checkout-page">

            <div className="checkout-container">

                {/* HEADER */}

                <div className="checkout-header">

                    <Link
                        to="/cart"
                        className="checkout-back-link"
                    >

                        <ArrowLeft size={18} />

                        Quay lại giỏ hàng

                    </Link>



                    <h1>
                        Thanh toán
                    </h1>

                    <p>
                        Kiểm tra thông tin trước khi đặt hàng.
                    </p>

                </div>


                <form
                    className="checkout-grid"
                    onSubmit={handleSubmit}
                >


                    {/* =================================================
                       LEFT
                    ================================================= */}

                    <div className="checkout-main">


                        {/* THÔNG TIN NHẬN HÀNG */}

                        <section className="checkout-card">

                            <div className="section-heading">

                                <div className="section-icon">

                                    <MapPin size={20} />

                                </div>

                                <div>

                                    <h2>
                                        Thông tin nhận hàng
                                    </h2>

                                    <p>
                                        Nhập thông tin người nhận
                                        và địa chỉ giao hàng.
                                    </p>

                                </div>

                            </div>


                            <div className="form-grid">


                                <div className="form-group">

                                    <label htmlFor="fullName">

                                        <User size={15} />

                                        Họ và tên

                                    </label>

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={
                                            formData.fullName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Nhập họ và tên"
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="phone">

                                        <Phone size={15} />

                                        Số điện thoại

                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Nhập số điện thoại"
                                        inputMode="numeric"
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="province">

                                        <MapPin size={15} />

                                        Tỉnh/Thành phố

                                    </label>

                                    <select
                                        id="province"
                                        value={
                                            selectedProvince
                                        }
                                        onChange={
                                            handleProvinceChange
                                        }
                                        disabled={
                                            loadingProvinces
                                        }
                                    >

                                        <option value="">

                                            {loadingProvinces
                                                ? "Đang tải..."
                                                : "Chọn Tỉnh/Thành phố"
                                            }

                                        </option>


                                        {provinces.map(
                                            province => (

                                                <option
                                                    key={
                                                        province.code
                                                    }
                                                    value={
                                                        province.code
                                                    }
                                                >

                                                    {province.type
                                                        ? `${province.type} ${province.name}`
                                                        : province.name
                                                    }

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label htmlFor="ward">

                                        <MapPin size={15} />

                                        Xã/Phường

                                    </label>

                                    <select
                                        id="ward"
                                        value={
                                            selectedWard
                                        }
                                        onChange={
                                            handleWardChange
                                        }
                                        disabled={
                                            !selectedProvince ||
                                            loadingWards
                                        }
                                    >

                                        <option value="">

                                            {!selectedProvince
                                                ? "Chọn Tỉnh/Thành trước"
                                                : loadingWards
                                                    ? "Đang tải..."
                                                    : "Chọn Xã/Phường"
                                            }

                                        </option>


                                        {wards.map(
                                            ward => (

                                                <option
                                                    key={
                                                        ward.code
                                                    }
                                                    value={
                                                        ward.code
                                                    }
                                                >

                                                    {ward.type
                                                        ? `${ward.type} ${ward.name}`
                                                        : ward.name
                                                    }

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="form-group form-group-full">

                                    <label htmlFor="address">

                                        <MapPin size={15} />

                                        Địa chỉ chi tiết

                                    </label>

                                    <textarea
                                        id="address"
                                        name="address"
                                        rows="3"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Số nhà, tên đường, tòa nhà..."
                                    />

                                </div>


                                {shippingAddress && (

                                    <div className="form-group form-group-full">

                                        <label>
                                            Địa chỉ giao hàng
                                        </label>

                                        <div className="shipping-address-preview">

                                            {shippingAddress}

                                        </div>

                                    </div>

                                )}


                                <div className="form-group form-group-full">

                                    <label htmlFor="note">
                                        Ghi chú
                                    </label>

                                    <textarea
                                        id="note"
                                        name="note"
                                        rows="2"
                                        value={
                                            formData.note
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                                    />

                                </div>

                            </div>


                            {addressError && (

                                <div className="checkout-error">
                                    {addressError}
                                </div>

                            )}

                        </section>


                        {/* =================================================
                           PAYMENT
                        ================================================= */}

                        <section className="checkout-card">

                            <div className="section-heading">

                                <div className="section-icon">

                                    <CreditCard size={20} />

                                </div>

                                <div>

                                    <h2>
                                        Phương thức thanh toán
                                    </h2>

                                    <p>
                                        Chọn phương thức thanh toán
                                        cho đơn hàng.
                                    </p>

                                </div>

                            </div>


                            <div className="payment-options">


                                <label
                                    className={
                                        `payment-option ${
                                            paymentMethod === "COD"
                                                ? "payment-selected"
                                                : ""
                                        }`
                                    }
                                >

                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={
                                            paymentMethod === "COD"
                                        }
                                        onChange={event =>
                                            setPaymentMethod(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <div className="payment-option-content">

                                        <strong>
                                            Thanh toán khi nhận hàng
                                        </strong>

                                        <span>
                                            Thanh toán bằng tiền mặt
                                            khi nhận được hàng.
                                        </span>

                                    </div>

                                </label>


                                <label
                                    className={
                                        `payment-option ${
                                            paymentMethod === "BANKING"
                                                ? "payment-selected"
                                                : ""
                                        }`
                                    }
                                >

                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="BANKING"
                                        checked={
                                            paymentMethod === "BANKING"
                                        }
                                        onChange={event =>
                                            setPaymentMethod(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <div className="payment-option-content">

                                        <strong>
                                            Chuyển khoản ngân hàng
                                        </strong>

                                        <span>
                                            Phương thức này sẽ được
                                            tích hợp ở bước sau.
                                        </span>

                                    </div>

                                </label>

                            </div>

                        </section>

                    </div>


                    {/* =================================================
                       RIGHT - BẢN CŨ
                    ================================================= */}

                    <aside className="checkout-sidebar">

                        <section className="checkout-card">


                            {/* ĐƠN HÀNG */}

                            <div className="section-heading compact-heading">

                                <div className="section-icon">

                                    <Package size={20} />

                                </div>

                                <div>

                                    <h2>
                                        Đơn hàng
                                    </h2>

                                    <p>
                                        {selectedCount} sản phẩm
                                    </p>

                                </div>

                            </div>


                            {/* SẢN PHẨM */}

                            <div className="checkout-products">

                                {selectedProducts.map(item => {

                                    const quantity =
                                        Number(item.quantity || 0);

                                    const total =
                                        Number(item.price || 0) *
                                        quantity;

                                    return (

                                        <div
                                            className="checkout-product"
                                            key={item.id}
                                        >

                                            <div className="checkout-product-image">

                                                {item.image_url ? (

                                                    <img
                                                        src={getImageUrl(item.image_url)}
                                                        alt={item.name}
                                                    />

                                                ) : (

                                                    <ShoppingBag size={22} />

                                                )}

                                            </div>


                                            <div className="checkout-product-info">

                                                <h3
                                                    title={item.name}
                                                >
                                                    {item.name}
                                                </h3>

                                                <span>
                                                    {formatPrice(item.price)}
                                                    {" × "}
                                                    {quantity}
                                                </span>

                                            </div>


                                            <strong>

                                                {formatPrice(total)}

                                            </strong>

                                        </div>

                                    );

                                })}

                            </div>


                            {/* LINE */}

                            <div className="summary-line" />


                            {/* TẠM TÍNH */}

                            <div className="checkout-summary-row">

                                <span>
                                    Tạm tính
                                </span>

                                <strong>
                                    {formatPrice(selectedTotal)}
                                </strong>

                            </div>


                            {/* VẬN CHUYỂN */}

                            <div className="checkout-summary-row">

                                <span>
                                    Phí vận chuyển
                                </span>

                                <strong className="free-shipping">
                                    Miễn phí
                                </strong>

                            </div>


                            {/* LINE */}

                            <div className="summary-line" />


                            {/* TOTAL */}

                            <div className="checkout-total">

                                <div>

                                    <span>
                                        Tổng thanh toán
                                    </span>

                                </div>

                                <strong>
                                    {formatPrice(selectedTotal)}
                                </strong>

                            </div>


                            {/* ERROR */}

                            {error && (

                                <div className="checkout-error">

                                    {error}

                                </div>

                            )}


                            {/* BUTTON */}

                            <button
                                type="submit"
                                className="place-order-button"
                                disabled={isSubmitting}
                            >

                                {isSubmitting ? (

                                    <>
                                        <span className="order-loading-spinner" />

                                        Đang xử lý...
                                    </>

                                ) : (

                                    <>
                                        <CheckCircle2 size={18} />

                                        Xác nhận đặt hàng
                                    </>

                                )}

                            </button>


                        </section>

                    </aside>

                </form>

            </div>

        </div>

    );

}


export default Checkout;