import { useState } from 'react'
import { Plus, ChevronRight, Trash2 } from 'lucide-react'
import Modal, { ConfirmModal } from '../components/Modal'
import { projectStatus, projectProgress } from '../lib/utils'

const INPUT = 'border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600'

export default function Projects({ data, ops, onSelectProject }) {
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const { projects, tasks } = data

  function handleSave(formData) {
    if (editing.id) ops.updateProject(editing.id, formData)
    else ops.addProject(formData)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <button onClick={() => setEditing({})} className="flex items-center gap-1.5 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
          <Plus size={14} />New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No projects yet.{' '}
          <button onClick={() => setEditing({})} className="underline text-gray-600 dark:text-gray-300">Create your first</button>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(project => {
            const { label: statusLabel, cls: statusCls } = projectStatus(project, tasks)
            const { done, total, pct } = projectProgress(project, tasks)
            return (
              <div key={project.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectProject(project.id)}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">{project.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCls}`}>{statusLabel}</span>
                    </div>
                    {project.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{project.description}</p>}
                    {total > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-800 dark:bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{done}/{total}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => setConfirmId(project.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5"><Trash2 size={14} /></button>
                    <button onClick={() => onSelectProject(project.id)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1.5"><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing !== null && <ProjectModal project={editing} onSave={handleSave} onClose={() => setEditing(null)} INPUT={INPUT} />}
      {confirmId !== null && (
        <ConfirmModal
          message="Delete this project? All associated tasks and notes will also be deleted."
          onConfirm={() => { ops.deleteProject(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}

function ProjectModal({ project, onSave, onClose, INPUT }) {
  const [name, setName] = useState(project.name || '')
  const [description, setDescription] = useState(project.description || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim() })
  }

  return (
    <Modal title={project.id ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Project name" value={name} onChange={e => setName(e.target.value)} autoFocus required className={`w-full ${INPUT}`} />
        <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`w-full resize-none ${INPUT}`} />
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">{project.id ? 'Save' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  )
}
