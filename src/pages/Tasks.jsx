import { useState } from 'react'
import { Plus, Check, Pencil, Trash2 } from 'lucide-react'
import Modal, { ConfirmModal } from '../components/Modal'
import { today, isOverdue, formatDate } from '../lib/utils'

const PRIORITY_CLS = {
  high: 'text-amber-700 bg-amber-50 border-amber-200',
  medium: 'text-blue-700 bg-blue-50 border-blue-200',
  low: 'text-gray-500 bg-gray-50 border-gray-200',
}
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
const INPUT = 'border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600'

export default function Tasks({ data, ops, defaultProjectId = null }) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('createdAt')
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [bouncingId, setBouncingId] = useState(null)
  const todayStr = today()

  function handleToggle(id) {
    setBouncingId(id)
    setTimeout(() => setBouncingId(null), 400)
    ops.toggleTask(id)
  }

  let list = [...data.tasks]
  if (defaultProjectId) list = list.filter(t => t.projectId === defaultProjectId)
  else list = list.filter(t => !t.projectId)
  if (filter === 'today') list = list.filter(t => !t.done && t.dueDate === todayStr)
  else if (filter === 'overdue') list = list.filter(t => !t.done && isOverdue(t.dueDate))
  else if (filter === 'done') list = list.filter(t => t.done)

  list.sort((a, b) => {
    if (sort === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    }
    if (sort === 'priority') return (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  function handleSave(formData) {
    if (editing.id) ops.updateTask(editing.id, formData)
    else ops.addTask({ ...formData, projectId: defaultProjectId ?? formData.projectId })
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`font-bold text-gray-900 dark:text-white ${defaultProjectId ? 'text-base' : 'text-xl'}`}>Tasks</h2>
        <button onClick={() => setEditing({})} className="flex items-center gap-1.5 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
          <Plus size={14} />Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {['all', 'today', 'overdue', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                filter === f
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >{f}</button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className={`${INPUT} text-xs py-1`}>
          <option value="createdAt">Sort: created</option>
          <option value="dueDate">Sort: due date</option>
          <option value="priority">Sort: priority</option>
        </select>
      </div>

      {list.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-sm text-gray-400 dark:text-gray-500">
          {filter === 'all'
            ? <span>No tasks yet. <button onClick={() => setEditing({})} className="underline text-gray-600 dark:text-gray-300">Add one</button></span>
            : `No ${filter} tasks.`}
        </div>
      ) : (
        <div className="space-y-1.5">
          {list.map(task => {
            const project = data.projects.find(p => p.id === task.projectId)
            const overdue = !task.done && isOverdue(task.dueDate)
            return (
              <div key={task.id} className={`bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 flex items-center gap-3 ${overdue ? 'border-red-200 dark:border-red-900' : 'border-gray-200 dark:border-gray-700'}`}>
                <button onClick={() => handleToggle(task.id)}
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    task.done ? 'bg-gray-900 border-gray-900 dark:bg-white dark:border-white' : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400'
                  } ${bouncingId === task.id ? 'check-pop' : ''}`}>
                  {task.done && <Check size={11} className="text-white dark:text-gray-900" />}
                </button>
                <span className={`flex-1 text-sm min-w-0 ${task.done ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {task.dueDate && (
                    <span className={`text-xs ${overdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>{formatDate(task.dueDate)}</span>
                  )}
                  {task.priority && PRIORITY_CLS[task.priority] && (
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${PRIORITY_CLS[task.priority]}`}>{task.priority}</span>
                  )}
                  {project && !defaultProjectId && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 max-w-[80px] truncate">
                      {project.name}
                    </span>
                  )}
                  <button onClick={() => setEditing(task)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5"><Pencil size={13} /></button>
                  <button onClick={() => setConfirmId(task.id)} className="text-gray-400 hover:text-red-500 transition-colors p-0.5"><Trash2 size={13} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing !== null && (
        <TaskModal task={editing} projects={data.projects} defaultProjectId={defaultProjectId} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
      {confirmId !== null && (
        <ConfirmModal message="Delete this task?" onConfirm={() => { ops.deleteTask(confirmId); setConfirmId(null) }} onCancel={() => setConfirmId(null)} />
      )}
    </div>
  )
}

function TaskModal({ task, projects, defaultProjectId, onSave, onClose }) {
  const [title, setTitle] = useState(task.title || '')
  const [dueDate, setDueDate] = useState(task.dueDate || '')
  const [priority, setPriority] = useState(task.priority || '')
  const [projectId, setProjectId] = useState(task.projectId || defaultProjectId || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), dueDate: dueDate || null, priority: priority || null, projectId: projectId || null })
  }

  return (
    <Modal title={task.id ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} autoFocus required className={`w-full ${INPUT}`} />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={INPUT} />
          <select value={priority} onChange={e => setPriority(e.target.value)} className={INPUT}>
            <option value="">No priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        {!defaultProjectId && projects.length > 0 && (
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className={`w-full ${INPUT}`}>
            <option value="">No project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">{task.id ? 'Save' : 'Add task'}</button>
        </div>
      </form>
    </Modal>
  )
}
