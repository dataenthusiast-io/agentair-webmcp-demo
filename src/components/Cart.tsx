import { useSyncExternalStore } from 'react'
import { Trash2, ShoppingCart, X } from 'lucide-react'
import {
  subscribe,
  getSnapshot,
  removeFromCart,
  clearCart,
  getTotal,
  getItemCount,
} from '../lib/cart'

export default function Cart() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const total = getTotal()
  const count = getItemCount()

  return (
    <div className="bg-green-900/50 border border-green-700 rounded-xl p-5 sticky top-4">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart size={20} className="text-green-400" />
        <h2 className="text-xl font-bold text-green-100">
          Cart {count > 0 && `(${count})`}
        </h2>
      </div>

      {state.items.length === 0 ? (
        <p className="text-green-400 text-sm">Your cart is empty</p>
      ) : (
        <>
          <ul className="divide-y divide-green-800 mb-4">
            {state.items.map((item) => (
              <li
                key={item.menuItem.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-100 truncate">
                    {item.menuItem.name}
                  </p>
                  <p className="text-xs text-green-400">
                    {item.quantity} x ${item.menuItem.price.toFixed(2)} = $
                    {(item.quantity * item.menuItem.price).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.menuItem.id)}
                  className="ml-2 p-1 text-green-500 hover:text-red-400 transition-colors cursor-pointer"
                  aria-label={`Remove ${item.menuItem.name}`}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-green-700 pt-3 mb-3">
            <div className="flex justify-between font-bold text-green-100">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={clearCart}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-300 font-medium rounded-lg transition-colors text-sm cursor-pointer"
          >
            <Trash2 size={14} />
            Clear Cart
          </button>
        </>
      )}
    </div>
  )
}
