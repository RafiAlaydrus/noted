const KEY = 'noted-data'

const defaultData = { tasks: [], notes: [], projects: [] }

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData
  } catch {
    return defaultData
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'noted-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}
