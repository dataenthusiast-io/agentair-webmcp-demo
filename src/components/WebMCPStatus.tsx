import { useEffect, useState } from 'react'
import { Cpu } from 'lucide-react'

export default function WebMCPStatus() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
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
    <div className="fixed bottom-0 inset-x-0 bg-slate-900 text-white px-4 py-2 flex items-center gap-3 text-sm z-50">
      <Cpu size={16} className="text-amber-400" />
      <span className="font-medium">WebMCP</span>
      {status === 'loading' && (
        <span className="text-slate-400">Registering tools...</span>
      )}
      {status === 'ready' && (
        <span className="text-emerald-400">
          {toolCount} tools registered
        </span>
      )}
      {status === 'error' && (
        <span className="text-red-400" title={errorMsg}>
          Error registering tools
        </span>
      )}
    </div>
  )
}
