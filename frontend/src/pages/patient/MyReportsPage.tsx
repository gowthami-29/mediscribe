import { useEffect, useState } from 'react'
import { patientApi } from '@/api/patient'

export default function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    const data = await patientApi.getReports()
    setReports(data)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        My Reports
      </h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Report ID</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr key={report.report_id}>
              <td className="border p-2">
                {report.report_id}
              </td>

              <td className="border p-2">
                {report.status}
              </td>

              <td className="border p-2">
                {new Date(report.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}