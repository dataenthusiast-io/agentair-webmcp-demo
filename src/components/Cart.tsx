import { X, ShoppingBag, CreditCard, Trash2, LayoutGrid, ArrowLeft, Lock } from 'lucide-react'
import { useStore } from '../lib/store'
import { pushEcommerceEvent, buildRouteParams, buildFlightItemParams } from '../lib/analytics'
import { useEffect, useRef, useState } from 'react'

// ─── Booking summary view ─────────────────────────────────────────────────────

export default function BookingSidebar() {
  const checkoutOpen = useStore((s) => s.checkoutOpen)
  const setCheckoutOpen = useStore((s) => s.setCheckoutOpen)

  if (checkoutOpen) {
    return <CheckoutForm onBack={() => setCheckoutOpen(false)} />
  }

  return <BookingSummary onCheckout={() => setCheckoutOpen(true)} />
}

function BookingSummary({ onCheckout }: { onCheckout: () => void }) {
  const items = useStore((s) => s.items)
  const removeFromBooking = useStore((s) => s.removeFromBooking)
  const clearBooking = useStore((s) => s.clearBooking)
  const total = useStore((s) => s.getTotal())

  const handleRemove = (classId: string) => {
    const item = items.find((i) => i.flightClass.id === classId)
    removeFromBooking(classId)
    if (item) {
      pushEcommerceEvent(
        'remove_from_cart',
        {
          currency: 'USD',
          value: item.flightClass.price * item.passengers,
          items: [
            {
              item_id: item.flightClass.id,
              item_name: `${item.flight.fromCode} → ${item.flight.toCode} · ${item.flightClass.name}`,
              item_brand: 'Air Agentic',
              item_category: item.flightClass.name,
              price: item.flightClass.price,
              quantity: item.passengers,
              ...buildFlightItemParams({
                flightId: item.flight.id,
                departure: item.flight.departure,
                arrival: item.flight.arrival,
                passengers: item.passengers,
                className: item.flightClass.name,
              }),
            },
          ],
        },
        {
          interaction_source: 'human',
          ...buildRouteParams(item.flight.fromCode, item.flight.toCode),
        }
      )
    }
  }

  const handleCheckout = () => {
    const firstItem = items[0]
    pushEcommerceEvent(
      'begin_checkout',
      {
        currency: 'USD',
        value: total,
        items: items.map((i) => ({
          item_id: i.flightClass.id,
          item_name: `${i.flight.fromCode} → ${i.flight.toCode} · ${i.flightClass.name}`,
          item_brand: 'Air Agentic',
          item_category: i.flightClass.name,
          price: i.flightClass.price,
          quantity: i.passengers,
          ...buildFlightItemParams({
            flightId: i.flight.id,
            departure: i.flight.departure,
            arrival: i.flight.arrival,
            passengers: i.passengers,
            className: i.flightClass.name,
          }),
        })),
      },
      {
        interaction_source: 'human',
        ...(firstItem ? buildRouteParams(firstItem.flight.fromCode, firstItem.flight.toCode) : {}),
      }
    )
    onCheckout()
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

// ─── Checkout form ─────────────────────────────────────────────────────────────

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

function CheckoutForm({ onBack }: { onBack: () => void }) {
  const items = useStore((s) => s.items)
  const total = useStore((s) => s.getTotal())
  const clearBooking = useStore((s) => s.clearBooking)
  const setCheckoutOpen = useStore((s) => s.setCheckoutOpen)
  const prefill = useStore((s) => s.checkoutPrefill)

  const [name, setName] = useState(prefill.name ?? '')
  const [email, setEmail] = useState(prefill.email ?? '')
  const [card, setCard] = useState(prefill.card ?? '')
  const [expiry, setExpiry] = useState(prefill.expiry ?? '')
  const [cvv, setCvv] = useState(prefill.cvv ?? '')
  const [submitting, setSubmitting] = useState(false)

  // Sync prefill when agent updates it after mount (e.g. checkout tool called)
  const prevPrefill = useRef(prefill)
  useEffect(() => {
    if (prefill === prevPrefill.current) return
    prevPrefill.current = prefill
    if (prefill.name) setName(prefill.name)
    if (prefill.email) setEmail(prefill.email)
    if (prefill.card) setCard(prefill.card)
    if (prefill.expiry) setExpiry(prefill.expiry)
    if (prefill.cvv) setCvv(prefill.cvv)
  }, [prefill])

  const valid = !!(name.trim() && email.trim() && card.replace(/\s/g, '').length === 16
    && expiry.length === 5 && cvv.length >= 3)

  useEffect(() => {
    if (prefill.autoSubmit && valid && !submitting) {
      const t = setTimeout(handlePay, 600)
      return () => clearTimeout(t)
    }
  }, [valid, prefill.autoSubmit])

  const handlePay = () => {
    if (!valid || submitting) return
    setSubmitting(true)
    const purchaseFirstItem = items[0]
    pushEcommerceEvent(
      'purchase',
      {
        transaction_id: `AA-${Date.now()}`,
        currency: 'USD',
        value: total,
        items: items.map((i) => ({
          item_id: i.flightClass.id,
          item_name: `${i.flight.fromCode} → ${i.flight.toCode} · ${i.flightClass.name}`,
          item_brand: 'Air Agentic',
          item_category: i.flightClass.name,
          price: i.flightClass.price,
          quantity: i.passengers,
          ...(i.seat && { item_variant: i.seat.label }),
          ...buildFlightItemParams({
            flightId: i.flight.id,
            departure: i.flight.departure,
            arrival: i.flight.arrival,
            passengers: i.passengers,
            className: i.flightClass.name,
          }),
        })),
      },
      {
        interaction_source: prefill.autoSubmit ? 'agent' : 'human',
        ...(purchaseFirstItem ? buildRouteParams(purchaseFirstItem.flight.fromCode, purchaseFirstItem.flight.toCode) : {}),
      }
    )
    setTimeout(() => {
      setCheckoutOpen(false)
      clearBooking()
      alert(`Booking confirmed! ✈\n\nThank you, ${name.split(' ')[0]}. Your itinerary has been sent to ${email}.`)
      setSubmitting(false)
    }, 800)
  }

  const fieldCls = 'w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-500 focus:bg-white transition-colors'
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1'

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden sticky top-20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft size={14} />
        </button>
        <span className="text-sm font-semibold text-neutral-900">Checkout</span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Booking mini-summary */}
        <div className="bg-neutral-50 rounded-lg p-3 space-y-1.5">
          {items.map((item) => (
            <div key={item.flightClass.id} className="flex justify-between text-xs">
              <span className="text-neutral-600">
                {item.flight.fromCode} — {item.flight.toCode} · {item.flightClass.name}
                {item.seat ? ` · ${item.seat.label}` : ''}
              </span>
              <span className="font-semibold text-neutral-900 tabular-nums">
                ${(item.flightClass.price * item.passengers).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-1.5 border-t border-neutral-200">
            <span className="text-xs font-semibold text-neutral-700">Total</span>
            <span className="text-sm font-bold text-neutral-900 tabular-nums">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Passenger */}
        <div>
          <p className={labelCls}>Passenger</p>
          <div className="space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name (as on ID)"
              className={fieldCls}
              autoComplete="name"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={fieldCls}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Payment */}
        <div>
          <p className={labelCls}>Payment</p>
          <div className="space-y-2">
            <input
              type="text"
              value={card}
              onChange={(e) => setCard(formatCardNumber(e.target.value))}
              placeholder="Card number"
              className={`${fieldCls} tabular-nums tracking-wider`}
              autoComplete="cc-number"
              inputMode="numeric"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className={`${fieldCls} tabular-nums`}
                autoComplete="cc-exp"
                inputMode="numeric"
              />
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="CVV"
                className={`${fieldCls} tabular-nums`}
                autoComplete="cc-csc"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handlePay}
          disabled={!valid || submitting}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            valid && !submitting
              ? 'bg-neutral-900 hover:bg-neutral-700 text-white'
              : 'bg-neutral-100 text-neutral-400 cursor-default'
          }`}
        >
          <Lock size={13} />
          {submitting ? 'Processing…' : `Pay $${total.toLocaleString()}`}
        </button>

        <p className="text-center text-[10px] text-neutral-300">
          Demo only — no real charge will be made
        </p>
      </div>
    </div>
  )
}
