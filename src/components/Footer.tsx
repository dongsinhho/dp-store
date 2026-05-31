import Link from "next/link"
import { MapPin, Phone } from "lucide-react"

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}

const navLinks = [
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/sua-chua", label: "Sửa chữa" },
  { href: "/thu-cu-doi-moi", label: "Thu cũ đổi mới" },
]

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Brand & Tagline */}
          <div>
            <Link href="/" className="text-xl font-bold text-white">
              Đình Phong Store
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Chuyên iPhone mới &amp; cũ chính hãng, dịch vụ sửa chữa uy tín, thu cũ đổi mới giá tốt tại Đà Nẵng.
            </p>
            {/* Social Icons */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.facebook.com/DinhPhongstore"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook Đình Phong Store"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Điều hướng
            </h3>
            <nav aria-label="Liên kết chân trang" className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Liên hệ
            </h3>
            <ul className="flex flex-col gap-3" role="list">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" aria-hidden="true" />
                <span>150 Thái Thị Bôi, Thanh Khê, Đà Nẵng</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" aria-hidden="true" />
                <span>0378 207 593 - 0935 462 493</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <FacebookIcon className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                <a
                  href="https://www.facebook.com/DinhPhongstore"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  Châu Đình Phong (Đình Phong Store)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Đình Phong Store. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
