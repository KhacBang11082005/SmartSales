# Giải thích chức năng – Smart Sales

Tài liệu này giải thích 4 nhóm chức năng: **Quản lý giỏ hàng**, **Quản lý thanh toán**, **Quản lý tài khoản cá nhân** và **Quản lý khách hàng**. Nội dung được viết dựa trên mã nguồn hiện tại:

- **Backend:** Spring Boot (`smart-sales/src/main/java/com/smartsales`)
- **Frontend:** React + Vite (`smart-sales-frontend/src`)
- **Xác thực:** JWT. Token lưu ở `localStorage["token"]` và được gửi qua header `Authorization: Bearer <token>`.
- **Vai trò (role):** `ADMIN`, `EMPLOYEE` (nhân viên), `CUSTOMER` (khách hàng).

---

## 1. Quản lý giỏ hàng

### 1.1. Tổng quan

Giỏ hàng **chỉ nằm ở phía frontend**. Backend không có bảng hay API nào cho giỏ hàng. Dữ liệu được lưu trong `localStorage` của trình duyệt, **mỗi tài khoản dùng một key riêng**:

```
smart_sales_cart_<userId>
```

Vì vậy:
- Phải **đăng nhập** mới thêm được sản phẩm vào giỏ.
- Đăng xuất rồi đăng nhập lại trên cùng trình duyệt thì giỏ hàng vẫn còn.
- Giỏ hàng **không đồng bộ** giữa các trình duyệt hoặc thiết bị khác nhau.

| Thành phần | File |
|---|---|
| Lưu trạng thái và logic giỏ hàng (Context) | `src/context/CartContext.jsx` |
| Trang giỏ hàng | `src/pages/customer/Cart.jsx` (route `/cart`) |
| Lấy tồn kho mới nhất | `GET /api/products/{id}` (`services/productApi.js`) |

### 1.2. Cấu trúc một sản phẩm trong giỏ

Mỗi phần tử là thông tin sản phẩm, kèm thêm 2 trường:

```js
{
  id, name, description, price, imageUrl, ...,
  quantity: 2,        // số lượng khách muốn mua
  stockQuantity: 15   // tồn kho mới nhất lấy từ backend
}
```

### 1.3. Các chức năng của `CartContext`

| Hàm | Chức năng | Ràng buộc |
|---|---|---|
| `addToCart(product, quantity)` | Thêm sản phẩm vào giỏ. Nếu sản phẩm đã có thì cộng dồn số lượng. | Phải đăng nhập. Sản phẩm hết hàng thì không thêm được. Tổng số lượng không vượt tồn kho. |
| `increaseQuantity(id)` | Tăng số lượng thêm 1 | Dừng lại khi bằng `stockQuantity` |
| `decreaseQuantity(id)` | Giảm số lượng đi 1 | Số lượng tối thiểu là 1 |
| `setQuantity(id, qty)` | Khách nhập trực tiếp số lượng | Làm tròn xuống, giới hạn trong khoảng `[1, stockQuantity]`. Nếu hết hàng thì đặt về 0. |
| `removeFromCart(id)` | Xóa một sản phẩm khỏi giỏ | – |
| `clearCart()` | Xóa toàn bộ giỏ hàng | – |

### 1.4. Đồng bộ tồn kho khi tải giỏ hàng

Mỗi khi `user` thay đổi (đăng nhập hoặc tải lại trang), `CartContext` thực hiện:

1. Đọc giỏ hàng từ `localStorage`. Nếu JSON bị lỗi thì coi như giỏ rỗng.
2. Gọi `GET /api/products/{id}` **cho từng sản phẩm** (chạy song song bằng `Promise.all`) để lấy giá, tên, ảnh và **tồn kho mới nhất**.
3. Điều chỉnh lại số lượng:
   - Sản phẩm không còn tồn tại → `quantity = 0`, `stockQuantity = 0`
   - Tồn kho ≤ 0 → `quantity = 0`
   - Số lượng trong giỏ > tồn kho → giảm xuống bằng tồn kho
4. Nếu gọi API của một sản phẩm bị lỗi → **giữ nguyên** sản phẩm đó, không làm mất giỏ hàng.
5. Lưu kết quả vào state và ghi lại vào `localStorage`.

Sau đó, mỗi khi `cartItems` thay đổi, một `useEffect` khác sẽ tự động lưu giỏ hàng vào `localStorage`.

