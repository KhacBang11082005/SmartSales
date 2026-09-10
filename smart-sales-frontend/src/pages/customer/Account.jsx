import {
    useEffect,
    useState
} from "react";

import {
    User,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    Edit3,
    Save,
    X,
    ArrowLeft,
    CircleUserRound,
    LockKeyhole
} from "lucide-react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    getMyProfile,
    updateMyProfile,
    changeMyPassword
} from "../../services/accountApi";

import { useAuth } from "../../context/AuthContext";

import "./Account.css";

function Account() {


const navigate = useNavigate();

const {
    user,
    logout
} = useAuth();


// =========================================================
// PROFILE STATE
// =========================================================

const [profile, setProfile] =
    useState(null);


const [form, setForm] =
    useState({
        fullName: "",
        phone: "",
        address: ""
    });


const [loading, setLoading] =
    useState(true);


const [saving, setSaving] =
    useState(false);


const [editing, setEditing] =
    useState(false);


const [error, setError] =
    useState("");


const [success, setSuccess] =
    useState("");


// =========================================================
// PASSWORD STATE
// =========================================================

const [passwordForm, setPasswordForm] =
    useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });


// Các ô password ban đầu readonly để hạn chế
// trình duyệt tự động điền mật khẩu đã lưu.
const [
    passwordFieldUnlocked,
    setPasswordFieldUnlocked
] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
});


const [changingPassword, setChangingPassword] =
    useState(false);


const [passwordError, setPasswordError] =
    useState("");


const [passwordSuccess, setPasswordSuccess] =
    useState("");


// =========================================================
// LOAD PROFILE
// =========================================================

useEffect(() => {

    loadProfile();

}, []);


const loadProfile = async () => {

    try {

        setLoading(true);

        setError("");


        const data =
            await getMyProfile();


        setProfile(data);


        setForm({

            fullName:
                data.fullName || "",

            phone:
                data.phone || "",

            address:
                data.address || ""

        });

    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );


        if (
            error.response?.status === 401 ||
            error.response?.status === 403
        ) {

            logout();

            navigate("/login");

            return;
        }


        setError(
            "Không thể tải thông tin tài khoản."
        );

    } finally {

        setLoading(false);

    }
};


// =========================================================
// HANDLE PROFILE INPUT
// =========================================================

const handleChange = (event) => {

    const {
        name,
        value
    } = event.target;


    setForm(
        previous => ({
            ...previous,
            [name]: value
        })
    );


    setSuccess("");

    setError("");
};


// =========================================================
// EDIT PROFILE
// =========================================================

const handleEdit = () => {

    setEditing(true);

    setSuccess("");

    setError("");
};


// =========================================================
// CANCEL EDIT
// =========================================================

const handleCancel = () => {

    setForm({

        fullName:
            profile?.fullName || "",

        phone:
            profile?.phone || "",

        address:
            profile?.address || ""

    });


    setEditing(false);

    setError("");

    setSuccess("");
};


// =========================================================
// SAVE PROFILE
// =========================================================

const handleSave = async () => {

    setError("");

    setSuccess("");


    if (!form.fullName.trim()) {

        setError(
            "Vui lòng nhập họ và tên."
        );

        return;
    }


    if (
        form.phone &&
        !/^[0-9+\s()-]{8,15}$/.test(
            form.phone
        )
    ) {

        setError(
            "Số điện thoại không hợp lệ."
        );

        return;
    }


    try {

        setSaving(true);


        const updated =
            await updateMyProfile({

                fullName:
                    form.fullName.trim(),

                phone:
                    form.phone.trim(),

                address:
                    form.address.trim()

            });


        setProfile(updated);


        setForm({

            fullName:
                updated.fullName || "",

            phone:
                updated.phone || "",

            address:
                updated.address || ""

        });


        setEditing(false);


        setSuccess(
            "Cập nhật thông tin thành công."
        );


        const savedUser =
            localStorage.getItem(
                "smart_sales_user"
            );


        if (savedUser) {

            try {

                const localUser =
                    JSON.parse(savedUser);


                localUser.name =
                    updated.fullName;

                localUser.fullName =
                    updated.fullName;


                localStorage.setItem(
                    "smart_sales_user",
                    JSON.stringify(
                        localUser
                    )
                );

            } catch (error) {

                console.error(
                    "SYNC USER ERROR:",
                    error
                );
            }
        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );


        if (
            error.response?.status === 401 ||
            error.response?.status === 403
        ) {

            logout();

            navigate("/login");

            return;
        }


        setError(
            error.response?.data?.message ||
            "Không thể cập nhật thông tin."
        );

    } finally {

        setSaving(false);

    }
};


