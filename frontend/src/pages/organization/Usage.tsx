import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function OrganizationUsage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    const data =
      await adminApi.getOrganizationUsage()

    setStats(data)
  }

  if (!stats) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Usage Analytics
      </h1>

      <div className="grid grid-cols-4 gap-4">

        <div className="border p-4 rounded">
          <h3>Doctors</h3>
          <p>{stats.doctors}</p>
        </div>

        <div className="border p-4 rounded">
          <h3>Patients</h3>
          <p>{stats.patients}</p>
        </div>

        <div className="border p-4 rounded">
          <h3>Consultations</h3>
          <p>{stats.consultations}</p>
        </div>

        <div className="border p-4 rounded">
          <h3>Reports</h3>
          <p>{stats.reports}</p>
        </div>

      </div>
    </div>
  )
}