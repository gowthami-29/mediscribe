import { NavLink } from 'react-router-dom'

export default function OrganizationSidebar() {
  return (
    <div
      style={{
        width: '250px',
        background: '#0f172a',
        color: 'white',
        padding: '20px',
        minHeight: '100vh'
      }}
    >
      <h2 className="text-xl font-bold mb-8">
        Organization Admin
      </h2>

      <nav className="flex flex-col gap-3">

        <NavLink to="/organization">
          Dashboard
        </NavLink>

        <NavLink to="/organization/doctors">
          Doctors
        </NavLink>

        <NavLink to="/organization/patients">
          Patients
        </NavLink>

        <NavLink to="/organization/reports">
          Reports
        </NavLink>

        <NavLink to="/organization/usage">
          Usage
        </NavLink>

        <NavLink to="/organization/subscription">
          Subscription
        </NavLink>
        <NavLink to="/organization/settings">
  Settings
</NavLink>

      </nav>
    </div>
  )
}