### 1.5. Trang giỏ hàng (`Cart.jsx`)

- **Chọn sản phẩm để thanh toán:** khách tick chọn từng sản phẩm, hoặc dùng "Chọn tất cả". Danh sách ID được chọn (`selectedItems`) được lưu vào `localStorage["selectedCartItems"]` và phát sự kiện `cartSelectionChanged`.
- Nếu một sản phẩm bị xóa khỏi giỏ, ID của nó cũng tự động bị bỏ khỏi danh sách đã chọn.
- **Chỉnh số lượng:** dùng nút +/− hoặc nhập trực tiếp. Giá trị được kiểm tra khi rời ô nhập (blur).
- Bấm vào sản phẩm sẽ chuyển sang trang chi tiết `/products/:id`.
- **Nút "Tiến hành thanh toán"** chỉ bật khi có ít nhất 1 sản phẩm được chọn. Khi bấm, trang chuyển sang `/checkout` và truyền theo `state: { selectedItems }`. Như vậy khách có thể **thanh toán một phần giỏ hàng**.

---

## 2. Quản lý thanh toán (đặt hàng)

### 2.1. Tổng quan

"Thanh toán" trong hệ thống hiện tại là **quá trình đặt hàng (checkout)**: khách nhập thông tin nhận hàng, áp dụng mã khuyến mại và tạo đơn. **Hệ thống chưa tích hợp cổng thanh toán online** (VNPay, MoMo, …).

| Thành phần | File |
|---|---|
| Trang thanh toán | `src/pages/customer/Checkout.jsx` (route `/checkout`) |
| API đơn hàng (frontend) | `src/services/orderApi.js` |
| Controller | `controller/OrderController.java` (`/api/orders`) |
| Xử lý nghiệp vụ | `service/OrderService.java` |
| Entity | `entity/Order.java`, `entity/OrderDetail.java` |
| Dữ liệu gửi lên khi tạo đơn | `dto/CreateOrderRequest.java` |

### 2.2. Luồng thanh toán

```
Cart (chọn SP) ──► Checkout
                     │ 1. Tự điền họ tên / SĐT / địa chỉ từ GET /api/customers/me
                     │ 2. Chọn Tỉnh/Thành → Xã/Phường (API tinhthanhpho.com)
                     │ 3. (Tùy chọn) Áp mã KM → POST /api/promotions/validate
                     │ 4. Chọn phương thức thanh toán (COD / Chuyển khoản)
                     ▼
               POST /api/orders ──► OrderService.createOrder (@Transactional)
                     │
                     ▼
     Xóa các SP vừa đặt khỏi giỏ → thông báo "Đặt hàng thành công! #id" → về trang chủ
```

### 2.3. Phía frontend (`Checkout.jsx`)

**Thông tin nhận hàng**
- Họ tên, số điện thoại và địa chỉ được tự điền từ hồ sơ khách hàng (`getMyProfile`).
- Danh sách địa giới hành chính lấy từ API bên ngoài `https://www.tinhthanhpho.com/api/v1` (theo mô hình mới gồm Tỉnh/Thành → Xã/Phường).
- Địa chỉ đầy đủ được ghép lại theo dạng: `địa chỉ chi tiết, Phường X, Tỉnh Y`.

**Kiểm tra dữ liệu trước khi gửi**
- Phải có ít nhất 1 sản phẩm được chọn.
- Họ tên không được để trống.
- Số điện thoại phải khớp regex `^0\d{9,10}$`.
- Phải chọn Tỉnh/Thành, chọn Xã/Phường và nhập địa chỉ chi tiết.
- Có cờ `isSubmitting` để chống bấm đặt hàng nhiều lần.

**Mã khuyến mại**
- Gọi `validatePromotion(code, tổng tiền, customerId, items)`. Nếu mã hợp lệ thì hiển thị số tiền được giảm.
- Nếu tổng tiền thay đổi sau khi đã áp mã, mã sẽ bị **gỡ tự động** và khách phải áp lại.
- Frontend **chỉ gửi `promotionCode`**, không gửi `discountAmount`. Backend sẽ tự tính lại số tiền giảm.

**Phương thức thanh toán**
- `COD`: thanh toán khi nhận hàng (mặc định).
- `BANKING`: chuyển khoản. Giao diện ghi rõ là "sẽ được tích hợp ở bước sau".
- Lưu ý: `paymentMethod` hiện **chỉ có ở giao diện**, chưa được gửi lên backend và chưa được lưu vào đơn hàng.

