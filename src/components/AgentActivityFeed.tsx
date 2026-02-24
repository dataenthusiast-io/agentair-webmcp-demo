import { useStore, type AgentActivity } from '../lib/store'
import { Bot, Search, ShoppingBag, ClipboardList, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const toolMeta: Record<
  AgentActivity['tool'],
  { label: string; Icon: React.ElementType; color: string; bg: string; border: string }
> = {
  search_flights: {
    label: 'search_flights',
    Icon: Search,
    color: 'text-sky-400',
    bg: 'bg-sky-950',
    border: 'border-sky-700',
  },
  add_to_booking: {
    label: 'add_to_booking',
    Icon: ShoppingBag,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950',
    border: 'border-emerald-700',
  },
  get_booking: {
    label: 'get_booking',
    Icon: ClipboardList,
    color: 'text-violet-400',
    bg: 'bg-violet-950',
    border: 'border-violet-700',
  },
}

function Toast({ activity, onDismiss }: { activity: AgentActivity; onDismiss: () => void }) {
  const meta = toolMeta[activity.tool]
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Mount → slide in
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleDismiss = () => {
    setLeaving(true)
    setTimeout(onDismiss, 300)
  }

  return (
    <div
      className={`
        relative flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl shadow-black/50
        transition-all duration-300 ease-out w-80
        ${meta.bg} ${meta.border}
        ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full ${meta.color.replace('text-', 'bg-')}`} />

      {/* Bot badge */}
      <div className="shrink-0 flex flex-col items-center gap-1 pl-1">
        <div className="flex items-center gap-1">
          <Bot size={12} className="text-slate-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Agent</span>
        </div>
        <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800`}>
          <meta.Icon size={13} className={meta.color} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`text-[10px] font-mono font-semibold ${meta.color} mb-0.5`}>
          {meta.label}
        </div>
        <div className="text-xs font-medium text-slate-200 leading-tight">
          {activity.message}
        </div>
        {activity.detail && (
          <div className="text-[11px] text-slate-400 mt-1 leading-tight">{activity.detail}</div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="shrink-0 p-0.5 text-slate-600 hover:text-slate-400 transition-colors"
      >
        <X size={12} />
      </button>

      {/* Progress bar */}
      <ProgressBar color={meta.color} />
    </div>
  )
}

function ProgressBar({ color }: { color: string }) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.width = '100%'
    requestAnimationFrame(() => {
      el.style.transition = 'width 6s linear'
      el.style.width = '0%'
    })
  }, [])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden bg-slate-800">
      <div
        ref={barRef}
        className={`h-full rounded-b-xl ${color.replace('text-', 'bg-')}`}
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default function AgentActivityFeed() {
  const activities = useStore((s) => s.agentActivities)
  const dismiss = useStore((s) => s.dismissAgentActivity)

  if (activities.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {activities.slice(0, 4).map((activity) => (
        <div key={activity.id} className="pointer-events-auto">
          <Toast activity={activity} onDismiss={() => dismiss(activity.id)} />
        </div>
      ))}
    </div>
  )
}
