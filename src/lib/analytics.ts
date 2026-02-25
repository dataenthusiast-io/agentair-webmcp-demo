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
 * --- Custom dimension (configure once in GA4) ---
 * Parameter: interaction_source | Scope: Event
 * Values:    "ui"    — user-initiated action
 *            "agent" — AI agent action via WebMCP
 *
 * Every event in this app carries interaction_source so analysts can
 * segment any metric (searches, add-to-carts, purchases, …) by whether
 * it was performed by a human or an AI agent.
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
  window.gtag?.('event', eventName, payload)
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
 * @param extra      Additional top-level fields (e.g. interaction_source)
 */
export function pushEcommerceEvent(
  eventName: string,
  ecommerce: Record<string, unknown>,
  extra: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') return
  window.gtag?.('event', eventName, { ...ecommerce, ...extra })
}
