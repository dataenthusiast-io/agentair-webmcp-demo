import { Plane, Check, Clock, Info, Bot } from 'lucide-react'
import { useStore } from '../lib/store'
import { pushDataLayerEvent } from '../lib/analytics'
import type { Flight, FlightClass } from '../lib/flights'

const classBadge: Record<FlightClass['name'], string> = {
  Economy: 'bg-slate-100 text-slate-700 border-slate-200',
  Business: 'bg-amber-50 text-amber-700 border-amber-200',
  First: 'bg-violet-50 text-violet-700 border-violet-200',
}

const classHeader: Record<FlightClass['name'], string> = {
  Economy: 'bg-slate-50 border-slate-200',
  Business: 'bg-amber-50 border-amber-200',
  First: 'bg-violet-50 border-violet-200',
}

const classButton: Record<FlightClass['name'], string> = {
  Economy: 'bg-slate-900 hover:bg-slate-700 text-white',
  Business: 'bg-amber-500 hover:bg-amber-400 text-white',
  First: 'bg-violet-600 hover:bg-violet-500 text-white',
}

function ClassCard({ flight, cls }: { flight: Flight; cls: FlightClass }) {
  const addToBooking = useStore((s) => s.addToBooking)
  const bookingItem = useStore((s) =>
    s.items.find((i) => i.flightClass.id === cls.id)
  )
  const isInBooking = !!bookingItem
  const isAgentAdded = bookingItem?.addedByAgent ?? false

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
    <div
      className={`rounded-xl border flex flex-col overflow-hidden transition-all hover:shadow-md ${classHeader[cls.name]} ${isAgentAdded ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}
    >
      <div className="p-4 border-b border-inherit">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span
              className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${classBadge[cls.name]}`}
            >
              {cls.name}
            </span>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              ${cls.price.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">per person</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">{cls.seatsLeft} seats left</div>
            {cls.refundable && (
              <div className="mt-1 text-xs text-emerald-600 font-medium">Refundable</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        <ul className="space-y-1.5">
          {cls.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
              <Check size={12} className="shrink-0 text-emerald-500" />
              {f}
            </li>
          ))}
        </ul>

        <div className="text-xs text-slate-500 flex items-start gap-1.5">
          <Info size={11} className="shrink-0 mt-0.5" />
          <span>Baggage: {cls.baggage}</span>
        </div>

        <button
          onClick={handleAdd}
          disabled={isInBooking}
          className={`mt-auto w-full py-2 rounded-lg text-sm font-semibold transition-all ${
            isInBooking
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : classButton[cls.name]
          }`}
        >
          {isInBooking ? (
            <span className="flex items-center justify-center gap-1.5">
              {isAgentAdded ? (
                <>
                  <Bot size={13} /> Added by agent
                </>
              ) : (
                <>
                  <Check size={14} /> Added
                </>
              )}
            </span>
          ) : (
            'Select'
          )}
        </button>
      </div>
    </div>
  )
}

export default function FlightCard({ flight }: { flight: Flight }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Route header */}
      <div className="px-6 py-5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center min-w-[80px]">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {flight.fromCode}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{flight.from}</div>
            <div className="text-base font-semibold text-slate-700 mt-2">
              {flight.departure}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1 px-2">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} />
              {flight.duration}
            </div>
            <div className="w-full flex items-center gap-1">
              <div className="w-2 h-2 rounded-full border-2 border-blue-500 bg-white shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-slate-200" />
              <Plane size={18} className="text-blue-500 shrink-0 -rotate-0" />
              <div className="flex-1 border-t-2 border-dashed border-slate-200" />
              <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
            </div>
            <div className="text-[10px] text-slate-400">{flight.aircraft}</div>
          </div>

          <div className="text-center min-w-[80px]">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {flight.toCode}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{flight.to}</div>
            <div className="text-base font-semibold text-slate-700 mt-2">
              {flight.arrival}
            </div>
          </div>
        </div>
      </div>

      {/* Classes */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {flight.classes.map((cls) => (
          <ClassCard key={cls.id} flight={flight} cls={cls} />
        ))}
      </div>
    </div>
  )
}
