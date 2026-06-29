import { useState } from 'react'
import Modal from './Modal'

const INPUT = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600'

export default function QuickAddModal({ onClose, onAddTask, onAddNote, projects }) {
  const [type, setType] = useState('task')
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('')
  const [tags, setTags] = useState('')
  const [projectId, setProjectId] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    if (type === 'task') {
      onAddTask({ title: title.trim(), dueDate: dueDate || null, priority: priority || null, projectId: projectId || null })
    } else {
      onAddNote({ title: title.trim(), body: '', tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [], projectId: projectId || null })
    }
    onClose()
  }

  return (
    <Modal title="Quick add" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          {['task', 'note'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-1.5 text-sm rounded-lg border capitalize transition-colors ${
                type === t
                  ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <input type="text" placeholder={type === 'task' ? 'Task title' : 'Note title'} value={title} onChange={e => setTitle(e.target.value)} autoFocus required className={INPUT} />

        {type === 'task' ? (
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={INPUT} />
            <select value={priority} onChange={e => setPriority(e.target.value)} className={INPUT}>
              <option value="">Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        ) : (
          <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} className={INPUT} />
        )}

        {projects.length > 0 && (
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className={INPUT}>
            <option value="">No project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
            Add
          </button>
        </div>
      </form>
    </Modal>
  )
}
