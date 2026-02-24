import { useEffect, useState } from 'react'
import { Bot } from 'lucide-react'

export default function WebMCPStatus() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [toolCount, setToolCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    import('@mcp-b/global')
      .then(() => import('../lib/webmcp'))
      .then(({ registerWebMCPTools }) => registerWebMCPTools())
      .then((count) => {
        setToolCount(count)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMsg(String(err))
        setStatus('error')
      })
  }, [])

  return (
    <div className="fixed bottom-0 inset-x-0 bg-slate-950 text-slate-400 px-4 py-2 flex items-center gap-3 text-[11px] z-50 border-t border-slate-800">
      <Bot size={13} className={status === 'ready' ? 'text-emerald-400' : status === 'error' ? 'text-red-400' : 'text-slate-500'} />
      <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">WebMCP</span>
      <span className="text-slate-700">·</span>
      {status === 'loading' && (
        <span className="text-slate-500">
          Registering agent tools<span className="animate-pulse">…</span>
        </span>
      )}
      {status === 'ready' && (
        <span className="text-emerald-400">
          {toolCount} tools active — AI agents can now book flights natively
        </span>
      )}
      {status === 'error' && (
        <span className="text-red-400" title={errorMsg}>
          Tool registration failed
        </span>
      )}
    </div>
  )
}
