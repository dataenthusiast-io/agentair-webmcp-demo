import { Trash2, ShoppingCart, X } from 'lucide-react'
import { useStore } from '../lib/store'

export default function Cart() {
  const items = useStore((s) => s.items)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const clearCart = useStore((s) => s.clearCart)
  const total = useStore((s) => s.getTotal())
  const count = useStore((s) => s.getItemCount())

  return (
    <div className="bg-amber-100 border-4 border-black p-4 sticky top-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart size={18} className="text-black" />
        <h2 className="text-xs font-bold text-black uppercase">
          Cart {count > 0 && `(${count})`}
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="text-[10px] text-gray-600">* Empty *</p>
      ) : (
        <>
          <ul className="divide-y-2 divide-black mb-4">
            {items.map((item) => (
              <li
                key={item.menuItem.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-black truncate uppercase">
                    {item.menuItem.name}
                  </p>
                  <p className="text-[9px] text-gray-700 mt-1">
                    {item.quantity} x ${item.menuItem.price.toFixed(2)} = $
                    {(item.quantity * item.menuItem.price).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.menuItem.id)}
                  className="ml-2 p-1 text-red-700 hover:text-red-500 cursor-pointer"
                  aria-label={`Remove ${item.menuItem.name}`}
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t-4 border-black pt-3 mb-3">
            <div className="flex justify-between font-bold text-xs text-black uppercase">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={clearCart}
            className="pixel-bounce flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-75 cursor-pointer uppercase"
          >
            <Trash2 size={12} strokeWidth={3} />
            Clear Cart
          </button>
        </>
      )}
    </div>
  )
}
