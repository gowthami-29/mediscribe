import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function Usage() {
  const [usage, setUsage] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      const data = await adminApi.getUsage()
      setUsage(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading usage...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Usage Tracking
      </h1>

      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Organization</th>
            <th className="border p-2">Plan</th>
            <th className="border p-2">Reports</th>
            <th className="border p-2">Transcriptions</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {usage.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">
                {item.organization_name}
              </td>

              <td className="border p-2">
                {item.plan_name}
              </td>

              <td className="border p-2">
                {item.reports_used} / {item.report_limit}
              </td>

              <td className="border p-2">
                {item.transcriptions_used} / {item.transcription_limit}
              </td>

              <td className="border p-2">
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}