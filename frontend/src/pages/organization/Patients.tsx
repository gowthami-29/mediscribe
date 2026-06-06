import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function OrganizationPatients() {
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const data =
        await adminApi.getOrganizationPatients()

      setPatients(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Organization Patients
      </h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((patient) => (
            <tr key={patient.patient_id}>
              <td>
                {patient.first_name} {patient.last_name}
              </td>

              <td>{patient.email}</td>

              <td>{patient.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}