# MANGA-BLACK - Next-Gen Manga Platform

Trải nghiệm đọc truyện tranh thế hệ mới được xây dựng trên kiến trúc nguyên khối hiệu năng cao, tối ưu hóa hiển thị thời gian thực và tích hợp luồng dữ liệu an toàn bảo mật tuyệt đối. Giao diện được thiết kế theo chủ đề **Hệ Thống Solo Leveling / Hoàng Đế Bóng Tối** mang lại trải nghiệm nhập vai độc nhất vô nhị.

---

## Tính Năng Vượt Trội

1. **Tối Ưu Hóa Ảnh WebP Thời Gian Thực (Dynamic Image Optimization)**:
   * Tích hợp máy chủ trung gian (Proxy CDN) tự động thu nhỏ, giải nén và chuyển đổi định dạng hình ảnh sang WebP độ nén cao trực tiếp khi luồng dữ liệu được tải.
   * Cơ chế Cache phân tầng giúp giảm thiểu băng thông máy chủ và tăng tốc độ phản hồi hình ảnh dưới 150ms.

2. **Kiến Trúc Tích Hợp Luồng Dữ Liệu Bảo Mật (Zero-Leak Multi-Source CDN)**:
   * Toàn bộ các cổng kết nối đến luồng dữ liệu nội địa và quốc tế được xử lý 100% tại máy chủ biên Next.js API Routes.
   * Triệt tiêu hoàn toàn nguy cơ lộ địa chỉ máy chủ gốc hoặc luồng dữ liệu thứ ba khi người dùng thực hiện kiểm tra mã nguồn hệ thống (F12 Client Inspection Protection).

3. **Bố Cục Giao Diện HUD Độc Quyền (Solo Leveling Cyber HUD)**:
   * **Hiệu ứng Hào quang Hoàng Đế (Solo Leveling Aura)**: Lớp phủ sương mù năng lượng bóng tối chuyển động mượt mà ở biên màn hình bằng GPU Acceleration.
   * **Cổng không gian (Dimension Quest Popup)**: Hộp hội thoại nhiệm vụ hằng ngày tự động xuất hiện bằng hiệu ứng dịch chuyển tọa độ (system-teleport keyframes), mang lại cảm giác mở ra không gian Ham Ngục chân thực.
   * **Giao diện thẻ kính (Glassmorphic Cyber Grid)**: Phối hợp hoàn hảo giữa tông nền tối sâu thẳm, đường lưới scanline công nghệ và viền sáng neon Cyan.

---

## Kiến Trúc Công Nghệ (Tech Stack)

* **Khung công nghệ chính (Core Framework)**: Next.js (App Router) tối ưu hóa kết xuất hỗn hợp SSR/ISR/CSR.
* **Ngôn ngữ phát triển (Language)**: TypeScript đảm bảo an toàn kiểu dữ liệu tuyệt đối từ máy chủ đến trình duyệt.
* **Thư viện biểu tượng & kiểu dáng**: Tailwind CSS, Lucide React Icons.
* **Quản lý trạng thái & Lưu trữ**: LocalStorage đồng bộ hóa thời gian thực các cài đặt nguồn truyện và trạng thái nhiệm vụ.

---

## Cấu Trúc Thư Mục Dự Án

```text
MangaImperial/
├── public/                 # Tài nguyên hình ảnh, biểu tượng hệ thống
├── src/
│   ├── app/
│   │   ├── api/            # API Route bảo mật trung chuyển luồng ảnh và dữ liệu
│   │   ├── components/     # Các thành phần giao diện (Header, Aura, WelcomeQuest)
│   │   ├── latest/         # Trang tổng hợp chương mới nhất
│   │   ├── manga/          # Trang chi tiết thông tin bộ truyện
│   │   ├── read/           # Bộ lọc và giao diện trình đọc truyện thông minh
│   │   ├── globals.css     # Cấu hình thiết kế CSS Cyber HUD nâng cao
│   │   ├── layout.tsx      # Quản lý lớp nền và thẻ toàn cục
│   │   └── page.tsx        # Trang chủ khám phá danh sách truyện tập trung
│   ├── services/           # Lớp kết nối dữ liệu an toàn phi tập trung (Server-side)
│   └── config.ts           # Cấu hình cài đặt nguồn dữ liệu hệ thống
├── package.json            # Quản lý gói phụ thuộc và câu lệnh vận hành
└── tsconfig.json           # Cấu hình biên dịch TypeScript nghiêm ngặt
```

---

## Hướng Dẫn Vận Hành & Cài Đặt

### 1. Yêu Cầu Hệ Thống
* Node.js phiên bản 18.x trở lên.
* Trình quản lý gói `npm` hoặc `yarn`.

### 2. Cài Đặt Các Gói Phụ Thuộc
Chạy lệnh sau tại thư mục gốc của dự án để tự động tải các gói tài nguyên:
```bash
npm install
```

### 3. Vận Hành Trong Môi Trường Phát Triển
Khởi động máy chủ thử nghiệm cục bộ với khả năng tự động tải lại khi thay đổi mã nguồn (Hot Reloading):
```bash
npm run dev
```
Sau đó truy cập địa chỉ [http://localhost:3000](http://localhost:3000) trên trình duyệt để trải nghiệm.

### 4. Đóng Gói Và Triển Khai Sản Phẩm (Production Build)
Biên dịch dự án sang mã nguồn tối ưu hóa hiệu năng cao để sẵn sàng triển khai lên các dịch vụ đám mây (Render, Vercel, VPS...):
```bash
npm run build
```
Để chạy thử sản phẩm sau khi đóng gói cục bộ:
```bash
npm run start
```

---

## Nguyên Tắc Bảo Mật Luồng Dữ Liệu

Dự án tuân thủ nghiêm ngặt chuẩn thiết kế bảo mật biên:
1. **SSRF Guard**: Ngăn chặn hoàn toàn việc gọi trực tiếp đến nguồn dữ liệu thứ ba từ máy khách (Client-side fetches).
2. **CDN Proxy Whitelisting**: Chỉ trung chuyển hình ảnh thuộc danh sách miền tin cậy đã được cấu hình sẵn trong máy chủ biên Next.js, triệt tiêu lỗ hổng khai thác SSRF chéo.
3. **Anonymized Metadata**: Mọi đường dẫn và khóa định danh đều được mã hóa hoặc ẩn danh trước khi chuyển giao xuống trình duyệt người dùng.
