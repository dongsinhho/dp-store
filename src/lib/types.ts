import { OrderStatus, RepairStatus, TradeInStatus } from "./constants"

export interface Product {
  id: string
  name: string
  slug: string
  category: string
  condition: "new" | "used"
  price: number
  original_price?: number
  storage: string
  color: string
  battery_health?: number
  description: string
  images: string[]
  stock: number
  is_active: boolean
  created: string
  updated: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  sort_order: number
  is_active: boolean
}

export interface Order {
  id: string
  user?: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_address: string
  items: string[]
  total_amount: number
  status: OrderStatus
  payment_method: "cod" | "bank_transfer"
  notes?: string
  created: string
  updated: string
}

export interface OrderItem {
  id: string
  order: string
  product: string
  quantity: number
  price: number
}

export interface RepairRequest {
  id: string
  user?: string
  customer_name: string
  customer_phone: string
  device_model: string
  issue_description: string
  images?: string[]
  status: RepairStatus
  estimated_cost?: number
  actual_cost?: number
  diagnosis?: string
  estimated_days?: number
  created: string
  updated: string
}

export interface TradeInRequest {
  id: string
  user?: string
  customer_name: string
  customer_phone: string
  old_device_model: string
  old_device_storage: string
  old_device_condition: string
  old_device_battery?: number
  old_device_images?: string[]
  new_product?: string
  trade_in_value?: number
  price_difference?: number
  status: TradeInStatus
  admin_notes?: string
  created: string
  updated: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalAmount: number
}
