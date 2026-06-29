import { useState, useEffect } from 'react'
import { loadData, saveData, exportData } from './lib/storage'
import { newId } from './lib/utils'
import Layout from './components/Layout'
import QuickAddModal from './components/QuickAddModal'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'

export default function App() {
  const [data, setData] = useState(() => loadData())
  const [view, setView] = useState('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [quickAdd, setQuickAdd] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('noted-dark') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('noted-dark', dark)
  }, [dark])

  function update(newData) {
    setData(newData)
    saveData(newData)
  }

  const addTask = (task) =>
    update({ ...data, tasks: [...data.tasks, { id: newId(), done: false, createdAt: new Date().toISOString(), ...task }] })
  const updateTask = (id, changes) =>
    update({ ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, ...changes } : t) })
  const deleteTask = (id) =>
    update({ ...data, tasks: data.tasks.filter(t => t.id !== id) })
  const toggleTask = (id) =>
    update({ ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })

  const addNote = (note) => {
    const now = new Date().toISOString()
    update({ ...data, notes: [...data.notes, { id: newId(), createdAt: now, updatedAt: now, ...note }] })
  }
  const updateNote = (id, changes) =>
    update({ ...data, notes: data.notes.map(n => n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n) })
  const deleteNote = (id) =>
    update({ ...data, notes: data.notes.filter(n => n.id !== id) })

  const addProject = (project) =>
    update({ ...data, projects: [...data.projects, { id: newId(), createdAt: new Date().toISOString(), ...project }] })
  const updateProject = (id, changes) =>
    update({ ...data, projects: data.projects.map(p => p.id === id ? { ...p, ...changes } : p) })
  const deleteProject = (id) =>
    update({
      tasks: data.tasks.filter(t => t.projectId !== id),
      notes: data.notes.filter(n => n.projectId !== id),
      projects: data.projects.filter(p => p.id !== id),
    })

  function importData(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        if (window.confirm('This will overwrite your current data. Continue?')) {
          update({
            tasks: imported.tasks || [],
            notes: imported.notes || [],
            projects: imported.projects || [],
          })
        }
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
  }

  const ops = { addTask, updateTask, deleteTask, toggleTask, addNote, updateNote, deleteNote, addProject, updateProject, deleteProject }

  function navigate(v, projectId = null) {
    setView(v)
    setSelectedProjectId(projectId)
  }

  const navView = view === 'projects' && selectedProjectId ? 'projects' : view

  return (
    <Layout
      view={navView}
      setView={(v) => navigate(v)}
      onExport={() => exportData(data)}
      onImport={importData}
      onQuickAdd={() => setQuickAdd(true)}
      dark={dark}
      onToggleDark={() => setDark(d => !d)}
    >
      {view === 'dashboard' && <Dashboard data={data} ops={ops} navigate={navigate} />}
      {view === 'tasks' && <Tasks data={data} ops={ops} />}
      {view === 'notes' && <Notes data={data} ops={ops} />}
      {view === 'projects' && !selectedProjectId && (
        <Projects data={data} ops={ops} onSelectProject={(id) => navigate('projects', id)} />
      )}
      {view === 'projects' && selectedProjectId && (
        <ProjectDetail projectId={selectedProjectId} data={data} ops={ops} onBack={() => navigate('projects')} />
      )}
      {quickAdd && (
        <QuickAddModal onClose={() => setQuickAdd(false)} onAddTask={addTask} onAddNote={addNote} projects={data.projects} />
      )}
    </Layout>
  )
}
