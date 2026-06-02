export async function saveOfflineRecording(data: any) {

  const existing = JSON.parse(
    localStorage.getItem('offline_recordings') || '[]'
  )

  existing.push(data)

  localStorage.setItem(
    'offline_recordings',
    JSON.stringify(existing)
  )
}

export function getOfflineRecordings() {
  return JSON.parse(
    localStorage.getItem('offline_recordings') || '[]'
  )
}

export function clearOfflineRecordings() {
  localStorage.removeItem('offline_recordings')
}