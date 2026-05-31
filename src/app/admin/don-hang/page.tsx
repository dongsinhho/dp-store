import Link from "next/link"
import { getAuthenticatedPb } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { OrderStatus } from "@/lib/constants"

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

export default async function AdminOrdersPage() {
  const { pb, isAdmin } = await getAuthenticatedPb()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  let orders: Array<{
    id: string
    customer_name: string
    customer_phone: string
    total_amount: number
    status: string
    payment_method: string
    created: string
  }> = []

  try {
    const result = await pb.collection("orders").getList(1, 50, {
      sort: "-created",
    })
    orders = result.items as unknown as typeof orders
  } catch (err) {
    console.error("Failed to fetch orders:", err)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        Quản lý đơn hàng
      </h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="bg-white rounded-md shadow-subtle overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">
                      {order.customer_name}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {order.customer_phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {order.total_amount.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {order.payment_method === "cod"
                      ? "COD"
                      : "Chuyển khoản"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {new Date(order.created).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/admin/don-hang/${order.id}`}
                      className="text-primary hover:text-blue-800 font-medium"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
