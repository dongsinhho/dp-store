"use server"

import { getAuthenticatedPb } from "@/lib/admin-auth"
import { productSchema, generateSlug } from "@/lib/product-validation"

export interface ProductActionResult {
  success: boolean
  productId?: string
  error?: string
  fieldErrors?: Record<string, string>
}

export interface ProductListResult {
  success: boolean
  items: Array<{
    id: string
    name: string
    price: number
    stock: number
    is_active: boolean
    condition: string
    created: string
  }>
  totalPages: number
  page: number
  error?: string
}

export async function getAdminProducts(
  page: number = 1,
  perPage: number = 20
): Promise<ProductListResult> {
  const { pb, isAdmin, isAuthenticated } = await getAuthenticatedPb()

  if (!isAuthenticated || !isAdmin) {
    return { success: false, items: [], totalPages: 0, page: 1, error: "Unauthorized" }
  }

  try {
    const result = await pb.collection("products").getList(page, perPage, {
      sort: "-created",
    })

    const items = result.items.map((item) => ({
      id: item.id,
      name: item.name as string,
      price: item.price as number,
      stock: item.stock as number,
      is_active: item.is_active as boolean,
      condition: item.condition as string,
      created: item.created as string,
    }))

    return {
      success: true,
      items,
      totalPages: result.totalPages,
      page: result.page,
    }
  } catch (err) {
    console.error("Failed to fetch products:", err)
    return { success: false, items: [], totalPages: 0, page: 1, error: "Không thể tải danh sách sản phẩm." }
  }
}

