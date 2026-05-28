import { getAuthenticatedPb } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeftRight } from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ định giá",
  evaluated: "Đã định giá",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  evaluated: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  processing: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default async function AdminTradeInListPage() {
  const { pb, isAdmin } = await getAuthenticatedPb()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  let records: { items: Array<Record<string, unknown>>; totalItems: number } = {
    items: [],
    totalItems: 0,
  }

  try {
    records = await pb.collection("trade_in_requests").getList(1, 50, {
      sort: "-created",
      expand: "new_product",
    })
  } catch {
    // Handle connection error gracefully
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ArrowLeftRight className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý Thu cũ đổi mới
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Tổng cộng: {records.totalItems} yêu cầu
          </p>
        </div>

        {records.items.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            Chưa có yêu cầu thu cũ đổi mới nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Máy cũ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Máy mới
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.items.map((record) => {
                  const status = record.status as string
                  const expand = record.expand as Record<string, unknown> | undefined
                  const newProduct = expand?.new_product as Record<string, unknown> | undefined

                  return (
                    <tr key={record.id as string} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.customer_name as string}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.customer_phone as string}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.old_device_model as string}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.old_device_storage as string}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {newProduct
                          ? (newProduct.name as string)
                          : <span className="text-gray-400">Chưa chọn</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.trade_in_value
                          ? `${(record.trade_in_value as number).toLocaleString("vi-VN")}đ`
                          : <span className="text-gray-400">Chưa định giá</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}
                        >
                          {STATUS_LABELS[status] || status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.created as string).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/thu-cu/${record.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
