declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

/**
 * Push a standard event onto the GTM / GA4 dataLayer.
 *
 * --- Custom dimension (configure once in GA4 & GTM) ---
 * Name:      "Interaction Source"
 * Parameter: interaction_source
 * Scope:     Event
 * Values:    "ui"    — user-initiated action
 *            "agent" — AI agent action via WebMCP
 *
 * Every event in this app carries interaction_source so analysts can
 * segment any metric (searches, add-to-carts, purchases, …) by whether
 * it was performed by a human or an AI agent.
 */
export function pushDataLayerEvent(
  eventName: string,
  payload: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...payload })
}

/**
 * Push a GA4 enhanced ecommerce event.
 *
 * Clears the previous ecommerce object before pushing to prevent
 * data bleed between events — required by GA4 implementation spec.
 *
 * @param eventName  GA4 ecommerce event name (e.g. "add_to_cart")
 * @param ecommerce  The ecommerce payload object
 * @param extra      Any additional top-level fields (e.g. interaction_source)
 */
export function pushEcommerceEvent(
  eventName: string,
  ecommerce: Record<string, unknown>,
  extra: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ ecommerce: null })
  window.dataLayer.push({ event: eventName, ecommerce, ...extra })
}
