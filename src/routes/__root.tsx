import { useEffect } from 'react'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import ConsentBanner from '../components/ConsentBanner'
import { initConsent } from '../lib/consent'
import appCss from '../styles.css?url'

function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">Page not found</h1>
      <p className="mt-2 text-neutral-500">This route doesn't exist.</p>
      <a
        href="/"
        className="mt-6 inline-block bg-neutral-900 hover:bg-neutral-700 text-white px-5 py-2.5 text-sm font-medium transition-colors rounded-lg"
      >
        Back to AgentAir
      </a>
    </main>
  )
}

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'AgentAir — The AI-Native Airline' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  shellComponent: RootDocument,
})

const GA4_ID = process.env['GA4_ID'] ?? ''

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initConsent()
  }, [])

  return (
    <html lang="en">
      <head>
        {GA4_ID && (
          /*
           * We set up the dataLayer stub and queue the consent default + config
           * calls, but deliberately DO NOT load gtag.js here.
           *
           * gtag.js is injected dynamically by consent.ts only after the user
           * grants consent. Until then, gtag() calls accumulate harmlessly in
           * the dataLayer array in memory — zero network contact with Google.
           *
           * When gtag.js eventually loads it processes the full queue in order:
           *   consent default (denied) → consent update (granted) → js → config
           *   → any buffered events
           * so every hit arrives at GA4 with consent already granted.
           *
           * __GA4_ID__ is read by consent.ts to construct the script URL.
           */
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__GA4_ID__='${GA4_ID}';window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied'});gtag('js',new Date());gtag('config','${GA4_ID}');`,
            }}
          />
        )}
        <HeadContent />
      </head>
      <body>
        <Header />
        {children}
        <ConsentBanner />
        <Scripts />
      </body>
    </html>
  )
}
