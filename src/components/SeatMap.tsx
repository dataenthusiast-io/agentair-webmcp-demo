import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { getSeatLayout, SEAT_LAYOUTS } from '../lib/seats'
import type { SeatInfo, SelectedSeat } from '../lib/seats'
import type { FlightClass } from '../lib/flights'
import { useStore } from '../lib/store'
import { pushDataLayerEvent, pushEcommerceEvent } from '../lib/analytics'

interface Props {
  flightId: string
  classId: string
  className: FlightClass['name']
  preSelected?: SelectedSeat
  onClose: () => void
}

const typeLabel: Record<SelectedSeat['type'], string> = {
  window: 'Window',
  aisle: 'Aisle',
  middle: 'Middle',
}

export default function SeatMap({ flightId, classId, className, preSelected, onClose }: Props) {
  const { rows, layout } = getSeatLayout(className)
  const addToBooking = useStore((s) => s.addToBooking)
  const selectSeat = useStore((s) => s.selectSeat)
  const isInBooking = useStore((s) => s.items.some((i) => i.flightClass.id === classId))
  const flightClass = useStore((s) =>
    s.flights.find((f) => f.id === flightId)?.classes.find((c) => c.id === classId)
  )

  const [picked, setPicked] = useState<SeatInfo | null>(
    preSelected
      ? (rows.flat().find((s) => s.label === preSelected.label) ?? null)
      : null,
  )

  const handleSeatClick = (seat: SeatInfo) => {
    if (seat.occupied) return
    setPicked(seat)
    pushDataLayerEvent('seat_selected', {
      seat_label: seat.label,
      seat_type: seat.type,
      class_id: classId,
      interaction_source: 'human',
    })
  }

  const handleConfirm = () => {
    if (!picked) return
    const seat: SelectedSeat = {
      label: picked.label,
      row: picked.row,
      col: picked.col,
      type: picked.type,
    }
    if (isInBooking) {
      selectSeat(classId, seat)
    } else {
      addToBooking(flightId, classId, 1, false, seat)
    }
    pushEcommerceEvent(
      'add_to_cart',
      {
        currency: 'USD',
        value: flightClass ? flightClass.price : 0,
        items: [
          {
            item_id: classId,
            item_name: `${flightId} · ${className}`,
            item_brand: 'Air Agentic',
            item_category: className,
            price: flightClass?.price ?? 0,
            quantity: 1,
            item_variant: seat.label,
          },
        ],
      },
      { interaction_source: 'human' }
    )
    onClose()
  }

  const leftCols = layout.cols.slice(0, layout.cols.indexOf(layout.aisleAfter) + 1)
  const rightCols = layout.cols.slice(layout.cols.indexOf(layout.aisleAfter) + 1)

  return (
    <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Seat Selection — {className}
          </h3>
          {picked && (
            <p className="text-sm font-semibold text-neutral-900 mt-0.5">
              Seat {picked.label} · {typeLabel[picked.type]}
            </p>
          )}
        </div>
        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Column labels */}
      <div className="flex items-center mb-1.5">
        <div className="w-7" /> {/* row number spacer */}
        <div className="flex gap-1">
          {leftCols.map((col) => (
            <div key={col} className="w-7 text-center text-[10px] font-semibold text-neutral-400">
              {col}
            </div>
          ))}
        </div>
        <div className="w-5" /> {/* aisle */}
        <div className="flex gap-1">
          {rightCols.map((col) => (
            <div key={col} className="w-7 text-center text-[10px] font-semibold text-neutral-400">
              {col}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {rows.map((row) => {
          const leftSeats = row.slice(0, leftCols.length)
          const rightSeats = row.slice(leftCols.length)
          const rowNum = row[0].row
          return (
            <div key={rowNum} className="flex items-center">
              <div className="w-7 text-[10px] text-neutral-400 font-mono text-right pr-1.5">
                {rowNum}
              </div>
              <div className="flex gap-1">
                {leftSeats.map((seat) => (
                  <SeatButton
                    key={seat.label}
                    seat={seat}
                    isPicked={picked?.label === seat.label}
                    onClick={handleSeatClick}
                  />
                ))}
              </div>
              <div className="w-5" />
              <div className="flex gap-1">
                {rightSeats.map((seat) => (
                  <SeatButton
                    key={seat.label}
                    seat={seat}
                    isPicked={picked?.label === seat.label}
                    onClick={handleSeatClick}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend + action */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-[10px] text-neutral-400">
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-sm border border-neutral-300 bg-white inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-sm bg-neutral-200 inline-block" />
            Taken
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-sm bg-neutral-900 inline-block" />
            Selected
          </span>
        </div>
        <button
          onClick={handleConfirm}
          disabled={!picked}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            picked
              ? 'bg-neutral-900 hover:bg-neutral-700 text-white'
              : 'bg-neutral-100 text-neutral-400 cursor-default'
          }`}
        >
          <Check size={13} />
          {isInBooking ? 'Update Seat' : 'Add to Booking'}
        </button>
      </div>
    </div>
  )
}

function SeatButton({
  seat,
  isPicked,
  onClick,
}: {
  seat: SeatInfo
  isPicked: boolean
  onClick: (seat: SeatInfo) => void
}) {
  if (seat.occupied) {
    return (
      <div
        className="w-7 h-7 rounded-sm bg-neutral-200 cursor-not-allowed"
        title="Occupied"
      />
    )
  }
  if (isPicked) {
    return (
      <button
        onClick={() => onClick(seat)}
        className="w-7 h-7 rounded-sm bg-neutral-900 flex items-center justify-center"
        title={`${seat.label} — ${seat.type}`}
      >
        <Check size={10} className="text-white" />
      </button>
    )
  }
  return (
    <button
      onClick={() => onClick(seat)}
      className="w-7 h-7 rounded-sm border border-neutral-300 bg-white hover:border-neutral-600 hover:bg-neutral-50 transition-colors"
      title={`${seat.label} — ${seat.type}`}
    />
  )
}
