import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useStore, type AgentActivity } from '../lib/store'

const toolLabel: Record<AgentActivity['tool'], string> = {
  search_flights: 'search_flights',
  add_to_booking: 'add_to_booking',
  get_booking: 'get_booking',
  select_seat: 'select_seat',
  checkout: 'checkout',
  grant_analytics_consent: 'grant_analytics_consent',
}

function Toast({
  activity,
  onDismiss,
}: {
  activity: AgentActivity
  onDismiss: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleDismiss = () => {
    setLeaving(true)
    setTimeout(onDismiss, 250)
  }

  return (
    <div
      className={`
        relative w-72 bg-white border border-neutral-200 rounded-lg overflow-hidden
        shadow-lg shadow-neutral-200/60 transition-all duration-250 ease-out
        ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
      `}
    >
      <div className="px-3.5 pt-3 pb-2.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0" />
            <span className="text-[10px] font-mono font-medium text-neutral-900 tracking-wide">
              {toolLabel[activity.tool]}
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X size={11} />
          </button>
        </div>
        <p className="text-xs text-neutral-600 leading-snug pl-3">{activity.message}</p>
        {activity.detail && (
          <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug pl-3">{activity.detail}</p>
        )}
      </div>
      <ProgressBar />
    </div>
  )
}

function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.width = '100%'
    requestAnimationFrame(() => {
      el.style.transition = 'width 6s linear'
      el.style.width = '0%'
    })
  }, [])

  return (
    <div className="h-[2px] bg-neutral-100">
      <div ref={ref} className="h-full bg-neutral-400" style={{ width: '100%' }} />
    </div>
  )
}

export default function AgentActivityFeed() {
  const activities = useStore((s) => s.agentActivities)
  const dismiss = useStore((s) => s.dismissAgentActivity)

  if (activities.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {activities.slice(0, 5).map((a) => (
        <div key={a.id} className="pointer-events-auto">
          <Toast activity={a} onDismiss={() => dismiss(a.id)} />
        </div>
      ))}
    </div>
  )
}
