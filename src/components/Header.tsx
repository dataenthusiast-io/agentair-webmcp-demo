import { Link } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import { UtensilsCrossed, ShoppingCart } from 'lucide-react'
import { subscribe, getSnapshot, getItemCount } from '../lib/cart'

export default function Header() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const count = getItemCount()

  return (
    <header className="p-4 flex items-center justify-between bg-green-900 text-white shadow-lg">
      <Link to="/" className="flex items-center gap-3">
        <UtensilsCrossed size={28} />
        <h1 className="text-xl font-bold tracking-tight">
          Philly's Finest
        </h1>
      </Link>

      <div className="relative">
        <ShoppingCart size={24} />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {count}
          </span>
        )}
      </div>
    </header>
  )
}
