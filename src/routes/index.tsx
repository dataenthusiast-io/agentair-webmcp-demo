import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, ArrowRight, Plane, Zap, Bot, Shield } from 'lucide-react'
import { useStore } from '../lib/store'
import { pushDataLayerEvent } from '../lib/analytics'
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

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
        <div className="relative">
          <label className="block text-[10px] font-semibold text-blue-200 uppercase tracking-wider px-3 pt-2.5">
            From
          </label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-transparent text-white placeholder-white/40 px-3 pb-2.5 text-sm font-semibold outline-none"
            placeholder="JFK"
          />
        </div>

        <div className="relative">
          <label className="block text-[10px] font-semibold text-blue-200 uppercase tracking-wider px-3 pt-2.5">
            To
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-transparent text-white placeholder-white/40 px-3 pb-2.5 text-sm font-semibold outline-none"
            placeholder="LAX"
          />
        </div>

        <div className="relative">
          <label className="block text-[10px] font-semibold text-blue-200 uppercase tracking-wider px-3 pt-2.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-white placeholder-white/40 px-3 pb-2.5 text-sm font-semibold outline-none [color-scheme:dark]"
          />
        </div>

        <div className="flex items-stretch gap-1">
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-blue-200 uppercase tracking-wider px-3 pt-2.5">
              Passengers
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full bg-transparent text-white px-3 pb-2.5 text-sm font-semibold outline-none appearance-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n} className="bg-slate-900 text-white">
                  {n} {n === 1 ? 'adult' : 'adults'}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="shrink-0 m-1 px-5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <Search size={15} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function FeaturePill({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-blue-200/80 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
      <Icon size={12} className="text-blue-400" />
      {label}
    </div>
  )
}

function AgentSearchBanner() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-sky-950 border border-sky-800 text-sm mb-5 animate-fade-in-up">
      <span className="flex items-center gap-1.5 text-sky-300 font-medium shrink-0">
        <Bot size={14} className="text-sky-400" />
        AI Agent
      </span>
      <span className="text-sky-500">·</span>
      <span className="text-sky-400 text-xs">
        Your agent searched for these flights. Results are shown below.
      </span>
    </div>
  )
}

function App() {
  const hasSearched = useStore((s) => s.hasSearched)
  const setHasSearched = useStore((s) => s.setHasSearched)

  // True if an agent has interacted (searched or added something)
  const agentActivities = useStore((s) => s.agentActivities)
  const agentAddedAny = useStore((s) => s.items.some((i) => i.addedByAgent))
  const hasAgentSearched =
    agentActivities.some((a) => a.tool === 'search_flights') || agentAddedAny

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Agent toast feed */}
      <AgentActivityFeed />

      {/* Hero */}
      <section className="relative bg-slate-950 pt-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
            <Bot size={13} className="text-blue-400" />
            <span className="text-xs text-blue-300 font-medium">
              World's first AI-native airline
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Travel smarter.
            <br />
            <span className="text-blue-400">Book instantly.</span>
          </h1>

          <p className="mt-5 text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            AgentAir is the first airline built for the agentic web — your AI
            assistant can search and book flights on your behalf, natively.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <FeaturePill icon={Zap} label="Instant AI booking" />
            <FeaturePill icon={Bot} label="WebMCP native" />
            <FeaturePill icon={Shield} label="Secure & refundable" />
          </div>

          <div className="mt-10">
            <SearchForm onSearch={() => setHasSearched(true)} />
          </div>
        </div>
      </section>

      {/* Results */}
      {hasSearched && (
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8 animate-fade-in-up">
          <main className="flex-1 min-w-0">
            {hasAgentSearched && <AgentSearchBanner />}

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-lg">
                <Plane size={18} className="text-blue-500" />
                JFK
                <ArrowRight size={16} className="text-slate-400" />
                LAX
              </div>
              <span className="text-slate-400 text-sm">·</span>
              <span className="text-slate-500 text-sm">
                {flights.length} flight{flights.length !== 1 ? 's' : ''} found
              </span>
            </div>

            <div className="space-y-5">
              {flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          </main>

          <aside className="w-full lg:w-80 shrink-0">
            <BookingSidebar />
          </aside>
        </div>
      )}

      {/* Landing state */}
      {!hasSearched && (
        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: 'Agent-native booking',
              desc: 'Your AI assistant can search flights and complete bookings on your behalf through the WebMCP protocol.',
              color: 'text-blue-500',
              bg: 'bg-blue-50',
            },
            {
              icon: Zap,
              title: 'Instant confirmation',
              desc: 'No waiting queues, no hold music. Bookings are confirmed in milliseconds, whether made by you or your agent.',
              color: 'text-amber-500',
              bg: 'bg-amber-50',
            },
            {
              icon: Shield,
              title: 'Fully refundable tiers',
              desc: 'Business and First class fares are always fully refundable. Economy gets flexible options too.',
              color: 'text-emerald-500',
              bg: 'bg-emerald-50',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}
              >
                <card.icon size={20} className={card.color} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{card.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      )}

      <WebMCPStatus />
    </div>
  )
}
