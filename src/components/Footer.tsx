import Link from "next/link"

const footerLinks = [
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/sua-chua", label: "Sửa chữa" },
  { href: "/thu-cu-doi-moi", label: "Thu cũ đổi mới" },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="text-center md:text-left">
            <Link href="/" className="text-lg font-bold text-white">
              Đình Phong Store
            </Link>
            <p className="text-sm mt-1">Chuyên iPhone mới &amp; cũ, sửa chữa, thu cũ đổi mới</p>
            <p className="text-sm text-gray-400 mt-2">150 Thái Thị Bôi, Thanh Khê, Đà Nẵng</p>
            <p className="text-sm text-gray-400">Hotline/Zalo: 0378 207 593 - 0935 462 493</p>
            <a
              href="https://www.facebook.com/DinhPhongstore"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gray-400 hover:text-white"
            >
              Facebook: Châu Đình Phong (Đình Phong Store)
            </a>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Đình Phong Store. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
