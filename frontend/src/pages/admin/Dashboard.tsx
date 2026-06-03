import { useEffect, useState } from "react"
import { adminApi } from "@/api/admin"

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await adminApi.getDashboard()
      setStats(data)
    } catch (error) {
      console.error(error)
    }
  }

  if (!stats) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="border rounded-lg p-6 shadow">
          <h2 className="text-gray-500">
            Organizations
          </h2>
          <p className="text-3xl font-bold">
            {stats.organizations}
          </p>
        </div>

        <div className="border rounded-lg p-6 shadow">
          <h2 className="text-gray-500">
            Doctors
          </h2>
          <p className="text-3xl font-bold">
            {stats.doctors}
          </p>
        </div>

        <div className="border rounded-lg p-6 shadow">
          <h2 className="text-gray-500">
            Patients
          </h2>
          <p className="text-3xl font-bold">
            {stats.patients}
          </p>
        </div>

        <div className="border rounded-lg p-6 shadow">
          <h2 className="text-gray-500">
            Subscriptions
          </h2>
          <p className="text-3xl font-bold">
            {stats.subscriptions}
          </p>
        </div>

        <div className="border rounded-lg p-6 shadow">
          <h2 className="text-gray-500">
            Pending Upgrade Requests
          </h2>
          <p className="text-3xl font-bold text-red-600">
            {stats.pending_upgrade_requests}
          </p>
        </div>

      </div>
    </div>
  )
}