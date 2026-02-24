import { X, ShoppingBag, CreditCard, Trash2, LayoutGrid } from 'lucide-react'
import { useStore } from '../lib/store'
import { pushDataLayerEvent } from '../lib/analytics'

export default function BookingSidebar() {
  const items = useStore((s) => s.items)
  const removeFromBooking = useStore((s) => s.removeFromBooking)
  const clearBooking = useStore((s) => s.clearBooking)
  const total = useStore((s) => s.getTotal())

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
      `Booking confirmed!\nTotal: $${total.toLocaleString()}\n\nThank you for flying AgentAir.`,
    )
    clearBooking()
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden sticky top-20">
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag size={14} className="text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-900">Booking</span>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearBooking}
            className="text-neutral-300 hover:text-neutral-600 transition-colors"
            title="Clear booking"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <ShoppingBag size={24} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">No flights selected</p>
          <p className="text-xs text-neutral-300 mt-1">Search and pick a fare class</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-neutral-100">
            {items.map((item) => (
              <li key={item.flightClass.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-neutral-900">
                        {item.flight.fromCode} — {item.flight.toCode}
                      </span>
                      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">
                        {item.flightClass.name}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5 tabular-nums">
                      {item.flight.departure} — {item.flight.arrival} · {item.passengers} pax
                    </div>
                    {item.seat ? (
                      <div className="flex items-center gap-1 mt-1">
                        <LayoutGrid size={10} className="text-neutral-400" />
                        <span className="text-xs text-neutral-500 tabular-nums">
                          Seat {item.seat.label} · {item.seat.type}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-300 mt-1 italic">No seat selected</div>
                    )}
                    <div className="text-sm font-semibold text-neutral-900 mt-1 tabular-nums">
                      ${(item.flightClass.price * item.passengers).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.flightClass.id)}
                    className="shrink-0 p-1 text-neutral-300 hover:text-neutral-600 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 py-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Total</span>
              <span className="text-lg font-bold text-neutral-900 tabular-nums">
                ${total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-semibold transition-colors rounded-lg flex items-center justify-center gap-2"
            >
              <CreditCard size={14} />
              Complete Booking
            </button>
            <p className="text-center text-[10px] text-neutral-400 mt-2.5">
              Free cancellation on refundable fares
            </p>
          </div>
        </>
      )}
    </div>
  )
}
