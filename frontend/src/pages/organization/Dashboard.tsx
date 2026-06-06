import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function OrganizationDashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data =
        await adminApi.getOrganizationDashboard()

      setStats(data)
    } catch (err) {
      console.error(err)
    }
  }

  if (!stats) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Organization Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold">
            Doctors
          </h2>

          <p className="text-3xl font-bold">
            {stats.doctors}
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold">
            Patients
          </h2>

          <p className="text-3xl font-bold">
            {stats.patients}
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold">
            Reports
          </h2>

          <p className="text-3xl font-bold">
            {stats.reports}
          </p>
        </div>

      </div>
    </div>
  )
}