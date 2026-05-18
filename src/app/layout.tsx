import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import SoloLevelingAura from "./components/SoloLevelingAura";
import SystemWelcomePopup from "./components/SystemWelcomePopup";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "MANGA-BLACK - Next-Gen Manga Platform",
  description: "Trải nghiệm đọc truyện thế hệ mới với công nghệ tối ưu hóa WebP thời gian thực và cào dữ liệu đa nguồn tốc độ cao.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%2306060c%22/><text x=%2250%25%22 y=%2265%25%22 font-size=%2250%22 font-weight=%22bold%22 fill=%22%2339C5BB%22 font-family=%22sans-serif%22 text-anchor=%22middle%22>MB</text></svg>" />
      </head>
      <body className={`${plusJakartaSans.className} antialiased`}>
        <SoloLevelingAura />
        <SystemWelcomePopup />
        {children}
      </body>
    </html>
  );
}
