import { getAuthenticatedPb } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { OrderStatus, ORDER_STATUS_TRANSITIONS } from "@/lib/constants"
import OrderStatusActions from "./OrderStatusActions"

const STATUS_LABELS: Record<string, string> = {
  [OrderStatus.Pending]: "Chờ xác nhận",
  [OrderStatus.Confirmed]: "Đã xác nhận",
  [OrderStatus.Shipping]: "Đang giao",
  [OrderStatus.Delivered]: "Đã giao",
  [OrderStatus.Cancelled]: "Đã hủy",
}

const STATUS_COLORS: Record<string, string> = {
  [OrderStatus.Pending]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.Confirmed]: "bg-blue-100 text-blue-800",
  [OrderStatus.Shipping]: "bg-purple-100 text-purple-800",
  [OrderStatus.Delivered]: "bg-green-100 text-green-800",
  [OrderStatus.Cancelled]: "bg-red-100 text-red-800",
}

interface OrderRecord {
  id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_address: string
  total_amount: number
  status: string
  payment_method: string
  notes?: string
  created: string
  updated: string
}

interface OrderItemRecord {
  id: string
  product: string
  quantity: number
  price: number
  expand?: { product?: { name: string; images: string[] } }
}

interface OrderDetailPageProps {
  params: { id: string }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { pb, isAdmin } = await getAuthenticatedPb()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  let order: OrderRecord | null = null
  let orderItems: OrderItemRecord[] = []

  try {
    order = await pb.collection("orders").getOne(params.id) as unknown as OrderRecord
    const itemsResult = await pb.collection("order_items").getFullList({
      filter: `order = "${params.id}"`,
      expand: "product",
    })
    orderItems = itemsResult as unknown as OrderItemRecord[]
  } catch (err) {
    console.error("Failed to fetch order:", err)
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Đơn hàng không tồn tại
        </h1>
        <p className="text-gray-500">
          Không tìm thấy đơn hàng với ID: {params.id}
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Đơn hàng không tồn tại
        </h1>
      </div>
    )
  }

  const currentStatus = order.status as OrderStatus
  const validNextStatuses = ORDER_STATUS_TRANSITIONS[currentStatus] || []

  return (
    <div>
      <div className="mb-6">
        <a
          href="/admin/don-hang"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Quay lại danh sách
        </a>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Chi tiết đơn hàng
        </h1>
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin khách hàng
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Họ tên</dt>
              <dd className="text-sm font-medium text-gray-900">
                {order.customer_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Số điện thoại</dt>
              <dd className="text-sm font-medium text-gray-900">
                {order.customer_phone}
              </dd>
            </div>
            {order.customer_email && (
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {order.customer_email}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-500">Địa chỉ</dt>
              <dd className="text-sm font-medium text-gray-900">
                {order.customer_address}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Thanh toán</dt>
              <dd className="text-sm font-medium text-gray-900">
                {order.payment_method === "cod"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : "Chuyển khoản ngân hàng"}
              </dd>
            </div>
            {order.notes && (
              <div>
                <dt className="text-sm text-gray-500">Ghi chú</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {order.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sản phẩm đặt mua
          </h2>
          <div className="divide-y divide-gray-200">
            {orderItems.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.expand?.product?.name || `Sản phẩm #${item.product}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Số lượng: {item.quantity} × {item.price.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <p className="text-base font-semibold text-gray-900">Tổng cộng</p>
              <p className="text-base font-semibold text-gray-900">
                {order.total_amount.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Actions */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Cập nhật trạng thái
        </h2>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Trạng thái hiện tại:</span>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>

        {validNextStatuses.length > 0 ? (
          <OrderStatusActions
            orderId={order.id}
            currentStatus={currentStatus}
            validNextStatuses={validNextStatuses}
          />
        ) : (
          <p className="text-sm text-gray-500">
            Đơn hàng đã ở trạng thái cuối cùng, không thể thay đổi.
          </p>
        )}
      </div>

      {/* Timestamps */}
      <div className="mt-6 text-sm text-gray-500 flex gap-6">
        <span>
          Ngày tạo: {new Date(order.created).toLocaleString("vi-VN")}
        </span>
        <span>
          Cập nhật: {new Date(order.updated).toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  )
}
