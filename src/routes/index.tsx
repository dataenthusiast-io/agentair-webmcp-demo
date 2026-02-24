import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, ArrowRight, Plane } from 'lucide-react'
import { useStore } from '../lib/store'
import { pushDataLayerEvent, pushEcommerceEvent } from '../lib/analytics'
import { flights } from '../lib/flights'
import FlightCard from '../components/FlightCard'
import BookingSidebar from '../components/Cart'
import WebMCPStatus from '../components/WebMCPStatus'
import AgentActivityFeed from '../components/AgentActivityFeed'

export const Route = createFileRoute('/')({ component: App })

const DEMO_FROM = 'JFK'
const DEMO_TO = 'LAX'
const DEMO_DATE = '2026-03-15'

function SearchForm({ onSearch }: { onSearch: () => void }) {
  const [from, setFrom] = useState(DEMO_FROM)
  const [to, setTo] = useState(DEMO_TO)
  const [date, setDate] = useState(DEMO_DATE)
  const [passengers, setPassengers] = useState(1)

  const handleSearch = () => {
    pushDataLayerEvent('search', {
      search_term: `${from} → ${to}`,
      date,
      passengers,
      interaction_source: 'ui',
    })
    onSearch()
  }

  const inputCls =
    'w-full bg-transparent text-white placeholder-neutral-500 px-4 pb-3 text-sm font-medium outline-none'
  const labelCls =
    'block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-4 pt-3'

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl flex flex-col lg:flex-row">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-neutral-800 min-w-0">
        <div>
          <label className={labelCls}>From</label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
            placeholder="JFK"
          />
        </div>
        <div>
          <label className={labelCls}>To</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
            placeholder="LAX"
          />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputCls} [color-scheme:dark]`}
          />
        </div>
        <div>
          <label className={labelCls}>Passengers</label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className={`${inputCls} appearance-none`}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n} className="bg-neutral-900">
                {n} {n === 1 ? 'adult' : 'adults'}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="border-t lg:border-t-0 lg:border-l border-neutral-800 p-2 flex items-center">
        <button
          onClick={handleSearch}
          className="w-full lg:w-auto px-6 py-2.5 bg-white hover:bg-neutral-200 text-neutral-900 font-semibold text-sm transition-colors rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Search size={14} />
          Search
        </button>
      </div>
    </div>
  )
}

function App() {
  const hasSearched = useStore((s) => s.hasSearched)
  const setHasSearched = useStore((s) => s.setHasSearched)

  useEffect(() => {
    if (!hasSearched) return
    pushEcommerceEvent(
      'view_item_list',
      {
        item_list_id: 'flight_results',
        item_list_name: 'Flight Results',
        items: flights.map((f, index) =>
          f.classes.map((cls) => ({
            item_id: cls.id,
            item_name: `${f.fromCode} → ${f.toCode} · ${cls.name}`,
            item_brand: 'AgentAir',
            item_category: cls.name,
            item_list_id: 'flight_results',
            item_list_name: 'Flight Results',
            index,
            price: cls.price,
          }))
        ).flat(),
      },
      { interaction_source: 'ui' }
    )
  }, [hasSearched])

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Hero */}
      <section className="bg-neutral-950 pt-14">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-5">
            New York · Los Angeles
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-3">
            Fly smarter.
            <br />
            Book instantly.
          </h1>
          <p className="text-sm text-neutral-500 mb-10 max-w-sm leading-relaxed">
            The only airline your AI agent can book natively — no API keys, no
            integrations, just WebMCP.
          </p>
          <SearchForm onSearch={() => setHasSearched(true)} />
        </div>
      </section>

      {/* Results */}
      {hasSearched ? (
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8 animate-fade-in-up">
          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-5">
              <Plane size={14} className="text-neutral-400" />
              <span className="text-sm font-semibold text-neutral-900">
                {DEMO_FROM}
              </span>
              <ArrowRight size={13} className="text-neutral-300" />
              <span className="text-sm font-semibold text-neutral-900">
                {DEMO_TO}
              </span>
              <span className="text-neutral-300 text-sm">·</span>
              <span className="text-xs text-neutral-400">
                {flights.length} flights available
              </span>
            </div>

            <div className="space-y-3">
              {flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          </main>

          <aside className="w-full lg:w-72 shrink-0">
            <BookingSidebar />
          </aside>
        </div>
      ) : (
        /* Landing — simple, editorial */
        <div className="max-w-4xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
            {[
              {
                label: 'Economy',
                from: 'from $259',
                desc: 'Wi-Fi · 1 carry-on · snacks',
              },
              {
                label: 'Business',
                from: 'from $699',
                desc: 'Lie-flat · lounge · 2 bags',
              },
              {
                label: 'First Class',
                from: 'from $1,499',
                desc: 'Private suite · champagne',
              },
            ].map((tier) => (
              <div key={tier.label} className="bg-white px-6 py-7">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                  {tier.label}
                </div>
                <div className="text-lg font-bold text-neutral-900 mb-1">{tier.from}</div>
                <div className="text-xs text-neutral-400">{tier.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                heading: 'AI-native booking',
                body:
                  'AgentAir exposes a native WebMCP interface, letting any AI agent search and book flights on your behalf — no scraping, no workarounds.',
              },
              {
                heading: 'Instant confirmation',
                body:
                  'Every booking is confirmed in real time. Whether you book or your agent does, the itinerary is the same.',
              },
            ].map((item) => (
              <div key={item.heading}>
                <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">
                  {item.heading}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <WebMCPStatus />
      <AgentActivityFeed />
    </div>
  )
}
