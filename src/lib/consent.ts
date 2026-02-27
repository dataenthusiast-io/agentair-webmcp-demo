import { useStore } from './store'

export type ConsentState = 'pending' | 'granted' | 'denied'

export const CONSENT_STORAGE_KEY = 'analytics_consent'
export const CONSENT_TIMESTAMP_KEY = 'analytics_consent_timestamp'

export function getConsentTimestamp(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CONSENT_TIMESTAMP_KEY)
}

export type BufferedEvent =
  | { kind: 'standard'; name: string; payload: Record<string, unknown> }
  | {
      kind: 'ecommerce'
      name: string
      ecommerce: Record<string, unknown>
      extra: Record<string, unknown>
    }

/** In-memory buffer for events that fired before consent was decided. */
const buffer: BufferedEvent[] = []

export function getConsentState(): ConsentState {
  if (typeof window === 'undefined') return 'pending'
  return (localStorage.getItem(CONSENT_STORAGE_KEY) as ConsentState) ?? 'pending'
}

/**
 * Dynamically injects the gtag.js script into the document head.
 * Only called after consent is granted to ensure zero network contact
 * with Google before the user explicitly agrees.
 * Safe to call multiple times — no-ops if the script is already present.
 */
function loadGtagScript(): void {
  const ga4Id = (window as unknown as { __GA4_ID__?: string }).__GA4_ID__
  if (!ga4Id) return
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`
  script.async = true
  document.head.appendChild(script)
}

function applyGA4Consent(state: 'granted' | 'denied') {
  window.gtag?.('consent', 'update', { analytics_storage: state })
}

function flushBuffer() {
  const timestamp = getConsentTimestamp()
  const consentParams = {
    consent_status: 'granted' as const,
    ...(timestamp && { consent_timestamp: timestamp }),
  }
  let event: BufferedEvent | undefined
  while ((event = buffer.shift())) {
    if (event.kind === 'standard') {
      window.gtag?.('event', event.name, { ...event.payload, ...consentParams })
    } else {
      window.gtag?.('event', event.name, { ...event.ecommerce, ...event.extra, ...consentParams })
    }
  }
}

export function grantConsent(): void {
  if (typeof window === 'undefined') return
  const ts = new Date().toISOString()
  localStorage.setItem(CONSENT_STORAGE_KEY, 'granted')
  localStorage.setItem(CONSENT_TIMESTAMP_KEY, ts)
  // Update consent state in the dataLayer queue first, then load the script.
  // When gtag.js processes the queue it will see: default denied → update
  // granted → js init → config → buffered events. All hits are sent with
  // consent granted from the start.
  applyGA4Consent('granted')
  loadGtagScript()
  flushBuffer()
  useStore.getState().setConsentState('granted')
}

export function denyConsent(): void {
  if (typeof window === 'undefined') return
  const ts = new Date().toISOString()
  localStorage.setItem(CONSENT_STORAGE_KEY, 'denied')
  localStorage.setItem(CONSENT_TIMESTAMP_KEY, ts)
  // gtag.js was never loaded, so no GA4 call needed — just clean up.
  buffer.length = 0
  useStore.getState().setConsentState('denied')
}

/**
 * Called by analytics.ts before sending an event.
 * Returns true if the event was buffered or dropped — the caller must NOT
 * proceed to call gtag in that case.
 * Returns false only when consent is 'granted' — caller should send normally.
 */
export function bufferOrDrop(event: BufferedEvent): boolean {
  const state = getConsentState()
  if (state === 'granted') return false
  if (state === 'pending') buffer.push(event)
  // 'denied' → silently drop (do not push to buffer)
  return true
}

/**
 * Call once on client-side page load.
 * If the user previously granted consent, loads gtag.js immediately so
 * tracking resumes without asking again. For any other state, gtag.js
 * remains unloaded — no network contact with Google occurs.
 */
export function initConsent(): void {
  if (typeof window === 'undefined') return
  const state = getConsentState()
  // Sync localStorage → store so the banner hides correctly after SSR hydration.
  useStore.getState().setConsentState(state)
  if (state === 'granted') {
    applyGA4Consent('granted')
    loadGtagScript()
  }
  // 'denied' or 'pending': gtag.js stays unloaded. The dataLayer queue
  // accumulates calls harmlessly in memory until/unless consent is granted.
}