**Phí vận chuyển:** đang hiển thị "Miễn phí".

**Dữ liệu gửi lên `POST /api/orders`:**

```json
{
  "items": [{ "productId": 5, "quantity": 2 }],
  "shippingName": "Nguyễn Văn A",
  "shippingPhone": "0912345678",
  "shippingAddress": "12 Lê Lợi, Phường Bến Nghé, Thành phố Hồ Chí Minh",
  "shippingNote": "Giao giờ hành chính",
  "promotionCode": "SALE10"
}
```

**Xử lý lỗi:** lỗi 401 → báo hết phiên đăng nhập; lỗi 403 → báo không có quyền; các lỗi khác → hiển thị `message` do backend trả về.

### 2.4. Phía backend – `OrderService.createOrder`

Toàn bộ hàm chạy trong **một transaction**. Nếu có lỗi ở bất kỳ bước nào, mọi thay đổi (đơn hàng, chi tiết đơn, tồn kho) đều được hoàn tác.

1. Kiểm tra đơn hàng phải có ít nhất 1 sản phẩm.
2. Chỉ role `CUSTOMER` được đặt hàng. `ADMIN`/`EMPLOYEE` gọi API này sẽ bị từ chối.
3. Tạo `Order` với trạng thái `PENDING`, `orderDate = now()`, và lưu thông tin giao hàng.
4. Nếu có mã khuyến mại: tìm mã theo code. Nếu mã không tồn tại → báo lỗi.
5. Duyệt từng sản phẩm trong đơn:
   - Sản phẩm phải tồn tại và có trạng thái `ACTIVE`.
   - Tồn kho phải đủ (`product.quantity >= quantity`).
   - **Giá lấy từ database** (không tin giá do frontend gửi lên). `subtotal = unitPrice × quantity`.
   - Lưu `OrderDetail` gồm `unitPrice` và `subtotal`. Đây là giá tại thời điểm mua, nên sau này giá sản phẩm đổi cũng không ảnh hưởng đến đơn cũ.
   - **Trừ tồn kho ngay khi đặt hàng.**
   - Nếu sản phẩm thuộc phạm vi áp dụng của mã khuyến mại (theo sản phẩm hoặc danh mục) thì cộng `subtotal` vào `eligiblePromotionAmount`.
6. Kiểm tra mã khuyến mại (`validatePromotion`) dựa trên số tiền đủ điều kiện và khách hàng, sau đó tính `discountAmount`.
7. Tính `totalAmount = tổng tiền hàng − discountAmount` và lưu đơn.
8. Nếu có áp mã: tạo bản ghi `PromotionUsage` và tăng `usedCount` của mã.

### 2.5. Trạng thái đơn hàng và các thao tác sau khi đặt

```
PENDING ──► CONFIRMED ──► PROCESSING ──► COMPLETED
   │            │
   └────────────┴──► CANCELLED   (hoàn lại tồn kho)
```

| API | Ai được dùng | Mô tả |
|---|---|---|
| `GET /api/orders` | Tất cả role | Customer chỉ thấy đơn của mình. Admin/Employee thấy tất cả đơn. |
| `GET /api/orders/{id}` | Tất cả role | Customer chỉ xem được đơn của chính mình. |
| `PUT /api/orders/{id}/shipping` | CUSTOMER | Sửa thông tin giao hàng. **Chỉ được sửa khi đơn đang `PENDING`.** |
| `PATCH /api/orders/{id}/cancel` | CUSTOMER | Khách tự hủy đơn. **Chỉ hủy được khi đơn đang `PENDING`.** Tồn kho được hoàn lại. |
| `PATCH /api/orders/{id}/status` | ADMIN, EMPLOYEE | Chuyển trạng thái theo sơ đồ trên. Đơn `COMPLETED`/`CANCELLED` không thể đổi nữa. Khi chuyển sang `CANCELLED` thì hoàn lại tồn kho (`restoreProductsToStock`). |
| `DELETE /api/orders/{id}` | ADMIN | Xóa đơn hàng. |

---

## 3. Quản lý tài khoản cá nhân

### 3.1. Tổng quan

Đây là trang để khách hàng (`CUSTOMER`) xem và sửa hồ sơ của mình, đồng thời đổi mật khẩu.

