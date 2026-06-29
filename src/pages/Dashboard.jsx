import { Check } from 'lucide-react'
import { today, isOverdue, formatDate, projectProgress } from '../lib/utils'

const PRIORITY_CLS = {
  high: 'text-amber-700 bg-amber-50 border-amber-200',
  medium: 'text-blue-700 bg-blue-50 border-blue-200',
  low: 'text-gray-500 bg-gray-50 border-gray-200',
}

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}

export default function Dashboard({ data, ops, navigate }) {
  const { tasks, notes, projects } = data
  const todayStr = today()

  const urgentTasks = tasks.filter(t => !t.done && (t.dueDate === todayStr || isOverdue(t.dueDate)))
  const dueTodayCount = tasks.filter(t => !t.done && t.dueDate === todayStr).length
  const overdueCount = tasks.filter(t => !t.done && isOverdue(t.dueDate)).length

  const activeProjects = projects.filter(p => {
    const pt = tasks.filter(t => t.projectId === p.id)
    return pt.length === 0 || !pt.every(t => t.done)
  })

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Good {getGreeting()}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dateLabel}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard value={dueTodayCount} label="Due today" />
        <StatCard value={overdueCount} label="Overdue" urgent={overdueCount > 0} />
        <StatCard value={notes.length} label="Notes" />
      </div>

      <Section title="Today & overdue" action={{ label: 'See all', onClick: () => navigate('tasks') }}>
        {urgentTasks.length === 0 ? (
          <Empty>All clear — nothing overdue or due today.</Empty>
        ) : (
          <div className="space-y-1.5">
            {urgentTasks.map(task => (
              <DashTaskRow key={task.id} task={task} onToggle={() => ops.toggleTask(task.id)} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Active projects" action={{ label: 'See all', onClick: () => navigate('projects') }}>
        {activeProjects.length === 0 ? (
          <Empty>
            No active projects.{' '}
            <button onClick={() => navigate('projects')} className="underline text-gray-700 dark:text-gray-300">Create one →</button>
          </Empty>
        ) : (
          <div className="space-y-1.5">
            {activeProjects.map(project => {
              const { done, total, pct } = projectProgress(project, tasks)
              return (
                <button
                  key={project.id}
                  onClick={() => navigate('projects', project.id)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{done}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-800 dark:bg-white rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}

function StatCard({ value, label, urgent }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className={`text-2xl font-bold ${urgent ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{value}</div>
      <div className={`text-xs mt-1 ${urgent ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{label}</div>
    </div>
  )
}

function Section({ title, action, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
        {action && (
          <button onClick={action.onClick} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            {action.label} →
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function Empty({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center text-sm text-gray-400 dark:text-gray-500">
      {children}
    </div>
  )
}

function DashTaskRow({ task, onToggle }) {
  const overdue = isOverdue(task.dueDate)
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex items-center gap-3">
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.done ? 'bg-gray-900 border-gray-900 dark:bg-white dark:border-white' : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400'
        }`}
      >
        {task.done && <Check size={11} className="text-white dark:text-gray-900" />}
      </button>
      <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`}>
        {task.title}
      </span>
      {task.dueDate && (
        <span className={`text-xs flex-shrink-0 ${overdue && !task.done ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
          {formatDate(task.dueDate)}
        </span>
      )}
      {task.priority && PRIORITY_CLS[task.priority] && (
        <span className={`text-xs px-1.5 py-0.5 rounded border flex-shrink-0 ${PRIORITY_CLS[task.priority]}`}>
          {task.priority}
        </span>
      )}
    </div>
  )
}
