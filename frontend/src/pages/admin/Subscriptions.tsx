import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)

  useEffect(() => {
    loadSubscriptions()
  }, [])
  const handleUpdate = async () => {
  try {
    await adminApi.updateSubscription(
      editing.subscription_id,
      {
        plan_name: editing.plan_name,
        report_limit: editing.report_limit,
        transcription_limit:
          editing.transcription_limit,
        status: editing.status,
      }
    )

    setEditing(null)

    loadSubscriptions()
  } catch (error) {
    console.error(error)
  }
}

  const loadSubscriptions = async () => {
    try {
      const data = await adminApi.getSubscriptions()
      setSubscriptions(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading subscriptions...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Subscriptions
      </h1>

      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Organization</th>
            <th className="border p-2">Plan</th>
            <th className="border p-2">Report Limit</th>
            <th className="border p-2">Reports Used</th>
            <th className="border p-2">Transcription Limit</th>
            <th className="border p-2">Transcriptions Used</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.subscription_id}>
  <td className="border p-2">
    {sub.organization_name}
  </td>

  <td className="border p-2">
    {sub.plan_name}
  </td>

  <td className="border p-2">
    {sub.report_limit}
  </td>

  <td className="border p-2">
    {sub.reports_used}
  </td>

  <td className="border p-2">
    {sub.transcription_limit}
  </td>

  <td className="border p-2">
    {sub.transcriptions_used}
  </td>

  <td className="border p-2">
    {sub.status}
  </td>

  
  <td className="border p-2">
  <button
    onClick={() => setEditing(sub)}
    className="px-3 py-1 bg-blue-500 text-white rounded"
  >
    Edit
  </button>
</td>
</tr>
          ))}
        </tbody>
      </table>
      {editing && (
  <div className="mt-6 border p-4 rounded">
    <h2 className="font-bold mb-4">
      Edit Subscription
    </h2>

    <input
      value={editing.plan_name}
      onChange={(e) =>
        setEditing({
          ...editing,
          plan_name: e.target.value,
        })
      }
      className="border p-2 mr-2"
    />

    <input
      type="number"
      value={editing.report_limit}
      onChange={(e) =>
        setEditing({
          ...editing,
          report_limit: Number(e.target.value),
        })
      }
      className="border p-2 mr-2"
    />

    <input
      type="number"
      value={editing.transcription_limit}
      onChange={(e) =>
        setEditing({
          ...editing,
          transcription_limit: Number(
            e.target.value
          ),
        })
      }
      className="border p-2 mr-2"
    />

    <button
      onClick={handleUpdate}
      className="bg-green-600 text-white px-4 py-2 rounded"
    >
      Save
    </button>
  </div>
)}
    </div>
  )
}