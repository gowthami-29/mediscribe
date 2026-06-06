import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { adminApi } from '@/api/admin'

export default function DoctorDetails() {
  const { doctorId } = useParams()
const [editing, setEditing] = useState(false)
  const [doctor, setDoctor] = useState<any>(null)
const [newPassword, setNewPassword] = useState('')
const [showResetPassword, setShowResetPassword] = useState(false)
  useEffect(() => {
    if (doctorId) {
      loadDoctor()
    }
  }, [doctorId])

  const loadDoctor = async () => {
    try {
      const data =
        await adminApi.getDoctorDetails(
          doctorId as string
        )

      setDoctor(data)
    } catch (err) {
      console.error(err)
    }
  }
  const saveDoctor = async () => {
  try {
    await adminApi.updateDoctor(
      doctorId as string,
      {
        full_name: doctor.full_name,
        phone: doctor.phone,
        license_number: doctor.license_number,
        department: doctor.department
      }
    )

    alert('Doctor updated successfully')

    setEditing(false)

    loadDoctor()
  } catch (err) {
    console.error(err)
    alert('Failed to update doctor')
  }
}
const resetPassword = async () => {
  try {
    await adminApi.resetDoctorPassword(
      doctorId as string,
      newPassword
    )

    alert('Password reset successfully')

    setNewPassword('')
    setShowResetPassword(false)
  } catch (err) {
    console.error(err)
    alert('Failed to reset password')
  }
}

  if (!doctor) {
    return (
      <div className="p-6">
        Loading...
      </div>
    )
  }
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Doctor Details
      </h1>
      <button
  onClick={() => setEditing(true)}
  className="px-4 py-2 bg-blue-600 text-white rounded"
>
  Edit Doctor
</button>
<button
  onClick={() =>
    setShowResetPassword(
      !showResetPassword
    )
  }
  className="ml-2 px-4 py-2 bg-red-600 text-white rounded"
>
  Reset Password
</button>
{showResetPassword && (
  <div className="mt-4 border p-4 rounded bg-red-50">

    <h2 className="text-lg font-semibold mb-3">
      Reset Doctor Password
    </h2>

    <input
      type="password"
      placeholder="New Password"
      value={newPassword}
      onChange={(e) =>
        setNewPassword(e.target.value)
      }
      className="border p-2 w-full mb-3"
    />

    <button
      onClick={resetPassword}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      Update Password
    </button>

  </div>
)}
{editing && (
  <div className="mt-4 border p-4 rounded bg-gray-50">

    <h2 className="text-xl font-semibold mb-4">
      Edit Doctor
    </h2>

    <div className="mb-3">
        <label>Full Name</label>
<input
  className="border p-2 w-full mb-2"
  value={doctor.full_name || ''}
  onChange={(e) =>
    setDoctor({
      ...doctor,
      full_name: e.target.value
    })
  }
/>

<label>License Number</label>
<input
  className="border p-2 w-full mb-2"
  value={doctor.license_number || ''}
  onChange={(e) =>
    setDoctor({
      ...doctor,
      license_number: e.target.value
    })
  }
/>
      <label className="block font-medium mb-1">
        Phone
      </label>

      <input
        className="border p-2 w-full"
        placeholder="Enter phone number"
        value={doctor.phone || ''}
        onChange={(e) =>
          setDoctor({
            ...doctor,
            phone: e.target.value
          })
        }
      />
    </div>

    

    <div className="mb-3">
      <label className="block font-medium mb-1">
        Department
      </label>

      <input
        className="border p-2 w-full"
        placeholder="e.g Emergency"
        value={doctor.department || ''}
        onChange={(e) =>
          setDoctor({
            ...doctor,
            department: e.target.value
          })
        }
      />
    </div>
    

    <div className="flex gap-2">

      <button
  onClick={saveDoctor}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Save
</button>

      <button
        onClick={() => setEditing(false)}
        className="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>

    </div>

  </div>
)}

      <div className="bg-white border rounded-lg p-6">

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="font-semibold">
              Full Name
            </label>

            <p>{doctor.full_name}</p>
          </div>

          <div>
            <label className="font-semibold">
              Email
            </label>

            <p>{doctor.email}</p>
          </div>

          <div>
            <label className="font-semibold">
              Phone
            </label>

            <p>{doctor.phone || '-'}</p>
          </div>

          <div>
            <label className="font-semibold">
              License Number
            </label>

            <p>
              {doctor.license_number || '-'}
            </p>
          </div>

          <div>
            <label className="font-semibold">
              Specialization
            </label>

            <p>
              {doctor.specialization || '-'}
            </p>
          </div>

          <div>
            <label className="font-semibold">
              Department
            </label>

            <p>
              {doctor.department || '-'}
            </p>
          </div>

          <div>
            <label className="font-semibold">
              Status
            </label>

            <p>{doctor.status}</p>
          </div>

          <div>
            <label className="font-semibold">
              Role
            </label>

            <p>{doctor.role}</p>
          </div>

          <div>
            <label className="font-semibold">
              Created At
            </label>

            <p>{doctor.created_at}</p>
          </div>

        </div>
      </div>

      {/* Future Stats Cards */}

      <div className="grid grid-cols-3 gap-4 mt-6">

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold">
            Patients
          </h3>

          <p className="text-3xl font-bold">
            {doctor.patient_count || 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold">
            Consultations
          </h3>

          <p className="text-3xl font-bold">
            {doctor.consultation_count || 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold">
            Reports
          </h3>

          <p className="text-3xl font-bold">
            {doctor.report_count || 0}
          </p>
        </div>

      </div>
    </div>
  )
}