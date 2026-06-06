import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function OrganizationSubscription() {
  const [subscription, setSubscription] =
    useState<any>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
  const data =
    await adminApi.getOrganizationSubscription()

  console.log("FULL RESPONSE", data)
  alert(JSON.stringify(data, null, 2))

  setSubscription(data)
}
  const requestUpgrade = async () => {
  try {
    console.log("Subscription Data:", subscription)

    await adminApi.createUpgradeRequest({
      organization_id: subscription.organization_id,
      current_plan: subscription.plan,
      requested_plan: 'premium',
      message
    })

    alert('Upgrade request submitted')
  } catch (err: any) {
    console.error(err)
    console.log("Response:", err.response?.data)

    alert(
      JSON.stringify(
        err.response?.data,
        null,
        2
      )
    )
  }
}
  if (!subscription) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Subscription
      </h1>

      <div className="border rounded p-6">

        <p>
          <strong>Organization:</strong>{" "}
          {subscription.name}
        </p>

        <p>
          <strong>Plan:</strong>{" "}
          {subscription.plan}
        </p>

        <p>
          <strong>Billing Status:</strong>{" "}
          {subscription.billing_status}
        </p>

        <p>
          <strong>Max Users:</strong>{" "}
          {subscription.max_users}
        </p>
        <div className="mt-6">

  <h3 className="font-semibold mb-2">
    Request Plan Upgrade
  </h3>

  <textarea
    value={message}
    onChange={(e) =>
      setMessage(e.target.value)
    }
    placeholder="Reason for upgrade"
    className="w-full border rounded p-3 mb-3"
  />

  <button
    onClick={requestUpgrade}
    className="bg-blue-600 text-white px-5 py-2 rounded"
  >
    Request Premium Upgrade
  </button>

</div>

      </div>
    </div>
  )
}