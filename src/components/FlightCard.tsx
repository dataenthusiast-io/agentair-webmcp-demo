import { Check, ChevronRight, LayoutGrid } from 'lucide-react'
import { useStore } from '../lib/store'
import type { Flight, FlightClass } from '../lib/flights'
import SeatMap from './SeatMap'
import { pushEcommerceEvent, buildRouteParams, buildFlightItemParams } from '../lib/analytics'

function ClassRow({ flight, cls }: { flight: Flight; cls: FlightClass }) {
  const bookingItem = useStore((s) => s.items.find((i) => i.flightClass.id === cls.id))
  const activeSeatMap = useStore((s) => s.activeSeatMap)
  const setSeatMapOpen = useStore((s) => s.setSeatMapOpen)
  const isInBooking = !!bookingItem
  const hasSeat = !!bookingItem?.seat
  const isSeatMapOpen = activeSeatMap === cls.id

  const handleSelect = () => {
    const opening = !isSeatMapOpen
    setSeatMapOpen(opening ? cls.id : null)
    if (opening && !isInBooking) {
      pushEcommerceEvent(
        'select_item',
        {
          item_list_id: 'flight_results',
          item_list_name: 'Flight Results',
          items: [
            {
              item_id: cls.id,
              item_name: `${flight.fromCode} → ${flight.toCode} · ${cls.name}`,
              item_brand: 'Air Agentic',
              item_category: cls.name,
              price: cls.price,
              quantity: 1,
              ...buildFlightItemParams({
                flightId: flight.id,
                departure: flight.departure,
                arrival: flight.arrival,
                passengers: 1,
                className: cls.name,
              }),
            },
          ],
        },
        {
          interaction_source: 'human',
          ...buildRouteParams(flight.fromCode, flight.toCode),
        }
      )
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 py-3.5 border-t border-neutral-100 first:border-0">
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

        {/* Seats available */}
        <div className="hidden sm:block w-16 shrink-0 text-right">
          <div className="text-[10px] text-neutral-400">{cls.seatsLeft} seats</div>
        </div>

        {/* Action */}
        <div className="shrink-0 flex items-center gap-2">
          {isInBooking && hasSeat ? (
            /* Booked with seat */
            <button
              onClick={handleSelect}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
              title="Change seat"
            >
              <Check size={12} className="text-emerald-600" />
              {bookingItem.seat!.label}
              <LayoutGrid size={11} className="text-neutral-400 ml-0.5" />
            </button>
          ) : isInBooking && !hasSeat ? (
            /* Booked without seat yet */
            <button
              onClick={handleSelect}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-700 rounded transition-colors"
            >
              <LayoutGrid size={11} />
              Select seat
            </button>
          ) : (
            /* Not booked */
            <button
              onClick={handleSelect}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                isSeatMapOpen
                  ? 'text-neutral-900 bg-neutral-200'
                  : 'text-white bg-neutral-900 hover:bg-neutral-700'
              }`}
            >
              Select
              <ChevronRight size={12} className={`transition-transform ${isSeatMapOpen ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Seat map — inline expansion */}
      {isSeatMapOpen && (
        <SeatMap
          flightId={flight.id}
          classId={cls.id}
          className={cls.name}
          preSelected={bookingItem?.seat}
          onClose={() => setSeatMapOpen(null)}
        />
      )}
    </>
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
