import { Home, CheckSquare, FileText, Folder, Plus, Download, Upload, Moon, Sun } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: Home },
  { id: 'tasks', label: 'Tasks', Icon: CheckSquare },
  { id: 'notes', label: 'Notes', Icon: FileText },
  { id: 'projects', label: 'Projects', Icon: Folder },
]

export default function Layout({ children, view, setView, onExport, onImport, onQuickAdd, dark, onToggleDark }) {
  function triggerImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => { if (e.target.files[0]) onImport(e.target.files[0]) }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Noted</span>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">By Rafi for Rafi</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === id
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-100 dark:border-gray-700 space-y-0.5">
          <button
            onClick={onToggleDark}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            onClick={onExport}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <Download size={14} />
            Export backup
          </button>
          <button
            onClick={triggerImport}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <Upload size={14} />
            Import backup
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-56">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 pb-28 md:pb-10">
          {children}
        </div>
      </main>

      {/* Floating add button */}
      <button
        onClick={onQuickAdd}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors z-20"
        aria-label="Quick add"
      >
        <Plus size={20} />
      </button>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex z-10">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              view === id ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
