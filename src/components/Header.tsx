import { Plane, ShoppingBag } from 'lucide-react'
import { useStore } from '../lib/store'

export default function Header() {
  const itemCount = useStore((s) => s.getItemCount())

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-neutral-950 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <Plane size={15} className="text-white -rotate-45" />
          <span className="text-white font-semibold text-sm tracking-tight">
            Air Agentic
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {['Flights', 'My Trips', 'Help'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors tracking-wide"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="relative p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors">
            <ShoppingBag size={16} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white text-neutral-900 text-[9px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <button className="hidden md:block px-3 py-1.5 bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-semibold transition-colors rounded">
            Sign in
          </button>
        </div>
      </div>
    </header>
  )
}