// =========================================================
// HANDLE PASSWORD INPUT
// =========================================================

const handlePasswordChange = (event) => {

    const {
        name,
        value
    } = event.target;


    setPasswordForm(
        previous => ({
            ...previous,
            [name]: value
        })
    );


    setPasswordError("");

    setPasswordSuccess("");

    setError("");

    setSuccess("");
};


// =========================================================
// UNLOCK PASSWORD FIELD
// =========================================================

const unlockPasswordField = (fieldName) => {

    setPasswordFieldUnlocked(
        previous => ({
            ...previous,
            [fieldName]: true
        })
    );

};


// =========================================================
// CHANGE PASSWORD
// =========================================================

const handleChangePassword = async () => {

    setPasswordError("");

    setPasswordSuccess("");


    const {
        currentPassword,
        newPassword,
        confirmPassword
    } = passwordForm;


    if (!currentPassword.trim()) {

        setPasswordError(
            "Vui lòng tự nhập mật khẩu hiện tại."
        );

        return;
    }


    if (!newPassword.trim()) {

        setPasswordError(
            "Vui lòng nhập mật khẩu mới."
        );

        return;
    }


    if (newPassword.length < 6) {

        setPasswordError(
            "Mật khẩu mới phải có ít nhất 6 ký tự."
        );

        return;
    }


    if (!confirmPassword.trim()) {

        setPasswordError(
            "Vui lòng xác nhận mật khẩu mới."
        );

        return;
    }


    if (newPassword !== confirmPassword) {

        setPasswordError(
            "Mật khẩu xác nhận không khớp."
        );

        return;
    }


    try {

        setChangingPassword(true);


        await changeMyPassword({

            currentPassword:
                currentPassword,

            newPassword:
                newPassword,

            confirmPassword:
                confirmPassword

        });


        // Reset tất cả password về rỗng
        setPasswordForm({

            currentPassword: "",

            newPassword: "",

            confirmPassword: ""

        });


        // Khóa lại các ô để hạn chế
        // browser tự động điền password
        setPasswordFieldUnlocked({

            currentPassword: false,

            newPassword: false,

            confirmPassword: false

        });


        setPasswordSuccess(
            "Đổi mật khẩu thành công."
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );


        if (
            error.response?.status === 401 ||
            error.response?.status === 403
        ) {

            logout();

            navigate("/login");

            return;
        }


        setPasswordError(
            error.response?.data?.message ||
            "Không thể đổi mật khẩu. Vui lòng thử lại."
        );

    } finally {

        setChangingPassword(false);

    }
};


// =========================================================
// FORMAT DATE
// =========================================================

const formatDate = (date) => {

    if (!date) {

        return "Chưa cập nhật";
    }


    try {

        return new Date(date)
            .toLocaleDateString(
                "vi-VN",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );

    } catch {

        return "Chưa cập nhật";
    }
};


// =========================================================
// GET INITIAL
// =========================================================

const getInitial = () => {

    const name =
        profile?.fullName ||
        user?.name ||
        user?.username ||
        "U";


    return name
        .trim()
        .charAt(0)
        .toUpperCase();
};


// =========================================================
// LOADING
// =========================================================

if (loading) {

    return (

        <div className="account-page">

            <div className="account-loading">

                <div className="account-spinner" />

                <p>
                    Đang tải thông tin tài khoản...
                </p>

            </div>

        </div>
    );
}


// =========================================================
// RENDER
// =========================================================

