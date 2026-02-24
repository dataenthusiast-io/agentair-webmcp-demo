import { X, ShoppingBag, CreditCard, Trash2, Bot } from 'lucide-react'
import { useStore } from '../lib/store'
import { pushDataLayerEvent } from '../lib/analytics'
import { useEffect, useRef } from 'react'

const classColor: Record<string, string> = {
  Economy: 'bg-slate-100 text-slate-600',
  Business: 'bg-amber-100 text-amber-700',
  First: 'bg-violet-100 text-violet-700',
}

function AgentAddedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
      <Bot size={8} />
      agent
    </span>
  )
}

export default function BookingSidebar() {
  const items = useStore((s) => s.items)
  const removeFromBooking = useStore((s) => s.removeFromBooking)
  const clearBooking = useStore((s) => s.clearBooking)
  const total = useStore((s) => s.getTotal())

  const prevCountRef = useRef(items.length)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Flash highlight when a new item is added by agent
  useEffect(() => {
    if (items.length > prevCountRef.current) {
      const lastItem = items[items.length - 1]
      if (lastItem?.addedByAgent && sidebarRef.current) {
        sidebarRef.current.classList.add('ring-2', 'ring-emerald-400', 'ring-offset-2')
        setTimeout(() => {
          sidebarRef.current?.classList.remove('ring-2', 'ring-emerald-400', 'ring-offset-2')
        }, 2000)
      }
    }
    prevCountRef.current = items.length
  }, [items])

  const handleRemove = (classId: string) => {
    removeFromBooking(classId)
    pushDataLayerEvent('remove_from_cart', {
      ecommerce: { currency: 'USD' },
      interaction_source: 'ui',
    })
  }

  const handleCheckout = () => {
    pushDataLayerEvent('begin_checkout', {
      ecommerce: {
        currency: 'USD',
        value: total,
        items: items.map((i) => ({
          item_id: i.flightClass.id,
          item_name: `${i.flight.fromCode} → ${i.flight.toCode} · ${i.flightClass.name}`,
          price: i.flightClass.price,
          quantity: i.passengers,
        })),
      },
      interaction_source: 'ui',
    })
    alert(
      `Booking confirmed! Total: $${total.toLocaleString()}\n\nThank you for flying AgentAir ✈`,
    )
    clearBooking()
  }

  return (
    <div
      ref={sidebarRef}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24 transition-all duration-500"
    >
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-blue-500" />
          <span className="font-semibold text-slate-900 text-sm">
            Your Booking
          </span>
          {items.some((i) => i.addedByAgent) && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5 flex items-center gap-1">
              <Bot size={8} /> AI-assisted
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={clearBooking}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Clear booking"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag size={20} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No flights selected yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Search and select a class below
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li
                key={item.flightClass.id}
                className={`px-5 py-4 transition-colors ${item.addedByAgent ? 'bg-emerald-50/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">
                        {item.flight.fromCode} → {item.flight.toCode}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${classColor[item.flightClass.name] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        {item.flightClass.name}
                      </span>
                      {item.addedByAgent && <AgentAddedBadge />}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.flight.departure} → {item.flight.arrival} ·{' '}
                      {item.passengers} pax
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">
                      ${(item.flightClass.price * item.passengers).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.flightClass.id)}
                    className="shrink-0 p-1 text-slate-300 hover:text-red-400 transition-colors rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-600">Total</span>
              <span className="text-xl font-bold text-slate-900">
                ${total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={15} />
              Complete Booking
            </button>
          </div>
        </>
      )}
    </div>
  )
}
