import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'
import { useNavigate } from 'react-router-dom'


export default function OrganizationDoctors() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [doctor, setDoctor] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    license_number: '',
    specialization: '',
    department: ''
    })
const navigate = useNavigate()
const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      const data =
        await adminApi.getOrganizationDoctors()

      setDoctors(data)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleStatus = async (
    doctorId: string,
    currentStatus: string
  ) => {
    const newStatus =
      currentStatus === 'active'
        ? 'inactive'
        : 'active'

    await adminApi.updateDoctorStatus(
      doctorId,
      newStatus
    )

    loadDoctors()
  }
  const createDoctor = async () => {
  try {
    await adminApi.createOrganizationDoctor(
      doctor
    )

    setDoctor({
       full_name: '',
        email: '',
        password: '',
        phone: '',
        license_number: '',
        specialization: '',
        department: ''
    })

    setShowForm(false)

    loadDoctors()
  } catch (err) {
    console.error(err)
  }
}

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Organization Doctors
      </h1>
      <button
  onClick={() => setShowForm(!showForm)}
  className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
>
  Add Doctor
</button>
{showForm && (
  <div className="border p-4 rounded mb-4">

    <input
      className="border p-2 mr-2"
      placeholder="Doctor Name"
      value={doctor.full_name}
      onChange={(e) =>
        setDoctor({
          ...doctor,
          full_name: e.target.value
        })
      }
    />

    <input
      className="border p-2 mr-2"
      placeholder="Email"
      value={doctor.email}
      onChange={(e) =>
        setDoctor({
          ...doctor,
          email: e.target.value
        })
      }
    />
    <input
  className="border p-2 mr-2"
  placeholder="Phone"
  value={doctor.phone}
  onChange={(e) =>
    setDoctor({
      ...doctor,
      phone: e.target.value
    })
  }
/>

<input
  className="border p-2 mr-2"
  placeholder="License Number"
  value={doctor.license_number}
  onChange={(e) =>
    setDoctor({
      ...doctor,
      license_number: e.target.value
    })
  }
/>

<input
  className="border p-2 mr-2"
  placeholder="Specialization"
  value={doctor.specialization}
  onChange={(e) =>
    setDoctor({
      ...doctor,
      specialization: e.target.value
    })
  }
/>

<input
  className="border p-2 mr-2"
  placeholder="Department"
  value={doctor.department}
  onChange={(e) =>
    setDoctor({
      ...doctor,
      department: e.target.value
    })
  }
/>

    <input
      type="password"
      className="border p-2 mr-2"
      placeholder="Password"
      value={doctor.password}
      onChange={(e) =>
        setDoctor({
          ...doctor,
          password: e.target.value
        })
      }
    />

    <button
      onClick={createDoctor}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Create Doctor
    </button>

  </div>
)}
      
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">
              Name
            </th>

            <th className="border p-2">
              Email
            </th>

            <th className="border p-2">
              Status
            </th>

            <th className="border p-2">
              Action
            </th>
            <th>License</th>
<th>Department</th>
<th>Specialization</th>
          </tr>
        </thead>

        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.user_id}>
              <td
  className="border p-2 text-blue-600 cursor-pointer"
  onClick={() =>
    navigate(
      `/organization/doctors/${doctor.user_id}`
    )
  }
>
  {doctor.full_name}
</td>

              <td className="border p-2">
                {doctor.email}
              </td>

              <td className="border p-2">
                {doctor.status}
              </td>
              <td>{doctor.license_number}</td>
<td>{doctor.department}</td>
<td>{doctor.specialization}</td>

              <td className="border p-2">
                <button
                  onClick={() =>
                    toggleStatus(
                      doctor.user_id,
                      doctor.status
                    )
                  }
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  {doctor.status === 'active'
                    ? 'Deactivate'
                    : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}