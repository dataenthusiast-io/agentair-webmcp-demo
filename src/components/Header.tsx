import { Plane, ShoppingBag } from 'lucide-react'
import { useStore } from '../lib/store'

export default function Header() {
  const itemCount = useStore((s) => s.getItemCount())

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center group-hover:bg-blue-400 transition-colors">
            <Plane size={16} className="text-white -rotate-45" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Agent<span className="text-blue-400">Air</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Flights</a>
          <a href="#" className="hover:text-white transition-colors">My Trips</a>
          <a href="#" className="hover:text-white transition-colors">Help</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <button className="hidden md:block px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            Sign in
          </button>
        </div>
      </div>
    </header>
  )
}
