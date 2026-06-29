import { useState } from 'react'
import { Plus, Search, Trash2, X } from 'lucide-react'
import Modal, { ConfirmModal } from '../components/Modal'
import { formatDateTime } from '../lib/utils'

const INPUT = 'border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600'

export default function Notes({ data, ops, defaultProjectId = null }) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  let list = [...data.notes]
  if (defaultProjectId) list = list.filter(n => n.projectId === defaultProjectId)
  if (search.trim()) {
    const q = search.toLowerCase()
    list = list.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
  }
  list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  function handleSave(noteData) {
    if (editing.id) ops.updateNote(editing.id, noteData)
    else ops.addNote({ ...noteData, projectId: defaultProjectId ?? noteData.projectId })
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`font-bold text-gray-900 dark:text-white ${defaultProjectId ? 'text-base' : 'text-xl'}`}>Notes</h2>
        <button onClick={() => setEditing({})} className="flex items-center gap-1.5 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
          <Plus size={14} />Add
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input type="text" placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full pl-8 pr-8 ${INPUT}`} />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={14} />
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-sm text-gray-400 dark:text-gray-500">
          {search
            ? 'No notes match your search.'
            : <span>No notes yet. <button onClick={() => setEditing({})} className="underline text-gray-600 dark:text-gray-300">Add one</button></span>}
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(note => (
            <div key={note.id} onClick={() => setEditing(note)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{note.title || 'Untitled'}</div>
                  {note.body && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{note.body}</div>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {note.tags?.map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">{tag}</span>
                    ))}
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatDateTime(note.updatedAt)}</span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); setConfirmId(note.id) }}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-0.5 mt-0.5">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <NoteModal note={editing} projects={data.projects} defaultProjectId={defaultProjectId} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
      {confirmId !== null && (
        <ConfirmModal message="Delete this note?" onConfirm={() => { ops.deleteNote(confirmId); setConfirmId(null) }} onCancel={() => setConfirmId(null)} />
      )}
    </div>
  )
}

function NoteModal({ note, projects, defaultProjectId, onSave, onClose }) {
  const [title, setTitle] = useState(note.title || '')
  const [body, setBody] = useState(note.body || '')
  const [tags, setTags] = useState(note.tags?.join(', ') || '')
  const [projectId, setProjectId] = useState(note.projectId || defaultProjectId || '')

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      title: title.trim() || 'Untitled',
      body,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      projectId: projectId || null,
    })
  }

  return (
    <Modal title={note.id ? 'Edit note' : 'New note'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Note title" value={title} onChange={e => setTitle(e.target.value)} autoFocus className={`w-full ${INPUT}`} />
        <textarea placeholder="Write your note…" value={body} onChange={e => setBody(e.target.value)} rows={10} className={`w-full resize-none ${INPUT}`} />
        <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} className={`w-full ${INPUT}`} />
        {!defaultProjectId && projects.length > 0 && (
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className={`w-full ${INPUT}`}>
            <option value="">No project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">{note.id ? 'Save' : 'Add note'}</button>
        </div>
      </form>
    </Modal>
  )
}
