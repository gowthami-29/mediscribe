import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function Organizations() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subscription_plan: 'basic',
    max_users: 10,
  })

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const data = await adminApi.getOrganizations()
      setOrganizations(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await adminApi.createOrganization(form)

      setForm({
        name: '',
        email: '',
        phone: '',
        subscription_plan: 'basic',
        max_users: 10,
      })

      setShowForm(false)

      await loadOrganizations()
    } catch (error) {
      console.error(error)
      alert('Failed to create organization')
    }
  }

  if (loading) {
    return <div>Loading organizations...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Organizations
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Organization
        </button>
      </div>

      {showForm && (
        <div className="border p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Create Organization
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Organization Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <select
              className="border p-2 rounded"
              value={form.subscription_plan}
              onChange={(e) =>
                setForm({
                  ...form,
                  subscription_plan: e.target.value,
                })
              }
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <input
              type="number"
              className="border p-2 rounded"
              placeholder="Max Users"
              value={form.max_users}
              onChange={(e) =>
                setForm({
                  ...form,
                  max_users: Number(e.target.value),
                })
              }
            />
          </div>

          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Save Organization
          </button>
        </div>
      )}

      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Plan</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Max Users</th>
          </tr>
        </thead>

        <tbody>
          {organizations.map((org) => (
            <tr key={org.organization_id}>
              <td className="border p-2">{org.name}</td>
              <td className="border p-2">{org.email}</td>
              <td className="border p-2">
                {org.subscription_plan}
              </td>
              <td className="border p-2">
                {org.billing_status}
              </td>
              <td className="border p-2">
                {org.max_users}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}