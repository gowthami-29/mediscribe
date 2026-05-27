import { useEffect, useState } from 'react'

import { apiKeysApi } from '@/api/apiKeys'

export default function APIKeysPage() {

  const [keys, setKeys] = useState<any[]>([])

  const loadKeys = async () => {

    const data =
      await apiKeysApi.getKeys()

    setKeys(data)
  }

  useEffect(() => {

    loadKeys()

  }, [])

  const handleGenerate = async () => {

    await apiKeysApi.generateKey()

    loadKeys()
  }

  const handleRevoke = async (
    id: string
  ) => {

    await apiKeysApi.revokeKey(id)

    loadKeys()
  }

  return (

    <div className="p-6">

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-bold">
          API Keys
        </h1>

        <div className="flex gap-2">

  <button
    onClick={handleGenerate}
    className="bg-indigo-600 text-white px-4 py-2 rounded"
  >
    Generate Key
  </button>

  <button
    onClick={loadKeys}
    className="bg-slate-600 text-white px-4 py-2 rounded"
  >
    Refresh
  </button>

</div>
      </div>

      <div className="space-y-4">

        {keys.map((key) => (

          <div
            key={key.api_key_id}
            className="border rounded p-4"
          >

            <div className="font-medium">
              {key.name}
            </div>

            <div className="text-sm break-all text-slate-600">
              {key.key}
            </div>

            <div className="text-xs text-slate-500 mt-2">
              Requests:
              {key.request_count || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">
  Last Used:
  {' '}
  {key.last_used_at || 'Never'}
</div>
            <button
              onClick={() =>
                handleRevoke(key.api_key_id)
              }
              className="mt-3 text-red-500"
            >
              Revoke
            </button>

          </div>
        ))}

      </div>
    </div>
  )
}