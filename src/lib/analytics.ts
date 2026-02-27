import { bufferOrDrop, getConsentState, getConsentTimestamp } from './consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    // gtag is defined synchronously by the inline snippet in __root.tsx,
    // so it is available before gtag.js finishes loading.
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Push a standard event via gtag.
 *
 * --- Custom dimensions (configure once in GA4) ---
 * interaction_source  "human" | "agent"  — who triggered the event
 * consent_status      "pending" | "granted" | "denied"  — injected automatically
 * consent_timestamp   ISO-8601 string when consent was last decided
 * origin / destination / ond  — route context, injected via buildRouteParams()
 *
 * --- PII policy ---
 * Do NOT pass any personally identifiable information (name, email,
 * phone, card number, IP address, …) to either of these functions.
 * All such data must remain in local component state only.
 */
export function pushDataLayerEvent(
  eventName: string,
  payload: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') return
  if (bufferOrDrop({ kind: 'standard', name: eventName, payload })) return
  window.gtag?.('event', eventName, { ...payload, ...buildConsentParams() })
}

/**
 * Push a GA4 enhanced ecommerce event via gtag.
 *
 * With gtag.js, ecommerce properties (currency, value, items) are passed
 * at the top level of the event params — not nested under an "ecommerce"
 * key. Event isolation is handled automatically by GA4.
 *
 * @param eventName  GA4 ecommerce event name (e.g. "add_to_cart")
 * @param ecommerce  Ecommerce fields: currency, value, items, …
 * @param extra      Additional top-level fields (e.g. interaction_source, origin, ond)
 */
export function pushEcommerceEvent(
  eventName: string,
  ecommerce: Record<string, unknown>,
  extra: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') return
  if (bufferOrDrop({ kind: 'ecommerce', name: eventName, ecommerce, extra })) return
  window.gtag?.('event', eventName, { ...ecommerce, ...extra, ...buildConsentParams() })
}

// ─── Parameter helpers ────────────────────────────────────────────────────────

/**
 * Builds consent-related parameters injected automatically into every event.
 * consent_timestamp is omitted when not yet set (i.e. still pending).
 */
function buildConsentParams(): Record<string, unknown> {
  const status = getConsentState()
  const timestamp = getConsentTimestamp()
  return {
    consent_status: status,
    ...(timestamp ? { consent_timestamp: timestamp } : {}),
  }
}

/**
 * Builds route/OND parameters from origin and destination airport codes.
 * All three fields are omitted when origin is not provided.
 *
 * @example buildRouteParams('JFK', 'LAX')
 *   → { origin: 'JFK', destination: 'LAX', ond: 'JFK|LAX' }
 */
export function buildRouteParams(
  origin?: string,
  destination?: string
): Record<string, unknown> {
  if (!origin) return {}
  return {
    origin,
    ...(destination ? { destination, ond: `${origin}|${destination}` } : {}),
  }
}

export interface FlightItemContext {
  flightId: string
  departure: string   // e.g. "14:00"
  arrival: string     // e.g. "17:30"
  passengers: number
  /** Cabin class display name: 'Economy' | 'Business' | 'First' */
  className: string
}

/**
 * Builds flight-specific item parameters added to every ecommerce item object.
 * Covers: flight_id, departure_time, arrival_time, pax, adult, infant, class_id.
 *
 * Infant count defaults to 0 — extend FlightItemContext if the app adds
 * infant passenger support in the future.
 */
export function buildFlightItemParams(ctx: FlightItemContext): Record<string, unknown> {
  return {
    flight_id: ctx.flightId,
    departure_time: ctx.departure,
    arrival_time: ctx.arrival,
    pax: ctx.passengers,
    adult: ctx.passengers,
    infant: 0,
    class_id: ctx.className.toLowerCase(), // 'economy' | 'business' | 'first'
  }
}
