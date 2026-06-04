import { useNavigate } from 'react-router-dom'

export default function PatientDashboard() {
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Patient Dashboard
      </h1>

      <div className="mt-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate('/patient/reports')}
        >
          My Reports
        </button>
      </div>
    </div>
  )
}