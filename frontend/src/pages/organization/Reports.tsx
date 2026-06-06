import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function OrganizationReports() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    const data =
      await adminApi.getOrganizationReports()

    setReports(data)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Organization Reports
      </h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr key={report.report_id}>
              <td>{report.report_id}</td>

              <td>{report.status}</td>

              <td>
                {new Date(
                  report.created_at
                ).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}