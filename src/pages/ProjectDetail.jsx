import { useState } from 'react'
import { ChevronLeft, Pencil } from 'lucide-react'
import Tasks from './Tasks'
import Notes from './Notes'
import Modal from '../components/Modal'
import { projectStatus, projectProgress } from '../lib/utils'

const INPUT = 'border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600'

export default function ProjectDetail({ projectId, data, ops, onBack }) {
  const [tab, setTab] = useState('tasks')
  const [editingProject, setEditingProject] = useState(false)

  const project = data.projects.find(p => p.id === projectId)
  if (!project) return <div className="text-sm text-gray-500">Project not found.</div>

  const { label: statusLabel, cls: statusCls } = projectStatus(project, data.tasks)
  const { done, total, pct } = projectProgress(project, data.tasks)

  return (
    <div className="space-y-5">
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
          <ChevronLeft size={15} />All projects
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCls}`}>{statusLabel}</span>
            </div>
            {project.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>}
          </div>
          <button onClick={() => setEditingProject(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 flex-shrink-0 mt-0.5">
            <Pencil size={15} />
          </button>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gray-800 dark:bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{done}/{total} done</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {['tasks', 'notes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >{t}</button>
        ))}
      </div>

      {tab === 'tasks' ? <Tasks data={data} ops={ops} defaultProjectId={projectId} /> : <Notes data={data} ops={ops} defaultProjectId={projectId} />}

      {editingProject && (
        <ProjectEditModal
          project={project}
          onSave={(formData) => { ops.updateProject(projectId, formData); setEditingProject(false) }}
          onClose={() => setEditingProject(false)}
        />
      )}
    </div>
  )
}

function ProjectEditModal({ project, onSave, onClose }) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim() })
  }

  return (
    <Modal title="Edit project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus required className={`w-full ${INPUT}`} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Description (optional)" className={`w-full resize-none ${INPUT}`} />
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">Save</button>
        </div>
      </form>
    </Modal>
  )
}
