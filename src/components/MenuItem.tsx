import { Plus } from 'lucide-react'
import type { MenuItem as MenuItemType } from '../lib/menu'
import { useStore } from '../lib/store'

export default function MenuItem({ item }: { item: MenuItemType }) {
  const addToCart = useStore((s) => s.addToCart)

  return (
    <div className="bg-amber-100 border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-100">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-bold text-black uppercase leading-relaxed">
          {item.name}
        </h3>
        <span className="text-xs font-bold text-red-700 ml-2 whitespace-nowrap">
          ${item.price.toFixed(2)}
        </span>
      </div>
      <p className="text-[10px] text-gray-700 mb-4 leading-relaxed">
        {item.description}
      </p>
      <button
        onClick={() => addToCart(item)}
        className="pixel-bounce flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-400 text-black text-[10px] font-bold border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-75 cursor-pointer uppercase"
      >
        <Plus size={14} strokeWidth={3} />
        Add
      </button>
    </div>
  )
}
