import { Link } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <div className="w-64 border-r p-4">
      <h2 className="font-bold text-xl mb-6">
        ArogyaScribe Admin
      </h2>

      <div className="space-y-3">
        <Link to="/admin">Dashboard</Link>

        <br />

        <Link to="/admin/organizations">
          Organizations
        </Link>

        <br />

        <Link to="/admin/doctors">
          Doctors
        </Link>
        <br />
        <Link to="/admin/patients">
          Patients
        </Link>
        <br />
        <Link to="/admin/subscriptions">
          Subscriptions
        </Link>
        <br />
        <Link to="/admin/usage">
          Usage
        </Link>
        <br />
        <Link to="/admin/upgrade-requests">
          Upgrade Requests
        </Link>
      </div>
    </div>
  );
}