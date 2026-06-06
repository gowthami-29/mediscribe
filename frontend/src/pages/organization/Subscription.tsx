import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function OrganizationSubscription() {
  const [subscription, setSubscription] =
    useState<any>(null)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    const data =
      await adminApi.getOrganizationSubscription()

    setSubscription(data)
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

      </div>
    </div>
  )
}