import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { grantConsent, denyConsent, getConsentState } from '../lib/consent'
import type { ConsentState } from '../lib/consent'

export default function ConsentBanner() {
  // null = not yet mounted; skip rendering during SSR and initial hydration
  // to avoid a mismatch between the server-rendered HTML (always 'pending')
  // and the actual localStorage value on the client.
  const [consent, setConsent] = useState<ConsentState | null>(null)

  useEffect(() => {
    setConsent(getConsentState())
  }, [])

  // Stay in sync when the user clicks Accept / Decline
  const storeState = useStore((s) => s.consentState)
  useEffect(() => {
    if (consent !== null) setConsent(storeState)
  }, [storeState])

  if (consent !== 'pending') return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="flex-1 text-sm text-neutral-600">
          <span className="font-medium text-neutral-900">Cookie &amp; analytics notice.</span>{' '}
          We use anonymous analytics (flight searches, bookings) to improve this service.
          No personal data is shared.{' '}
          <a
            href="https://gdpr.eu/what-is-gdpr/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-neutral-900 transition-colors"
          >
            Learn more
          </a>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={denyConsent}
            className="px-4 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={grantConsent}
            className="px-4 py-1.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  )
}
