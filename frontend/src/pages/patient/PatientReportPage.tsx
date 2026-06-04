import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '@/api/client'

export default function PatientReportPage() {
  const { reportId } = useParams()

  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    const res = await apiClient.get(
  `/patient/reports/${reportId}`
)

    setReport(res.data)
  }

  if (!report) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Medical Report
      </h1>

      <h3>Subjective</h3>
      <p>{report.subjective}</p>

      <h3>Objective</h3>
      <p>{report.objective}</p>

      <h3>Assessment</h3>
      <p>{report.assessment}</p>

      <h3>Plan</h3>
      <p>{report.plan}</p>
    </div>
  )
}