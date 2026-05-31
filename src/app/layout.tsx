import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConnectionStatus from "@/components/ConnectionStatus";
import PageTransition from "@/components/PageTransition";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Đình Phong Store - Uy tín, chất lượng, tận tâm",
  description:
    "Mua bán iPhone mới và cũ, sửa chữa iPhone, thu cũ đổi mới tại Đình Phong Store. Địa chỉ 150 Thái Thị Bôi, Thanh Khê, Đà Nẵng. Hotline/Zalo 0378 207 593 - 0935 462 493.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        {/* Skip to content link for keyboard users */}
        <a href="#main-content" className="skip-to-content">
          Chuyển đến nội dung chính
        </a>
        <ConnectionStatus />
        <Header />
        <main id="main-content" className="flex-1 pt-16" role="main">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
