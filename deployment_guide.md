# Cẩm Nang Hướng Dẫn Triển Khai (Deployment Guide) - MANGA-BLACK

Tài liệu này hướng dẫn chi tiết cách đưa nền tảng **MANGA-BLACK** lên các môi trường máy chủ trực tuyến ổn định nhất, tối ưu hóa tốc độ tải trang và bảo mật máy chủ biên.

---

## Bảng So Sánh Các Nền Tảng Triển Khai

| Tiêu Chí | Vercel (Khuyên Dùng) | Render.com | Netlify |
| :--- | :--- | :--- | :--- |
| **Độ Tối Ưu Cho Next.js** | **Xuất Sắc (10/10)** - Tích hợp gốc | **Khá (7/10)** - Chạy Node server | **Tốt (8/10)** - Next.js Adapter |
| **Tốc Độ Edge CDN** | Cực nhanh (Hạ tầng Edge toàn cầu) | Trung bình (Tùy vị trí khu vực chọn) | Rất nhanh |
| **Trạng Thái Ngủ Đông** | **Không** (Hoạt động 24/7 tức thì) | **Có** (Ngủ sau 15p nhàn rỗi ở gói Free) | **Không** |
| **Bảo Mật Máy Chủ Biên** | Tự động chống DDoS và tối ưu SSL | Cấu hình tường lửa cơ bản | Hỗ trợ CDN Shield |
| **Chi Phí** | Miễn phí (Gói Hobby) | Miễn phí (Gói Web Service Free) | Miễn phí |

---

## Hướng Dẫn Chi Tiết Triển Khai Lên Vercel (Độ Trễ Thấp Nhất)

### Bước 1: Liên Kết Tài Khoản GitHub Với Vercel
1. Truy cập trang chủ [Vercel](https://vercel.com/).
2. Chọn **"Sign Up"** hoặc **"Log In"** và chọn phương thức xác thực bằng **GitHub**.
3. Cấp quyền cho Vercel đọc danh sách kho chứa của tài khoản `Slayerblack012`.

### Bước 2: Import Kho Chứa `mangablack`
1. Tại màn hình Dashboard của Vercel, nhấn chọn **"Add New"** ở góc phải và chọn **"Project"**.
2. Tìm kiếm từ khóa `mangablack` trong danh mục dự án và chọn **"Import"**.

### Bước 3: Cấu Hình Dự Án & Deploy
1. **Framework Preset**: Vercel sẽ tự động nhận diện và đặt cấu hình mặc định là **Next.js**. Không cần thay đổi.
2. **Build and Output Settings**: Giữ nguyên các thông số mặc định của hệ thống:
   * Build Command: `next build`
   * Output Directory: `.next`
   * Install Command: `npm install`
3. **Environment Variables** (Tùy chọn): Nếu bạn có cấu hình API riêng tư hoặc mã khóa proxy CDN trong tệp `.env`, hãy điền chúng vào mục này để Vercel mã hóa an toàn trên máy chủ.
4. Nhấn nút **"Deploy"**. Quá trình biên dịch sẽ hoàn thành trong khoảng 60 giây và hệ thống sẽ cấp cho bạn một tên miền miễn phí dạng `https://mangablack.vercel.app`.

---

## Hướng Dẫn Triển Khai Lên Render (Lựa Chọn Dự Phòng)

Dự án đã tích hợp sẵn tệp cấu hình nguyên khối `render.yaml`.
1. Đăng nhập vào [Render.com](https://render.com/) bằng GitHub.
2. Chọn **"Blueprint"** trên thanh điều hướng.
3. Liên kết kho chứa `Slayerblack012/mangablack` và nhấn chọn áp dụng Blueprint. Hệ thống sẽ tự động khởi tạo máy chủ chạy dòng lệnh đóng gói Next.js của bạn.

---

## Các Lưu Ý Quan Trọng Sau Khi Triển Khai

1. **Tối ưu hóa Băng thông Ảnh**:
   * Do nền tảng sử dụng cơ chế Image Proxy trung chuyển qua máy chủ biên để nén WebP, việc chạy trên các gói miễn phí có thể bị giới hạn băng thông tối đa mỗi tháng (Vercel Hobby cho phép 100GB/tháng, rất thoải mái cho cá nhân đọc truyện).
2. **Đồng bộ hóa các thay đổi**:
   * Mỗi khi bạn cập nhật mã nguồn ở máy cục bộ và thực hiện đẩy lên GitHub (`git push`), Vercel/Render sẽ tự động phát hiện mã nguồn mới và tiến hành tái biên dịch (Re-deploy) tự động. Bạn không cần thực hiện thêm bất cứ thao tác thủ công nào.
