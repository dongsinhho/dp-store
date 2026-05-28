# PocketBase - DP Store Backend

## Giới thiệu

PocketBase là backend all-in-one cho DP Store, cung cấp:
- Database (SQLite)
- REST API tự động
- Realtime subscriptions
- File storage
- Admin dashboard

## Yêu cầu hệ thống

- **Node.js** 18+ (để chạy npm scripts)
- **curl** (Linux/Mac) hoặc **PowerShell** (Windows) để tải PocketBase
- **unzip** (Linux/Mac) để giải nén

## Cài đặt nhanh

### Linux / macOS

```bash
# Chạy script setup tự động
npm run pb:setup

# Hoặc chạy trực tiếp
chmod +x pocketbase/setup.sh
./pocketbase/setup.sh
```

### Windows (PowerShell)

```powershell
# Chạy script setup tự động
npm run pb:setup

# Hoặc chạy trực tiếp
powershell -ExecutionPolicy Bypass -File pocketbase\setup.ps1
```

## Khởi động PocketBase

```bash
# Sử dụng npm script
npm run pb:start

# Hoặc chạy trực tiếp (Linux/Mac)
./pocketbase/pocketbase serve --http=127.0.0.1:8090 --dir=./pocketbase/pb_data --migrationsDir=./pocketbase/pb_migrations

# Windows
.\pocketbase\pocketbase.exe serve --http=127.0.0.1:8090 --dir=.\pocketbase\pb_data --migrationsDir=.\pocketbase\pb_migrations
```

## Truy cập

| Dịch vụ | URL |
|---------|-----|
| API | http://127.0.0.1:8090/api/ |
| Admin Dashboard | http://127.0.0.1:8090/_/ |

## Tài khoản Admin mặc định

- **Email:** admin@dpstore.vn
- **Password:** admin123456

> ⚠️ **Lưu ý:** Hãy đổi mật khẩu admin sau khi deploy lên production!

## Cấu trúc thư mục

```
pocketbase/
├── pb_data/          # Database & uploaded files (git ignored)
├── pb_migrations/    # Migration files (schema definitions)
├── setup.sh          # Setup script cho Linux/Mac
├── setup.ps1         # Setup script cho Windows
├── pocketbase        # Binary file (git ignored, Linux/Mac)
├── pocketbase.exe    # Binary file (git ignored, Windows)
└── README.md         # File này
```

## Scripts trong package.json

| Script | Mô tả |
|--------|--------|
| `npm run pb:setup` | Tải và cài đặt PocketBase |
| `npm run pb:start` | Khởi động PocketBase server |

## Migration Files

Các migration files trong `pb_migrations/` định nghĩa schema cho database:
- Collections (bảng dữ liệu)
- Fields (cột)
- API rules (quyền truy cập)
- Indexes

Migrations được tự động áp dụng khi chạy setup script.

## Xử lý sự cố

### Lỗi "Permission denied" (Linux/Mac)
```bash
chmod +x pocketbase/setup.sh
chmod +x pocketbase/pocketbase
```

### Lỗi "Execution Policy" (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Reset database
Xóa thư mục `pb_data/` và chạy lại setup:
```bash
rm -rf pocketbase/pb_data
npm run pb:setup
```

### Port 8090 đã được sử dụng
Thay đổi port trong lệnh khởi động:
```bash
./pocketbase/pocketbase serve --http=127.0.0.1:8091
```
Nhớ cập nhật `NEXT_PUBLIC_POCKETBASE_URL` trong `.env.local` tương ứng.

## Phát triển

1. Chạy PocketBase: `npm run pb:start`
2. Chạy Next.js: `npm run dev`
3. Mở trình duyệt: http://localhost:3000

PocketBase Admin Dashboard có sẵn tại http://127.0.0.1:8090/_/ để quản lý dữ liệu trực tiếp.
