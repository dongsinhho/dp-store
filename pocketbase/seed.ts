import PocketBase from "pocketbase"

const PB_URL = "http://127.0.0.1:8090"
const ADMIN_EMAIL = "admin@dpstore.vn"
const ADMIN_PASSWORD = "admin123456"

/**
 * Generates a URL-safe slug from a product name.
 * Duplicated from src/lib/product-validation.ts to avoid Next.js module resolution issues.
 */
const VIETNAMESE_DIACRITICS_MAP: Record<string, string> = {
  à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
  ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
  â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
  đ: "d",
  è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
  ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
  ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
  ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
  ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
  ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
  ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
  ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
  ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
}

function generateSlug(name: string): string {
  let slug = name.toLowerCase()
  slug = slug
    .split("")
    .map((char) => VIETNAMESE_DIACRITICS_MAP[char] ?? char)
    .join("")
  slug = slug.replace(/[^a-z0-9]+/g, "-")
  slug = slug.replace(/^-+|-+$/g, "")
  return slug
}

// ============================================================
// SEED DATA
// ============================================================

const categories = [
  {
    name: "iPhone 15 Series",
    slug: "iphone-15-series",
    description: "Dòng iPhone 15 mới nhất từ Apple với chip A17 Pro và camera 48MP",
    sort_order: 1,
    is_active: true,
  },
  {
    name: "iPhone 14 Series",
    slug: "iphone-14-series",
    description: "Dòng iPhone 14 với thiết kế Dynamic Island và camera nâng cấp",
    sort_order: 2,
    is_active: true,
  },
  {
    name: "iPhone 13 Series",
    slug: "iphone-13-series",
    description: "Dòng iPhone 13 ổn định với hiệu năng tốt và giá hợp lý",
    sort_order: 3,
    is_active: true,
  },
  {
    name: "Phụ kiện",
    slug: "phu-kien",
    description: "Phụ kiện chính hãng cho iPhone: ốp lưng, sạc, tai nghe, cáp",
    sort_order: 4,
    is_active: true,
  },
]

interface ProductSeed {
  name: string
  category_slug: string
  condition: "new" | "used"
  price: number
  original_price?: number
  storage: string
  color: string
  battery_health?: number
  description: string
  stock: number
  is_active: boolean
}

