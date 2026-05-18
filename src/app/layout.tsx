import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import SoloLevelingAura from "./components/SoloLevelingAura";
import SystemWelcomePopup from "./components/SystemWelcomePopup";
import HistoryDrawer from "./components/HistoryDrawer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "MANGA-BLACK - Thiên Đường Truyện Tranh Cho Wibu & Otaku",
  description: "Wibu Never Die — Thiên đường đọc truyện tranh siêu tốc, cực kỳ mượt mà dành cho wibu chúa và otaku tối thượng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2230%22 fill=%22%2307090e%22/><path d=%22M50 15 C52 25, 45 35, 40 38 C35 40, 25 35, 20 45 C28 48, 38 48, 42 52 C35 55, 22 55, 15 65 C25 68, 38 65, 45 68 C40 75, 30 85, 35 90 C45 88, 52 82, 55 78 C60 85, 70 90, 75 88 C70 82, 68 75, 65 68 C72 65, 82 62, 85 58 C78 55, 68 56, 65 52 C72 48, 80 40, 78 35 C70 38, 62 42, 58 45 C60 35, 58 20, 50 15 Z%22 fill=%22%23ff76b8%22/><circle cx=%2236%22 cy=%2262%22 r=%223%22 fill=%22%23c5a880%22/><circle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22none%22 stroke=%22%23ff76b8%22 stroke-width=%222%22 stroke-dasharray=%226 4%22 opacity=%220.3%22/></svg>" />
      </head>
      <body className={`${plusJakartaSans.className} antialiased`}>
        <SoloLevelingAura />
        <SystemWelcomePopup />
        <HistoryDrawer />
        {children}
      </body>
    </html>
  );
}