| Thành phần | File |
|---|---|
| Trang tài khoản | `src/pages/customer/Account.jsx` (route `/account`) |
| API frontend | `src/services/accountApi.js` |
| Controller | `controller/CustomerController.java` (các endpoint `/me`) |
| Xử lý nghiệp vụ | `service/CustomerService.java` |

### 3.2. Mô hình dữ liệu

Thông tin của một khách hàng được lưu ở **2 bảng**:

| Bảng `users` (`User`) | Bảng `customers` (`Customer`) |
|---|---|
| `username`, `email`, `password` (mã hóa BCrypt), `fullName`, `role`, `status`, `createdAt`, `lastLoginAt` | `user_id` (quan hệ 1-1 với `users`), `phone`, `address`, `createdAt` |

### 3.3. Các API

| API | Mô tả |
|---|---|
| `GET /api/customers/me` | Lấy hồ sơ của tài khoản đang đăng nhập. `userId` được lấy từ JWT, không lấy từ URL, nên khách không thể xem hồ sơ người khác. |
| `PUT /api/customers/me` | Cập nhật `fullName`, `phone`, `address`. |
| `PUT /api/customers/me/password` | Đổi mật khẩu. |

Cả 3 API đều yêu cầu role `CUSTOMER` (được cấu hình trong `SecurityConfig`).

### 3.4. Xem hồ sơ – `getMyProfile`

- Trả về `CustomerProfileResponse`: `userId`, `customerId`, `username`, `email`, `fullName`, `phone`, `address`, `role`, `status`, `createdAt`.
- Nếu chưa có bản ghi `Customer` thì `phone` và `address` trả về chuỗi rỗng.

### 3.5. Cập nhật hồ sơ – `updateMyProfile`

- **Frontend:** họ tên bắt buộc. Số điện thoại (nếu có nhập) phải khớp `^[0-9+\s()-]{8,15}$`. Sau khi lưu thành công, frontend cập nhật lại tên trong `localStorage["smart_sales_user"]` để header hiển thị đúng tên mới. Nếu gặp lỗi 401/403 thì tự đăng xuất và chuyển về trang `/login`.
- **Backend:** họ tên không được để trống. Lưu `fullName` vào `users`, lưu `phone` và `address` vào `customers` (nếu chưa có bản ghi `Customer` thì tạo mới).
- **Không cho sửa** `username`, `email` hay `role`.

### 3.6. Đổi mật khẩu – `changeMyPassword`

Backend kiểm tra theo thứ tự sau:

1. Phải nhập đủ 3 trường: mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu.
2. Mật khẩu mới có ít nhất 6 ký tự.
3. Mật khẩu mới và ô xác nhận phải giống nhau.
4. Mật khẩu hiện tại phải đúng (so sánh bằng `passwordEncoder.matches`).
5. Mật khẩu mới không được trùng mật khẩu hiện tại.
6. Mã hóa bằng BCrypt rồi lưu.

### 3.7. Các chức năng liên quan đến tài khoản

- **Đăng ký, đăng nhập, quên mật khẩu (OTP):** `AuthController`/`AuthService`, các trang `Register`, `Login`, `ForgotPassword`, `VerifyOtp`, `ResetPassword`.
- **Đơn hàng của tôi:** `MyOrders.jsx` và `OrderDetail.jsx`. Tại đây khách xem đơn, hủy đơn hoặc sửa địa chỉ giao hàng khi đơn còn `PENDING`.

---

## 4. Quản lý khách hàng (Admin / Nhân viên)

### 4.1. Tổng quan

| Thành phần | File |
|---|---|
| Trang Admin | `src/pages/admin/AdminCustomers.jsx` (`/admin/customers`) |
| Trang Nhân viên | `src/pages/staff/StaffCustomers.jsx` (`/staff/customers`). Trang này dùng lại `AdminCustomers` với `readOnly={true}`. |
| API frontend | `src/services/customerApi.js` |
| Backend | `CustomerController` và `CustomerService` |
| Tự động cập nhật trạng thái | `service/CustomerAccountStatusScheduler.java` |

### 4.2. Phân quyền

| Thao tác | ADMIN | EMPLOYEE |
|---|---|---|
| Xem danh sách, xem chi tiết | ✅ | ✅ |
| Sửa thông tin, đổi trạng thái | ✅ | Giao diện chỉ cho xem (backend vẫn cho phép `PUT`) |
| Xóa khách hàng | ✅ | ❌ |

