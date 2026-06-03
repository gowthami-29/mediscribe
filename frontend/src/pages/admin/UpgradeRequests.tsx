import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function UpgradeRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const data = await adminApi.getUpgradeRequests()
      setRequests(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const approveRequest = async (
    requestId: string
  ) => {
    try {
      await adminApi.approveUpgradeRequest(
        requestId
      )

      loadRequests()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div>Loading requests...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Upgrade Requests
      </h1>

      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">
              Organization
            </th>

            <th className="border p-2">
              Current Plan
            </th>

            <th className="border p-2">
              Requested Plan
            </th>

            <th className="border p-2">
              Message
            </th>

            <th className="border p-2">
              Status
            </th>

            <th className="border p-2">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => (
            <tr key={request.request_id}>
              <td className="border p-2">
                {request.organization_id}
              </td>

              <td className="border p-2">
                {request.current_plan}
              </td>

              <td className="border p-2">
                {request.requested_plan}
              </td>

              <td className="border p-2">
                {request.message}
              </td>

              <td className="border p-2">
                {request.status}
              </td>

              <td className="border p-2">
                    {request.status === "pending" ? (
                        <button
                        onClick={() =>
                            approveRequest(request.request_id)
                        }
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                        Approve
                        </button>
                    ) : (
                        <span className="text-green-600">
                        Approved
                        </span>
                    )}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}