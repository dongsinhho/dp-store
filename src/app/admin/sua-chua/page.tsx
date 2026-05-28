import Link from "next/link"
import { createServerPb } from "@/lib/pocketbase"
import { RepairStatus } from "@/lib/constants"

const STATUS_LABELS: Record<string, string> = {
  [RepairStatus.Pending]: "Chờ tiếp nhận",
  [RepairStatus.Diagnosing]: "Đang chẩn đoán",
  [RepairStatus.Quoted]: "Đã báo giá",
  [RepairStatus.Confirmed]: "Đã xác nhận",
  [RepairStatus.Repairing]: "Đang sửa",
  [RepairStatus.Completed]: "Hoàn thành",
  [RepairStatus.Delivered]: "Đã trả máy",
  [RepairStatus.Cancelled]: "Đã hủy",
}

const STATUS_COLORS: Record<string, string> = {
  [RepairStatus.Pending]: "bg-yellow-100 text-yellow-800",
  [RepairStatus.Diagnosing]: "bg-blue-100 text-blue-800",
  [RepairStatus.Quoted]: "bg-purple-100 text-purple-800",
  [RepairStatus.Confirmed]: "bg-indigo-100 text-indigo-800",
  [RepairStatus.Repairing]: "bg-orange-100 text-orange-800",
  [RepairStatus.Completed]: "bg-green-100 text-green-800",
  [RepairStatus.Delivered]: "bg-gray-100 text-gray-800",
  [RepairStatus.Cancelled]: "bg-red-100 text-red-800",
}

interface RepairRequestRecord {
  id: string
  customer_name: string
  customer_phone: string
  device_model: string
  issue_description: string
  status: string
  estimated_cost?: number
  created: string
  updated: string
}

export default async function AdminRepairListPage() {
  let requests: RepairRequestRecord[] = []
  let error: string | null = null

  try {
    const pb = createServerPb()
    const result = await pb.collection("repair_requests").getList(1, 50, {
      sort: "-created",
    })
    requests = result.items as unknown as RepairRequestRecord[]
  } catch (e) {
    console.error("Failed to fetch repair requests:", e)
    error = "Không thể tải danh sách yêu cầu sửa chữa."
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Quản lý yêu cầu sửa chữa
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {requests.length === 0 && !error ? (
        <div className="text-center py-12 text-gray-500">
          Chưa có yêu cầu sửa chữa nào.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thiết bị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chi phí dự kiến
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.customer_phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.device_model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        STATUS_COLORS[request.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[request.status] || request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.estimated_cost
                      ? `${request.estimated_cost.toLocaleString("vi-VN")} ₫`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.created).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/admin/sua-chua/${request.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
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