### 4.3. Các API

| API | Mô tả |
|---|---|
| `GET /api/customers` | Lấy danh sách khách hàng (`CustomerAdminResponse`: id, userId, username, email, fullName, phone, role, status, createdAt). |
| `GET /api/customers/{id}` | Lấy chi tiết khách hàng, **kèm lịch sử đơn hàng**: mỗi đơn có ngày đặt, tổng số lượng, tổng tiền, trạng thái, danh sách sản phẩm. Với đơn `COMPLETED`, mỗi sản phẩm có thêm thông tin **đánh giá** (số sao, bình luận, ảnh/video). |
| `PUT /api/customers/{id}` | Chỉ cập nhật `fullName`, `phone`, `status`. **Không sửa địa chỉ.** |
| `DELETE /api/customers/{id}` | Xóa bản ghi khách hàng (chỉ ADMIN). |
| `POST /api/customers` | Tạo bản ghi khách hàng trực tiếp. Giao diện hiện không dùng API này. |

### 4.4. Giao diện quản lý

- **Tìm kiếm** theo họ tên, username, email hoặc số điện thoại.
- **Lọc theo trạng thái:** Tất cả / Hoạt động (`ACTIVE`) / Không hoạt động (`INACTIVE`) / Đã khóa (`LOCKED`).
- **Xem chi tiết:** mở modal hiển thị thông tin khách hàng và lịch sử đơn hàng. Có thể bấm vào từng đơn để xem sản phẩm và đánh giá.
- **Sửa:** username và email chỉ được xem. Được sửa họ tên, số điện thoại (bắt buộc) và trạng thái.
- **Xóa:** hiện hộp thoại xác nhận trước khi xóa.

### 4.5. Trạng thái tài khoản khách hàng

| Trạng thái | Ý nghĩa | Ai đặt |
|---|---|---|
| `ACTIVE` | Đang hoạt động | Admin, hoặc hệ thống tự đặt lại khi khách đăng nhập |
| `INACTIVE` | Quá 7 ngày không đăng nhập | Scheduler tự động |
| `LOCKED` | Bị khóa, **không thể đăng nhập** | Chỉ Admin |

**Quy tắc:**
- Khi sửa khách hàng, admin chỉ được chọn `ACTIVE` hoặc `LOCKED`. Backend sẽ từ chối các giá trị khác.
- **Scheduler** (`@Scheduled(fixedDelay = 900000)`, chạy mỗi 15 phút) duyệt toàn bộ tài khoản `CUSTOMER`. Mốc hoạt động cuối là `lastLoginAt`, nếu chưa từng đăng nhập thì dùng `createdAt`. Nếu mốc này đã quá 7 ngày và tài khoản đang `ACTIVE` thì chuyển sang `INACTIVE`. Scheduler **không bao giờ đụng tới tài khoản `LOCKED`**.
- **Khi đăng nhập** (`AuthService`): tài khoản `LOCKED` bị từ chối với thông báo "Tài khoản của bạn đã bị khóa". Nếu đăng nhập đúng mật khẩu, hệ thống cập nhật `lastLoginAt`, và tài khoản `INACTIVE` được chuyển lại thành `ACTIVE`.

---

## 5. Một số điểm cần lưu ý (hạn chế hiện tại)

1. **Phương thức thanh toán** (`COD`/`BANKING`) chưa được lưu vào đơn hàng, và chưa có cổng thanh toán online.
2. **Giỏ hàng chỉ lưu trong `localStorage`**, nên không đồng bộ giữa các thiết bị.
3. **Nhân viên:** giao diện chỉ cho xem khách hàng, nhưng `SecurityConfig` vẫn cho `EMPLOYEE` gọi `PUT /api/customers/**`. Nếu muốn chặn hẳn thì cần sửa cấu hình phía backend.
4. **Xóa khách hàng** chỉ xóa bản ghi `customers`, không xóa bản ghi `users`. Nếu khách đã có đơn hàng, thao tác xóa có thể lỗi do ràng buộc khóa ngoại. Trong trường hợp này nên dùng trạng thái `LOCKED` thay vì xóa.
5. **Tồn kho bị trừ ngay khi đặt hàng** (lúc đơn còn `PENDING`) và chỉ được hoàn lại khi đơn bị hủy.
