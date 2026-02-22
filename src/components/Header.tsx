import { Link } from '@tanstack/react-router'
import { UtensilsCrossed, ShoppingCart } from 'lucide-react'
import { useStore } from '../lib/store'

export default function Header() {
  const count = useStore((s) => s.getItemCount())

  return (
    <header className="p-4 flex items-center justify-between bg-yellow-400 text-black border-b-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <Link to="/" className="flex items-center gap-3">
        <UtensilsCrossed size={28} className="text-red-600" />
        <h1 className="text-sm font-bold tracking-tight uppercase">
          Philly's Finest
        </h1>
      </Link>

      <div className="relative">
        <ShoppingCart size={24} />
        {count > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[8px] font-bold w-5 h-5 flex items-center justify-center border-2 border-black">
            {count}
          </span>
        )}
      </div>
    </header>
  )
}
