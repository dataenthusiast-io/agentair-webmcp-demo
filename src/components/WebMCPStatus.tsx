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
    <div className="fixed bottom-0 inset-x-0 bg-black text-green-400 px-4 py-2 flex items-center gap-3 text-[10px] z-50 border-t-4 border-green-500">
      <Cpu size={14} className="text-green-400" />
      <span className="font-bold uppercase">WebMCP</span>
      {status === 'loading' && (
        <span className="text-green-600">
          Loading tools<span className="pixel-blink">_</span>
        </span>
      )}
      {status === 'ready' && (
        <span className="text-green-400">
          &gt; {toolCount} tools registered [OK]
        </span>
      )}
      {status === 'error' && (
        <span className="text-red-500" title={errorMsg}>
          &gt; ERR: registration failed
        </span>
      )}
    </div>
  )
}
