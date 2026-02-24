import { useEffect, useState } from 'react'

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
    <div className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800 px-5 py-2 flex items-center gap-2.5 z-50">
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          status === 'ready'
            ? 'bg-emerald-500'
            : status === 'error'
              ? 'bg-red-500'
              : 'bg-neutral-600 animate-pulse'
        }`}
      />
      <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-widest">
        WebMCP
      </span>
      <span className="text-neutral-800 text-xs">·</span>
      {status === 'loading' && (
        <span className="text-[11px] text-neutral-600">Registering agent tools…</span>
      )}
      {status === 'ready' && (
        <span className="text-[11px] text-neutral-500">
          {toolCount} tools active — AI agents can search and book natively
        </span>
      )}
      {status === 'error' && (
        <span className="text-[11px] text-red-700" title={errorMsg}>
          Tool registration failed
        </span>
      )}
    </div>
  )
}