return (

    <div className="account-page">


        <div className="account-top">

            <Link
                to="/"
                className="account-back"
            >

                <ArrowLeft size={18} />

                <span>
                    Về trang chủ
                </span>

            </Link>


            <div>

                <h1>
                    Thông tin tài khoản
                </h1>

                <p>
                    Quản lý thông tin cá nhân và bảo mật tài khoản
                </p>

            </div>

        </div>


        {error && (

            <div className="account-alert account-alert-error">

                {error}

            </div>

        )}


        {success && (

            <div className="account-alert account-alert-success">

                {success}

            </div>

        )}


        <div className="account-grid">


            <aside className="account-sidebar">

                <div className="account-avatar">

                    {getInitial()}

                </div>


                <h2>
                    {profile?.fullName ||
                        profile?.username ||
                        "Khách hàng"}
                </h2>


                <p className="account-username">

                    @{profile?.username || "customer"}

                </p>


                <div className="account-role">

                    <ShieldCheck size={16} />

                    <span>
                        {profile?.role === "CUSTOMER"
                            ? "Khách hàng"
                            : profile?.role || "CUSTOMER"}
                    </span>

                </div>


                <div className="account-sidebar-divider" />

            </aside>


            <main className="account-content">


                <section className="account-card">


                    <div className="account-card-header">

                        <div>

                            <h2>
                                Thông tin cá nhân
                            </h2>

                            <p>
                                Thông tin cơ bản của tài khoản
                            </p>

                        </div>


                        {!editing && (

                            <button
                                type="button"
                                className="account-edit-button"
                                onClick={handleEdit}
                            >

                                <Edit3 size={17} />

                                <span>
                                    Chỉnh sửa
                                </span>

                            </button>

                        )}

                    </div>


                    <div className="account-fields">


                        <div className="account-field">

                            <label>
                                Họ và tên
                            </label>

                            <div className="account-input">

                                <User size={19} />

                                {editing ? (

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên"
                                    />

                                ) : (

                                    <span>
                                        {profile?.fullName ||
                                            "Chưa cập nhật"}
                                    </span>

                                )}

                            </div>

                        </div>


                        <div className="account-field">

                            <label>
                                Email
                            </label>

                            <div className="account-input account-input-disabled">

                                <Mail size={19} />

                                <span>
                                    {profile?.email ||
                                        "Chưa cập nhật"}
                                </span>

                            </div>

                            <small>
                                Email được sử dụng để đăng nhập
                            </small>

                        </div>


                        <div className="account-field">

                            <label>
                                Tên đăng nhập
                            </label>

                            <div className="account-input account-input-disabled">

                                <CircleUserRound size={19} />

                                <span>
                                    {profile?.username ||
                                        "Chưa cập nhật"}
                                </span>

                            </div>

                        </div>


                        <div className="account-field">

                            <label>
                                Số điện thoại
                            </label>

                            <div className="account-input">

                                <Phone size={19} />

                                {editing ? (

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Nhập số điện thoại"
                                    />

                                ) : (

                                    <span>
                                        {profile?.phone ||
                                            "Chưa cập nhật"}
                                    </span>

                                )}

                            </div>

                        </div>


                        <div className="account-field account-field-full">

                            <label>
                                Địa chỉ
                            </label>

                            <div className="account-input">

                                <MapPin size={19} />

                                {editing ? (

                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Nhập địa chỉ nhận hàng"
                                    />

                                ) : (

                                    <span>
                                        {profile?.address ||
                                            "Chưa cập nhật"}
                                    </span>

                                )}

                            </div>

                        </div>

                    </div>


                    {editing && (

                        <div className="account-actions">

                            <button
                                type="button"
                                className="account-cancel-button"
                                onClick={handleCancel}
                                disabled={saving}
                            >

                                <X size={17} />

                                Hủy

                            </button>


                            <button
                                type="button"
                                className="account-save-button"
                                onClick={handleSave}
                                disabled={saving}
                            >

                                <Save size={17} />

                                {saving
                                    ? "Đang lưu..."
                                    : "Lưu thay đổi"}

                            </button>

                        </div>

                    )}

                </section>


                {/* =================================================
                    CHANGE PASSWORD
                ================================================= */}

                <section className="account-card">


                    <div className="account-card-header">

                        <div className="account-card-title-icon">

                            <div className="account-section-icon">

                                <LockKeyhole size={20} />

                            </div>


                            <div>

                                <h2>
                                    Đổi mật khẩu
                                </h2>

                                <p>
                                    Cập nhật mật khẩu để bảo vệ tài khoản
                                </p>

                            </div>

                        </div>

                    </div>


                    {passwordError && (

                        <div className="account-alert account-alert-error">

                            {passwordError}

                        </div>

                    )}


                    {passwordSuccess && (

                        <div className="account-alert account-alert-success">

                            {passwordSuccess}

                        </div>

                    )}


                    <div
                        className="account-password-form"
                        autoComplete="off"
                    >


                        {/* CURRENT PASSWORD */}

                        <div className="account-field">

                            <label>
                                Mật khẩu hiện tại
                            </label>

                            <div className="account-input">

                                <LockKeyhole size={19} />

                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={
                                        passwordForm.currentPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    onFocus={() =>
                                        unlockPasswordField(
                                            "currentPassword"
                                        )
                                    }
                                    placeholder="Nhập mật khẩu hiện tại"
                                    autoComplete="off"
                                    readOnly={
                                        !passwordFieldUnlocked.currentPassword
                                    }
                                />

                            </div>

                        </div>


                        {/* NEW PASSWORD */}

                        <div className="account-field">

                            <label>
                                Mật khẩu mới
                            </label>

                            <div className="account-input">

                                <LockKeyhole size={19} />

                                <input
                                    type="password"
                                    name="newPassword"
                                    value={
                                        passwordForm.newPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    onFocus={() =>
                                        unlockPasswordField(
                                            "newPassword"
                                        )
                                    }
                                    placeholder="Nhập mật khẩu mới"
                                    autoComplete="off"
                                    readOnly={
                                        !passwordFieldUnlocked.newPassword
                                    }
                                />

                            </div>

                            <small>
                                Mật khẩu phải có ít nhất 6 ký tự
                            </small>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="account-field account-field-full">

                            <label>
                                Xác nhận mật khẩu mới
                            </label>

                            <div className="account-input">

                                <LockKeyhole size={19} />

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={
                                        passwordForm.confirmPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    onFocus={() =>
                                        unlockPasswordField(
                                            "confirmPassword"
                                        )
                                    }
                                    placeholder="Nhập lại mật khẩu mới"
                                    autoComplete="off"
                                    readOnly={
                                        !passwordFieldUnlocked.confirmPassword
                                    }
                                />

                            </div>

                        </div>

                    </div>


                    <div className="account-actions">

                        <button
                            type="button"
                            className="account-save-button"
                            onClick={
                                handleChangePassword
                            }
                            disabled={
                                changingPassword
                            }
                        >

                            <Save size={17} />

                            {changingPassword
                                ? "Đang cập nhật..."
                                : "Đổi mật khẩu"}

                        </button>

                    </div>


                </section>


                <section className="account-card">


                    <div className="account-card-header">

                        <div>

                            <h2>
                                Thông tin tài khoản
                            </h2>

                            <p>
                                Thông tin hệ thống của tài khoản
                            </p>

                        </div>

                    </div>


                    <div className="account-system-info">


                        <div className="account-system-item">

                            <span>
                                Trạng thái
                            </span>

                            <strong
                                className={
                                    profile?.status === "ACTIVE"
                                        ? "account-status-active"
                                        : "account-status-inactive"
                                }
                            >

                                {profile?.status === "ACTIVE"
                                    ? "Đang hoạt động"
                                    : profile?.status ||
                                      "Không xác định"}

                            </strong>

                        </div>


                        <div className="account-system-item">

                            <span>
                                Vai trò
                            </span>

                            <strong>
                                {profile?.role === "CUSTOMER"
                                    ? "Khách hàng"
                                    : profile?.role ||
                                      "Khách hàng"}
                            </strong>

                        </div>


                        <div className="account-system-item">

                            <span>
                                Ngày tạo tài khoản
                            </span>

                            <strong>
                                {formatDate(
                                    profile?.createdAt
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


            </main>

        </div>

    </div>
);


}

export default Account;
