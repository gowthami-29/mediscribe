import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      const data = await adminApi.getDoctors()
      setDoctors(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading doctors...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Doctors
      </h1>

      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Organization</th>
          </tr>
        </thead>

        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.user_id}>
              <td className="border p-2">
                {doctor.full_name}
              </td>

              <td className="border p-2">
                {doctor.email}
              </td>

              <td className="border p-2">
                {doctor.role}
              </td>

              <td className="border p-2">
                {doctor.status}
              </td>

              <td className="border p-2">
                {doctor.organization_id}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}