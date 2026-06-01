/**
 * Sync Manager — flushes the offline queue when connectivity is restored.
 * Call initSyncManager() once at app startup (e.g. in main.tsx or App.tsx).
 */

import { getAll, dequeue } from './offlineQueue'
import { apiClient } from '@/api/client'

async function flush(): Promise<void> {
  const entries = await getAll()
  if (entries.length === 0) return

  console.log(`[SyncManager] Flushing ${entries.length} queued save(s)...`)

  for (const entry of entries) {
    try {
      await apiClient.patch(
        `/consultations/${entry.consultationId}/draft`,
        {
          transcription_text: entry.transcriptionText,
          updated_at: entry.updatedAt,
        }
      )
      await dequeue(entry.id!)
      console.log(`[SyncManager] Flushed entry id=${entry.id}`)
    } catch (err) {
      // Keep in queue — will retry on next online event
      console.warn(`[SyncManager] Failed to flush entry id=${entry.id}:`, err)
    }
  }
}

export function initSyncManager(): () => void {
  const handler = () => {
    console.log('[SyncManager] Online — flushing queue')
    flush()
  }

  window.addEventListener('online', handler)

  // Also flush immediately in case we're already online with queued items
  if (navigator.onLine) flush()

  // Return cleanup function
  return () => window.removeEventListener('online', handler)
}
