export function newId() {
  return crypto.randomUUID()
}

export function today() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isOverdue(dateStr) {
  if (!dateStr) return false
  return dateStr < today()
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${parseInt(m)}/${parseInt(d)}/${y}`
}

export function formatDateTime(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function projectStatus(project, tasks) {
  const pt = tasks.filter(t => t.projectId === project.id)
  if (pt.length === 0) return { label: 'not started', cls: 'text-gray-600 bg-gray-100' }
  if (pt.every(t => t.done)) return { label: 'done', cls: 'text-green-700 bg-green-100' }
  return { label: 'in progress', cls: 'text-blue-700 bg-blue-100' }
}

export function projectProgress(project, tasks) {
  const pt = tasks.filter(t => t.projectId === project.id)
  if (pt.length === 0) return { done: 0, total: 0, pct: 0 }
  const done = pt.filter(t => t.done).length
  return { done, total: pt.length, pct: Math.round((done / pt.length) * 100) }
}
