import { BrowserRouter, Routes, Route } from "react-router-dom";
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

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminEmployees from "./pages/admin/AdminEmployees";
function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ==========================================
                    CUSTOMER
                ========================================== */}


                <Route element={<CustomerLayout />}>

                    {/* ==========================================
                            HOME
                        ========================================== */}

                    <Route
                        path="/"
                        element={<Home />}
                    />


                    {/* ==========================================
                            PRODUCTS
                        ========================================== */}

                    <Route
                        path="/products"
                        element={<Products />}
                    />


                    {/* ==========================================
                            PRODUCT DETAIL
                        ========================================== */}

                    <Route
                        path="/products/:id"
                        element={<ProductDetail />}
                    />


                    {/* ==========================================
                            CART
                        ========================================== */}

                    <Route
                        path="/cart"
                        element={<Cart />}
                    />


                    {/* ==========================================
                            CHECKOUT
                        ========================================== */}

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


                    {/* ==========================================
                            ACCOUNT
                        ========================================== */}

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

                    {/* ==========================================
                        MY ORDERS
                    ========================================== */}

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


                    {/* ==========================================
                            ORDER DETAIL
                        ========================================== */}

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


                {/* ==========================================
                    AUTH
                ========================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==========================================
                    ADMIN
                ========================================== */}
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
                    <Route
                        index
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="products"
                        element={<AdminProducts />}
                    />

                    <Route
                        path="categories"
                        element={<AdminCategories />}
                    />

                    <Route
                        path="customers"
                        element={<AdminCustomers />}
                    />

                    <Route
                        path="orders"
                        element={<AdminOrders />}
                    />

                    <Route
                        path="users"
                        element={<AdminEmployees />}
                    />
                </Route>







            </Routes>

        </BrowserRouter>

    );

}









export default App;