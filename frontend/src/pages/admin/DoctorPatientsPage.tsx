import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { adminApi } from "@/api/admin";
import { useNavigate } from "react-router-dom";
export default function DoctorPatientsPage() {
  const { doctorId } = useParams();

  const [patients, setPatients] = useState<any[]>([]);
const navigate = useNavigate();

  useEffect(() => {
    if (doctorId) {
      loadPatients();
    }
  }, [doctorId]);

  const loadPatients = async () => {
    const data = await adminApi.getDoctorPatients(doctorId!);
    setPatients(data);
  };

  return (
    <div>
      <h1>Doctor Patients</h1>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((patient) => (
            <tr key={patient.patient_id}>
              <td>
                {patient.first_name} {patient.last_name}
              </td>

              <td>{patient.email}</td>

               <td>
    <button
      onClick={() =>
        navigate(
          `/admin/patients/${patient.patient_id}/consultations`
        )
      }
    >
      View History
    </button>
  </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}