export async function getProductById(id: string) {
  const { pb, isAdmin, isAuthenticated } = await getAuthenticatedPb()

  if (!isAuthenticated || !isAdmin) {
    return { success: false, error: "Unauthorized", product: null }
  }

  try {
    const product = await pb.collection("products").getOne(id)
    return { success: true, product, error: null }
  } catch {
    return { success: false, error: "Không tìm thấy sản phẩm.", product: null }
  }
}

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  const { pb, isAdmin, isAuthenticated } = await getAuthenticatedPb()

  if (!isAuthenticated || !isAdmin) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này." }
  }

  // Extract form data
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const condition = formData.get("condition") as string
  const price = Number(formData.get("price"))
  const originalPrice = formData.get("original_price")
    ? Number(formData.get("original_price"))
    : undefined
  const storage = formData.get("storage") as string
  const color = formData.get("color") as string
  const batteryHealth = formData.get("battery_health")
    ? Number(formData.get("battery_health"))
    : undefined
  const description = formData.get("description") as string
  const stock = Number(formData.get("stock"))
  const isActive = formData.get("is_active") === "true"

  // Get image files
  const imageFiles = formData.getAll("images") as File[]
  const existingImages = formData.getAll("existing_images") as string[]

  // Build images array for validation (existing + new file names)
  const imageNames = [
    ...existingImages,
    ...imageFiles.filter((f) => f.size > 0).map((f) => f.name),
  ]

  // Auto-generate slug
  const slug = generateSlug(name || "")

  // Validate with Zod schema
  const validationData = {
    name,
    slug,
    category,
    condition,
    price,
    original_price: originalPrice,
    storage,
    color,
    battery_health: batteryHealth,
    description,
    images: imageNames.length > 0 ? imageNames : [],
    stock,
    is_active: isActive,
  }

  const validation = productSchema.safeParse(validationData)

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    return { success: false, error: "Dữ liệu không hợp lệ.", fieldErrors }
  }

  try {
    // Check slug uniqueness
    try {
      const existing = await pb.collection("products").getList(1, 1, {
        filter: `slug = "${slug}"`,
      })
      if (existing.items.length > 0) {
        return { success: false, error: "Slug đã tồn tại. Vui lòng đổi tên sản phẩm.", fieldErrors: { name: "Tên sản phẩm tạo slug trùng lặp." } }
      }
    } catch {
      // Collection might not exist yet, continue
    }

    // Create product with FormData for file upload
    const pbFormData = new FormData()
    pbFormData.append("name", name)
    pbFormData.append("slug", slug)
    pbFormData.append("category", category)
    pbFormData.append("condition", condition)
    pbFormData.append("price", String(price))
    if (originalPrice) {
      pbFormData.append("original_price", String(originalPrice))
    }
    pbFormData.append("storage", storage)
    pbFormData.append("color", color)
    if (batteryHealth !== undefined && condition === "used") {
      pbFormData.append("battery_health", String(batteryHealth))
    }
    pbFormData.append("description", description)
    pbFormData.append("stock", String(stock))
    pbFormData.append("is_active", String(isActive))

    // Append image files
    for (const file of imageFiles) {
      if (file.size > 0) {
        pbFormData.append("images", file)
      }
    }

    const product = await pb.collection("products").create(pbFormData)
    return { success: true, productId: product.id }
  } catch (err) {
    console.error("Failed to create product:", err)
    return { success: false, error: "Đã xảy ra lỗi khi tạo sản phẩm. Vui lòng thử lại." }
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<ProductActionResult> {
  const { pb, isAdmin, isAuthenticated } = await getAuthenticatedPb()

  if (!isAuthenticated || !isAdmin) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này." }
  }

  // Extract form data
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const condition = formData.get("condition") as string
  const price = Number(formData.get("price"))
  const originalPrice = formData.get("original_price")
    ? Number(formData.get("original_price"))
    : undefined
  const storage = formData.get("storage") as string
  const color = formData.get("color") as string
  const batteryHealth = formData.get("battery_health")
    ? Number(formData.get("battery_health"))
    : undefined
  const description = formData.get("description") as string
  const stock = Number(formData.get("stock"))
  const isActive = formData.get("is_active") === "true"

  // Get image files
  const imageFiles = formData.getAll("images") as File[]
  const existingImages = formData.getAll("existing_images") as string[]

  // Build images array for validation
  const imageNames = [
    ...existingImages,
    ...imageFiles.filter((f) => f.size > 0).map((f) => f.name),
  ]

  // Auto-generate slug
  const slug = generateSlug(name || "")

  // Validate with Zod schema
  const validationData = {
    name,
    slug,
    category,
    condition,
    price,
    original_price: originalPrice,
    storage,
    color,
    battery_health: batteryHealth,
    description,
    images: imageNames.length > 0 ? imageNames : [],
    stock,
    is_active: isActive,
  }

  const validation = productSchema.safeParse(validationData)

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    return { success: false, error: "Dữ liệu không hợp lệ.", fieldErrors }
  }

  try {
    // Check slug uniqueness (exclude current product)
    try {
      const existing = await pb.collection("products").getList(1, 1, {
        filter: `slug = "${slug}" && id != "${id}"`,
      })
      if (existing.items.length > 0) {
        return { success: false, error: "Slug đã tồn tại. Vui lòng đổi tên sản phẩm.", fieldErrors: { name: "Tên sản phẩm tạo slug trùng lặp." } }
      }
    } catch {
      // Continue
    }

    // Update product with FormData for file upload
    const pbFormData = new FormData()
    pbFormData.append("name", name)
    pbFormData.append("slug", slug)
    pbFormData.append("category", category)
    pbFormData.append("condition", condition)
    pbFormData.append("price", String(price))
    if (originalPrice) {
      pbFormData.append("original_price", String(originalPrice))
    }
    pbFormData.append("storage", storage)
    pbFormData.append("color", color)
    if (batteryHealth !== undefined && condition === "used") {
      pbFormData.append("battery_health", String(batteryHealth))
    }
    pbFormData.append("description", description)
    pbFormData.append("stock", String(stock))
    pbFormData.append("is_active", String(isActive))

    // Append new image files
    for (const file of imageFiles) {
      if (file.size > 0) {
        pbFormData.append("images", file)
      }
    }

    await pb.collection("products").update(id, pbFormData)
    return { success: true, productId: id }
  } catch (err) {
    console.error("Failed to update product:", err)
    return { success: false, error: "Đã xảy ra lỗi khi cập nhật sản phẩm. Vui lòng thử lại." }
  }
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  const { pb, isAdmin, isAuthenticated } = await getAuthenticatedPb()

  if (!isAuthenticated || !isAdmin) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này." }
  }

  try {
    await pb.collection("products").delete(id)
    return { success: true }
  } catch (err) {
    console.error("Failed to delete product:", err)
    return { success: false, error: "Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại." }
  }
}

export async function getCategories() {
  const { pb, isAdmin, isAuthenticated } = await getAuthenticatedPb()

  if (!isAuthenticated || !isAdmin) {
    return { success: false, categories: [], error: "Unauthorized" }
  }

  try {
    const result = await pb.collection("categories").getFullList({
      sort: "sort_order",
      filter: "is_active = true",
    })

    const categories = result.map((item) => ({
      id: item.id,
      name: item.name as string,
      slug: item.slug as string,
    }))

    return { success: true, categories, error: null }
  } catch {
    return { success: true, categories: [], error: null }
  }
}
