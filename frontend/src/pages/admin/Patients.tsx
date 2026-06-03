import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const data = await adminApi.getPatients()
      setPatients(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading patients...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Patients
      </h1>

      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Gender</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Email</th>
          </tr>
        </thead>

        <tbody>
            {patients.map((patient) => (
                <tr key={patient.patient_id}>
                <td className="border p-2">
                    {patient.first_name} {patient.last_name}
                </td>

                <td className="border p-2">
                    {patient.gender}
                </td>

                <td className="border p-2">
                    {patient.phone}
                </td>

                <td className="border p-2">
                    {patient.email}
                </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}