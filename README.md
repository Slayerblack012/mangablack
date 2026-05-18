# MANGA-BLACK - Thiên Đường Truyện Tranh Cho Wibu & Otaku

Chào mừng các Wibu và Otaku chân chính đến với **MANGA-BLACK** — Thế giới đọc truyện tranh trực tuyến tối thượng, mang lại trải nghiệm đọc truyện tuyệt đỉnh, hoàn toàn mượt mà và không chứa quảng cáo. 

Đặc biệt, giao diện nền tảng được lấy cảm hứng sâu sắc từ **Hệ Thống Solo Leveling / Hoàng Đế Bóng Tối**, mang lại cảm giác thức tỉnh sức mạnh nhập vai có một không hai!

---

## 🔮 Những Tính Năng Vượt Trội

1. **Hình Ảnh Siêu Sắc Nét & Mượt Mà**:
   * Tích hợp cơ chế xử lý hình ảnh độc quyền, tự động làm nét và tối ưu dung lượng hình ảnh trực tiếp khi đọc, đảm bảo trải nghiệm sướng mắt nhất cho người xem.
   * Tự động lưu trữ hình ảnh thông minh giúp giảm thiểu tối đa thời gian chờ đợi hình ảnh, tốc độ tải chương cực nhanh.

2. **Hạ Tầng Tải Trang Siêu Tốc Cho Wibu**:
   * Toàn bộ các đường truyền kết nối đến các kho tàng truyện lớn trong nước và quốc tế đều được xử lý khép kín và an toàn tuyệt đối.
   * Trải nghiệm mượt mà hoàn toàn không chứa quảng cáo, bảo vệ tuyệt đối thiết bị của bạn.

3. **Giao Diện Hệ Thống Độc Quyền (Solo Leveling Cyber HUD)**:
   * **Hào quang Bóng Tối (Solo Leveling Aura)**: Lớp phủ sương mù năng lượng bóng tối chuyển động huyền ảo ở các viền màn hình, tạo chiều sâu nghệ thuật.
   * **Cảnh báo Hệ thống Solo Leveling**: Các hộp thoại thông báo, cảnh báo xóa lịch sử được thiết kế 100% dựa trên giao diện Quest Prompt huyền thoại của Thợ Săn Sung Jin-Woo, mang lại cảm giác nhập vai chân thực.
   * **Phong cách Minimalist Luxury**: Sự kết hợp hoàn mỹ giữa tông nền tối dịu mắt (`#07090e`), các điểm nhấn vàng Champagne (`#c5a880`) và hiệu ứng kính mờ (Glassmorphism) siêu sang trọng.

---

## 📂 Các Phân Khu Của Hệ Thống

```text
MangaImperial/
├── public/                 # Tài nguyên hình ảnh, biểu tượng Goku Black huyền thoại
├── src/
├── src/services/           # Phân khu dịch vụ kết nối dữ liệu siêu tốc
│   ├── types.ts            # Kiểu dữ liệu chuẩn hóa của hệ thống
│   ├── otruyen.service.ts  # Cổng kết nối truyện quốc tế và Việt Nam
│   └── mangadex.service.ts # Cổng kết nối truyện quốc tế cao cấp
├── src/app/
│   ├── api/                # Cổng trung chuyển hình ảnh sắc nét
│   ├── components/         # Thành phần giao diện (Header, Aura, Lịch sử đọc, Goku Black tab)
│   ├── latest/             # Phân khu truyện mới thức tỉnh
│   ├── manga/              # Thông tin chi tiết các bộ truyện
│   ├── read/               # Trình đọc truyện dịu mắt ban đêm
│   ├── globals.css         # Thiết kế CSS Cyber HUD đỉnh cao
│   ├── layout.tsx          # Lớp nền và favicon Goku Black
│   └── page.tsx            # Sảnh chính khám phá truyện
```

---

## ⛩️ Nghi Thức Khởi Chạy Hệ Thống (Dành Cho Ký Chủ)

### 1. Chuẩn Bị Trang Thiết Bị
* Máy tính đã kích hoạt môi trường vận hành Node.js (phiên bản 18 trở lên).

### 2. Triệu Hồi Tài Nguyên
Chạy lệnh sau tại thư mục gốc của dự án để tải toàn bộ tài nguyên:
```bash
npm install
```

### 3. Khởi Động Không Gian Đọc Truyện (Development Mode)
Kích hoạt máy chủ thử nghiệm cục bộ với tốc độ phản hồi siêu tốc:
```bash
npm run dev
```
Sau đó truy cập cổng kết nối [http://localhost:3000](http://localhost:3000) trên trình duyệt để lập tức thức tỉnh và trải nghiệm!

### 4. Đóng Gói Và Triển Khai Thực Tế (Production Build)
Để biên dịch toàn bộ hệ thống sang phiên bản tối ưu hóa hiệu năng cao nhất sẵn sàng chạy thực tế:
```bash
npm run build
```
Chạy thử nghiệm phiên bản đóng gói:
```bash
npm run start
```

---

## 🛡️ Nguyên Tắc Bảo Mật Của Hệ Thống

Hệ thống tuân thủ nghiêm ngặt chuẩn thiết kế bảo vệ ký chủ:
1. **Lớp Phòng Vệ Khép Kín**: Ngăn chặn hoàn toàn việc gọi trực tiếp đến nguồn dữ liệu thô từ máy người dùng.
2. **Bộ Lọc Miền Tin Cậy**: Chỉ cho phép tải hình ảnh thuộc danh sách an toàn được cấu hình sẵn trong máy chủ.
3. **Mã Hóa Lịch Sử**: Mọi thông tin chương đã đọc và hành trình của bạn đều được lưu trữ và mã hóa an toàn trên thiết bị cá nhân.
