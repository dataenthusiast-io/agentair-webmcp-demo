import { Check } from 'lucide-react'
import { useStore } from '../lib/store'
import { pushDataLayerEvent } from '../lib/analytics'
import type { Flight, FlightClass } from '../lib/flights'

function ClassRow({ flight, cls }: { flight: Flight; cls: FlightClass }) {
  const addToBooking = useStore((s) => s.addToBooking)
  const isInBooking = useStore((s) =>
    s.items.some((i) => i.flightClass.id === cls.id),
  )

  const handleAdd = () => {
    addToBooking(flight.id, cls.id, 1)
    pushDataLayerEvent('add_to_cart', {
      ecommerce: {
        currency: 'USD',
        value: cls.price,
        items: [
          {
            item_id: cls.id,
            item_name: `${flight.fromCode} → ${flight.toCode} · ${cls.name}`,
            price: cls.price,
            quantity: 1,
            item_category: cls.name,
          },
        ],
      },
      interaction_source: 'ui',
    })
  }

  return (
    <div className="flex items-center gap-4 py-4 border-t border-neutral-100 first:border-0">
      {/* Class + meta */}
      <div className="w-24 shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          {cls.name}
        </div>
        {cls.refundable ? (
          <div className="text-[10px] text-neutral-400 mt-0.5">Refundable</div>
        ) : (
          <div className="text-[10px] text-neutral-300 mt-0.5">Non-refund.</div>
        )}
      </div>

      {/* Price */}
      <div className="w-20 shrink-0">
        <div className="text-base font-bold text-neutral-900 tabular-nums">
          ${cls.price.toLocaleString()}
        </div>
        <div className="text-[10px] text-neutral-400">/ person</div>
      </div>

      {/* Features */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 leading-relaxed truncate">
          {cls.features.join(' · ')}
        </p>
        <p className="text-[10px] text-neutral-400 mt-0.5">
          Baggage: {cls.baggage}
        </p>
      </div>

      {/* Seats */}
      <div className="hidden sm:block w-16 shrink-0 text-right">
        <div className="text-[10px] text-neutral-400">
          {cls.seatsLeft} seats
        </div>
      </div>

      {/* Action */}
      <div className="shrink-0">
        {isInBooking ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 bg-neutral-100 rounded">
            <Check size={12} />
            Added
          </span>
        ) : (
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-700 text-white text-xs font-medium rounded transition-colors"
          >
            Select
          </button>
        )}
      </div>
    </div>
  )
}

export default function FlightCard({ flight }: { flight: Flight }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Route header */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-neutral-100">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-neutral-900 tracking-tight">
              {flight.fromCode}
            </span>
            <span className="text-neutral-300 text-sm">—</span>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">
              {flight.toCode}
            </span>
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">
            {flight.from} to {flight.to}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-neutral-900 tabular-nums">
            {flight.departure} — {flight.arrival}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">
            {flight.duration} · {flight.aircraft} · {flight.id}
          </div>
        </div>
      </div>

      {/* Class rows */}
      <div className="px-5">
        {flight.classes.map((cls) => (
          <ClassRow key={cls.id} flight={flight} cls={cls} />
        ))}
      </div>
    </div>
  )
}