const products: ProductSeed[] = [
  {
    name: "iPhone 15 Pro Max 256GB Đen Titan",
    category_slug: "iphone-15-series",
    condition: "new",
    price: 34990000,
    original_price: 37990000,
    storage: "256GB",
    color: "Đen Titan",
    description:
      "iPhone 15 Pro Max mới 100%, nguyên seal hộp. Chip A17 Pro mạnh mẽ, camera 48MP với zoom quang 5x, khung viền titan siêu nhẹ. Bảo hành 12 tháng tại DP Store.",
    stock: 5,
    is_active: true,
  },
  {
    name: "iPhone 15 Pro 128GB Xanh Titan",
    category_slug: "iphone-15-series",
    condition: "new",
    price: 28990000,
    original_price: 30990000,
    storage: "128GB",
    color: "Xanh Titan",
    description:
      "iPhone 15 Pro chính hãng VN/A, nguyên seal. Chip A17 Pro, camera 48MP, Action Button tiện lợi. Thiết kế titan cao cấp, nhẹ hơn thế hệ trước. Bảo hành 12 tháng.",
    stock: 8,
    is_active: true,
  },
  {
    name: "iPhone 15 128GB Hồng",
    category_slug: "iphone-15-series",
    condition: "new",
    price: 22990000,
    original_price: 24990000,
    storage: "128GB",
    color: "Hồng",
    description:
      "iPhone 15 chính hãng với Dynamic Island, camera 48MP, cổng USB-C tiện lợi. Màu Hồng thời trang, phù hợp mọi phong cách. Bảo hành 12 tháng tại DP Store.",
    stock: 10,
    is_active: true,
  },
  {
    name: "iPhone 14 Pro Max 256GB Tím",
    category_slug: "iphone-14-series",
    condition: "used",
    price: 24990000,
    original_price: 33990000,
    storage: "256GB",
    color: "Tím",
    battery_health: 92,
    description:
      "iPhone 14 Pro Max đã qua sử dụng, tình trạng 98%. Màn hình không trầy, máy hoạt động mượt mà. Pin 92% - còn rất tốt. Đầy đủ phụ kiện, bảo hành 6 tháng tại cửa hàng.",
    stock: 3,
    is_active: true,
  },
  {
    name: "iPhone 14 Pro 128GB Vàng",
    category_slug: "iphone-14-series",
    condition: "used",
    price: 19990000,
    original_price: 28990000,
    storage: "128GB",
    color: "Vàng",
    battery_health: 90,
    description:
      "iPhone 14 Pro cũ đẹp như mới, Dynamic Island, camera 48MP. Máy không trầy xước, pin 90%. Bảo hành 6 tháng phần cứng tại DP Store.",
    stock: 4,
    is_active: true,
  },
  {
    name: "iPhone 14 128GB Đen",
    category_slug: "iphone-14-series",
    condition: "used",
    price: 15990000,
    original_price: 22990000,
    storage: "128GB",
    color: "Đen",
    battery_health: 88,
    description:
      "iPhone 14 cũ giá tốt, tình trạng 95%. Chip A15 Bionic vẫn mạnh mẽ, camera kép 12MP chụp đẹp. Pin 88%, sử dụng thoải mái cả ngày. Bảo hành 6 tháng.",
    stock: 6,
    is_active: true,
  },
  {
    name: "iPhone 13 128GB Trắng",
    category_slug: "iphone-13-series",
    condition: "used",
    price: 12990000,
    original_price: 20990000,
    storage: "128GB",
    color: "Trắng",
    battery_health: 85,
    description:
      "iPhone 13 cũ giá rẻ, phù hợp sinh viên và người mới dùng iPhone. Chip A15, camera kép, Face ID nhanh. Pin 85% - dùng được cả ngày. Bảo hành 3 tháng.",
    stock: 7,
    is_active: true,
  },
  {
    name: "iPhone 13 Pro 256GB Xanh Sierra",
    category_slug: "iphone-13-series",
    condition: "used",
    price: 16990000,
    original_price: 28990000,
    storage: "256GB",
    color: "Xanh Sierra",
    battery_health: 87,
    description:
      "iPhone 13 Pro cũ cao cấp, màn hình ProMotion 120Hz mượt mà. Camera 3 ống kính chụp macro đẹp. Pin 87%, máy đẹp 97%. Bảo hành 6 tháng tại DP Store.",
    stock: 2,
    is_active: true,
  },
  {
    name: "iPhone 13 Mini 128GB Đỏ",
    category_slug: "iphone-13-series",
    condition: "used",
    price: 10990000,
    original_price: 18990000,
    storage: "128GB",
    color: "Đỏ",
    battery_health: 82,
    description:
      "iPhone 13 Mini nhỏ gọn, cầm vừa tay. Hiệu năng A15 mạnh mẽ trong thân hình compact. Pin 82% - phù hợp người dùng nhẹ. Bảo hành 3 tháng.",
    stock: 3,
    is_active: true,
  },
  {
    name: "iPhone 15 Pro Max 512GB Trắng Titan",
    category_slug: "iphone-15-series",
    condition: "new",
    price: 39990000,
    original_price: 42990000,
    storage: "512GB",
    color: "Trắng Titan",
    description:
      "iPhone 15 Pro Max bản 512GB dung lượng lớn, phù hợp quay video 4K ProRes. Chip A17 Pro, camera zoom 5x, khung titan. Nguyên seal, bảo hành 12 tháng Apple.",
    stock: 3,
    is_active: true,
  },
  {
    name: "iPhone 14 Plus 128GB Xanh",
    category_slug: "iphone-14-series",
    condition: "used",
    price: 17490000,
    original_price: 25990000,
    storage: "128GB",
    color: "Xanh",
    battery_health: 91,
    description:
      "iPhone 14 Plus màn hình lớn 6.7 inch, pin trâu nhất dòng iPhone 14. Máy cũ đẹp 96%, pin 91%. Phù hợp xem phim, chơi game. Bảo hành 6 tháng.",
    stock: 4,
    is_active: true,
  },
  {
    name: "Ốp lưng MagSafe iPhone 15 Pro Max",
    category_slug: "phu-kien",
    condition: "new",
    price: 1290000,
    original_price: 1490000,
    storage: "N/A",
    color: "Đen",
    description:
      "Ốp lưng MagSafe chính hãng Apple cho iPhone 15 Pro Max. Chất liệu silicone cao cấp, bám tay tốt, hỗ trợ sạc MagSafe. Nhiều màu sắc lựa chọn.",
    stock: 20,
    is_active: true,
  },
]

