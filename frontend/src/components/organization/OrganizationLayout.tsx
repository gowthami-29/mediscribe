import { Outlet } from 'react-router-dom'
import OrganizationSidebar from './OrganizationSidebar'

export default function OrganizationLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <OrganizationSidebar />

      <div
        style={{
          flex: 1,
          padding: '24px'
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}