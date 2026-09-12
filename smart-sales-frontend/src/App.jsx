import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";


// =====================================================
// CUSTOMER
// =====================================================

import Account from "./pages/customer/Account";
import CustomerLayout from "./layouts/CustomerLayout";

import Home from "./pages/customer/Home";
import Products from "./pages/customer/Products";
import ProductDetail from "./pages/customer/ProductDetail";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";

import MyOrders from "./pages/customer/MyOrders";
import OrderDetail from "./pages/customer/OrderDetail";

import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";


// =====================================================
// PROTECTED ROUTE
// =====================================================

import ProtectedRoute from "./routes/ProtectedRoute";


// =====================================================
// ADMIN
// =====================================================

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminEmployees from "./pages/admin/AdminEmployees";


// =====================================================
// EMPLOYEE / STAFF
// =====================================================

import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffOrders from "./pages/staff/StaffOrders";
import StaffCustomers from "./pages/staff/StaffCustomers";
import StaffProducts from "./pages/staff/StaffProducts";
import StaffCategories from "./pages/staff/StaffCategories";


// =====================================================
// ROLE NORMALIZER
// =====================================================

function normalizeRole(role) {

    if (!role) {
        return "";
    }

    return String(role)
        .replace("ROLE_", "")
        .toUpperCase()
        .trim();
}


// =====================================================
// CUSTOMER PUBLIC ROUTE
//
// Cho phép:
// - Người chưa đăng nhập
// - CUSTOMER
//
// Nếu là ADMIN:
//      → /admin
//
// Nếu là EMPLOYEE:
//      → /staff
// =====================================================

function CustomerPublicRoute({ children }) {

    const {
        user,
        isLoggedIn
    } = useAuth();


    // ================================================
    // CHƯA ĐĂNG NHẬP
    // ================================================

    if (!isLoggedIn || !user) {

        return children;

    }


    // ================================================
    // LẤY ROLE
    // ================================================

    const role =
        normalizeRole(user.role);


    // ================================================
    // ADMIN
    // ================================================

    if (role === "ADMIN") {

        return (
            <Navigate
                to="/admin"
                replace
            />
        );

    }


    // ================================================
    // EMPLOYEE / STAFF
    // ================================================

    if (
        role === "EMPLOYEE" ||
        role === "STAFF"
    ) {

        return (
            <Navigate
                to="/staff"
                replace
            />
        );

    }


    // ================================================
    // CUSTOMER
    // ================================================

    return children;

}


// =====================================================
// APP
// =====================================================

function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =================================================
                    CUSTOMER
                ================================================= */}

                <Route element={<CustomerLayout />}>


                    {/* =================================================
                        HOME

                        Đây là điểm quan trọng nhất.

                        ADMIN:
                            / → /admin

                        EMPLOYEE:
                            / → /staff

                        CUSTOMER:
                            /

                        Chưa đăng nhập:
                            /
                    ================================================= */}

                    <Route
                        path="/"
                        element={
                            <CustomerPublicRoute>
                                <Home />
                            </CustomerPublicRoute>
                        }
                    />


                    {/* =================================================
                        PRODUCTS
                    ================================================= */}

                    <Route
                        path="/products"
                        element={
                            <CustomerPublicRoute>
                                <Products />
                            </CustomerPublicRoute>
                        }
                    />


                    {/* =================================================
                        PRODUCT DETAIL
                    ================================================= */}

                    <Route
                        path="/products/:id"
                        element={
                            <CustomerPublicRoute>
                                <ProductDetail />
                            </CustomerPublicRoute>
                        }
                    />


                    {/* =================================================
                        CART
                    ================================================= */}

                    <Route
                        path="/cart"
                        element={
                            <CustomerPublicRoute>
                                <Cart />
                            </CustomerPublicRoute>
                        }
                    />


                    {/* =================================================
                        CHECKOUT
                    ================================================= */}

                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute
                                allowedRoles={["CUSTOMER"]}
                            >
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        ACCOUNT
                    ================================================= */}

                    <Route
                        path="/account"
                        element={
                            <ProtectedRoute
                                allowedRoles={["CUSTOMER"]}
                            >
                                <Account />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        MY ORDERS
                    ================================================= */}

                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute
                                allowedRoles={["CUSTOMER"]}
                            >
                                <MyOrders />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        ORDER DETAIL
                    ================================================= */}

                    <Route
                        path="/orders/:id"
                        element={
                            <ProtectedRoute
                                allowedRoles={["CUSTOMER"]}
                            >
                                <OrderDetail />
                            </ProtectedRoute>
                        }
                    />

                </Route>


                {/* =================================================
                    AUTH
                ================================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =================================================
                    ADMIN
                ================================================= */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* Dashboard */}

                    <Route
                        index
                        element={<AdminDashboard />}
                    />


                    {/* Products */}

                    <Route
                        path="products"
                        element={<AdminProducts />}
                    />


                    {/* Categories */}

                    <Route
                        path="categories"
                        element={<AdminCategories />}
                    />


                    {/* Customers */}

                    <Route
                        path="customers"
                        element={<AdminCustomers />}
                    />


                    {/* Orders */}

                    <Route
                        path="orders"
                        element={<AdminOrders />}
                    />


                    {/* Users / Employees */}

                    <Route
                        path="users"
                        element={<AdminEmployees />}
                    />

                </Route>


                {/* =================================================
                    EMPLOYEE / STAFF
                ================================================= */}

                <Route
                    path="/staff"
                    element={
                        <ProtectedRoute
                            allowedRoles={["EMPLOYEE"]}
                        >
                            <StaffLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* Dashboard */}

                    <Route
                        index
                        element={<StaffDashboard />}
                    />


                    {/* Orders */}

                    <Route
                        path="orders"
                        element={<StaffOrders />}
                    />


                    {/* Customers */}

                    <Route
                        path="customers"
                        element={<StaffCustomers />}
                    />


                    {/* Products */}

                    <Route
                        path="products"
                        element={<StaffProducts />}
                    />


                    {/* Categories */}

                    <Route
                        path="categories"
                        element={<StaffCategories />}
                    />

                </Route>


                {/* =================================================
                    FALLBACK
                ================================================= */}

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>

        </BrowserRouter>

    );

}


export default App;