// ============================================================
// SEED FUNCTIONS
// ============================================================

async function seedCategories(pb: PocketBase): Promise<Map<string, string>> {
  console.log("\n📁 Seeding categories...")
  const categoryMap = new Map<string, string>()

  for (const cat of categories) {
    try {
      // Check if category already exists
      const existing = await pb
        .collection("categories")
        .getFirstListItem(`slug="${cat.slug}"`)
        .catch(() => null)

      if (existing) {
        console.log(`  ⏭️  Category "${cat.name}" already exists, skipping.`)
        categoryMap.set(cat.slug, existing.id)
        continue
      }

      const record = await pb.collection("categories").create(cat)
      categoryMap.set(cat.slug, record.id)
      console.log(`  ✅ Created category: ${cat.name}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`  ❌ Failed to create category "${cat.name}": ${message}`)
    }
  }

  return categoryMap
}

async function seedProducts(
  pb: PocketBase,
  categoryMap: Map<string, string>
): Promise<void> {
  console.log("\n📱 Seeding products...")

  for (const product of products) {
    const slug = generateSlug(product.name)

    try {
      // Check if product already exists
      const existing = await pb
        .collection("products")
        .getFirstListItem(`slug="${slug}"`)
        .catch(() => null)

      if (existing) {
        console.log(`  ⏭️  Product "${product.name}" already exists, skipping.`)
        continue
      }

      const categoryId = categoryMap.get(product.category_slug)
      if (!categoryId) {
        console.error(
          `  ❌ Category "${product.category_slug}" not found for product "${product.name}"`
        )
        continue
      }

      const productData: Record<string, unknown> = {
        name: product.name,
        slug,
        category: categoryId,
        condition: product.condition,
        price: product.price,
        storage: product.storage,
        color: product.color,
        description: product.description,
        stock: product.stock,
        is_active: product.is_active,
      }

      if (product.original_price) {
        productData.original_price = product.original_price
      }

      if (product.battery_health !== undefined) {
        productData.battery_health = product.battery_health
      }

      const record = await pb.collection("products").create(productData)
      console.log(`  ✅ Created product: ${product.name} (${record.id})`)
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string }
      const message = err.response?.data ? JSON.stringify(err.response.data) : (err.message || String(error))
      console.error(`  ❌ Failed to create product "${product.name}": ${message}`)
    }
  }
}

async function seedAdminUser(pb: PocketBase): Promise<void> {
  console.log("\n👤 Seeding admin user...")

  try {
    // Check if admin user already exists
    const existing = await pb
      .collection("users")
      .getFirstListItem(`email="${ADMIN_EMAIL}"`)
      .catch(() => null)

    if (existing) {
      console.log(`  ⏭️  Admin user "${ADMIN_EMAIL}" already exists, skipping.`)
      return
    }

    await pb.collection("users").create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      passwordConfirm: ADMIN_PASSWORD,
      name: "Admin DP Store",
      role: "admin",
      emailVisibility: true,
    })

    console.log(`  ✅ Created admin user: ${ADMIN_EMAIL}`)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`  ❌ Failed to create admin user: ${message}`)
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("🌱 DP Store - Seed Script")
  console.log("=".repeat(50))
  console.log(`Connecting to PocketBase at ${PB_URL}...`)

  const pb = new PocketBase(PB_URL)

  try {
    // Authenticate as superadmin (PocketBase admin)
    // In PB v0.25, superusers auth requires email+password
    await pb.collection("_superusers").authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
    console.log("✅ Authenticated as superadmin")
  } catch (authError) {
    // Try alternative auth method
    try {
      await (pb as any).admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
      console.log("✅ Authenticated as admin (legacy method)")
    } catch {
      console.log("⚠️  Could not authenticate as superadmin. Trying without auth...")
      console.log("   Auth error:", (authError as any)?.message || authError)
      console.log("   (Make sure PocketBase is running and admin account exists)")
    }
  }

  // Seed data
  const categoryMap = await seedCategories(pb)
  await seedProducts(pb, categoryMap)
  await seedAdminUser(pb)

  console.log("\n" + "=".repeat(50))
  console.log("🎉 Seed completed!")
  console.log(`   Categories: ${categories.length}`)
  console.log(`   Products: ${products.length}`)
  console.log(`   Admin: ${ADMIN_EMAIL}`)
}

main().catch((error) => {
  console.error("💥 Seed failed:", error)
  process.exit(1)
})
