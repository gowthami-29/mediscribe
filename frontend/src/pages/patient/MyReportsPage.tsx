import { useEffect, useState } from 'react'
import { patientApi } from '@/api/patient'
import { useNavigate } from 'react-router-dom'


export default function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([])
const navigate = useNavigate()
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
  try {
    const data = await patientApi.getReports()

    console.log("REPORTS DATA:", data)

    setReports(data)
  } catch (error) {
    console.error("REPORT ERROR:", error)
  }
}

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        My Reports
      </h1>
<p>Total Reports: {reports.length}</p>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Report ID</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created</th>
            <th className="border p-2">Actions</th>
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
              <td className="border p-2">
  <button
    className="bg-blue-600 text-white px-3 py-1 rounded"
    onClick={() =>
      navigate(`/patient/reports/${report.report_id}`)
    }
  >
    View Report
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}