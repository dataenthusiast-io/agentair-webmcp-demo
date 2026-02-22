import { Plus } from 'lucide-react'
import type { MenuItem as MenuItemType } from '../lib/menu'
import { addToCart } from '../lib/cart'

export default function MenuItem({ item }: { item: MenuItemType }) {
  return (
    <div className="bg-green-900/50 border border-green-700 rounded-xl p-5 hover:border-green-500 transition-all duration-200 hover:shadow-md hover:shadow-green-900/30">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-green-100">{item.name}</h3>
        <span className="text-lg font-bold text-green-400">
          ${item.price.toFixed(2)}
        </span>
      </div>
      <p className="text-green-300 text-sm mb-4">{item.description}</p>
      <button
        onClick={() => addToCart(item)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors text-sm cursor-pointer"
      >
        <Plus size={16} />
        Add to Cart
      </button>
    </div>
  )
}
