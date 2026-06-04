import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "@/api/admin";

export default function PatientConsultationsPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      loadConsultations();
    }
  }, [patientId]);

  const loadConsultations = async () => {
    try {
      const data = await adminApi.getPatientConsultations(
        patientId!
      );

      setConsultations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading consultations...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Consultation History
      </h1>

      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">
              Consultation Type
            </th>

            <th className="border p-2">
              Status
            </th>

            <th className="border p-2">
              Created At
            </th>

            <th className="border p-2">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {consultations.map((consultation) => (
            <tr key={consultation.consultation_id}>
              <td className="border p-2">
                {consultation.consultation_type}
              </td>

              <td className="border p-2">
                {consultation.status}
              </td>

              <td className="border p-2">
                {new Date(
                  consultation.created_at
                ).toLocaleString()}
              </td>

              <td className="border p-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                 onClick={() =>
  navigate(
    `/app/consultations/${consultation.consultation_id}/soap`
  )
}
                >
                  View Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}