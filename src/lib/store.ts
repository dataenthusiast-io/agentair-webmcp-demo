import { create } from 'zustand'
import { flights } from './flights'
import type { Flight, FlightClass } from './flights'

export interface AgentActivity {
  id: string
  tool: 'search_flights' | 'add_to_booking' | 'get_booking'
  message: string
  detail?: string
  timestamp: number
}

export interface BookingItem {
  flight: Flight
  flightClass: FlightClass
  passengers: number
  addedByAgent: boolean
}

interface StoreState {
  items: BookingItem[]
  flights: Flight[]
  hasSearched: boolean
  agentActivities: AgentActivity[]
  agentSearchQuery: { from?: string; to?: string } | null

  setHasSearched: (v: boolean) => void
  addAgentActivity: (
    activity: Omit<AgentActivity, 'id' | 'timestamp'>,
  ) => void
  dismissAgentActivity: (id: string) => void

  addToBooking: (
    flightId: string,
    classId: string,
    passengers?: number,
    byAgent?: boolean,
  ) => void
  removeFromBooking: (classId: string) => void
  clearBooking: () => void
  getTotal: () => number
  getItemCount: () => number
  searchFlights: (from?: string, to?: string) => Flight[]
}

let activityCounter = 0

export const useStore = create<StoreState>((set, get) => ({
  items: [],
  flights,
  hasSearched: false,
  agentActivities: [],
  agentSearchQuery: null,

  setHasSearched: (v) => set({ hasSearched: v }),

  addAgentActivity: (activity) => {
    const id = `act-${++activityCounter}`
    set((state) => ({
      agentActivities: [
        { ...activity, id, timestamp: Date.now() },
        ...state.agentActivities,
      ].slice(0, 10),
    }))
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      get().dismissAgentActivity(id)
    }, 6000)
  },

  dismissAgentActivity: (id) => {
    set((state) => ({
      agentActivities: state.agentActivities.filter((a) => a.id !== id),
    }))
  },

  addToBooking: (flightId, classId, passengers = 1, byAgent = false) => {
    const flight = flights.find((f) => f.id === flightId)
    if (!flight) return
    const flightClass = flight.classes.find((c) => c.id === classId)
    if (!flightClass) return

    set((state) => {
      if (state.items.some((i) => i.flightClass.id === classId)) return state
      return {
        items: [...state.items, { flight, flightClass, passengers, addedByAgent: byAgent }],
      }
    })
  },

  removeFromBooking: (classId) => {
    set((state) => ({
      items: state.items.filter((i) => i.flightClass.id !== classId),
    }))
  },

  clearBooking: () => set({ items: [] }),

  getTotal: () =>
    get().items.reduce(
      (sum, i) => sum + i.flightClass.price * i.passengers,
      0,
    ),

  getItemCount: () => get().items.length,

  searchFlights: (from?, to?) =>
    flights.filter((f) => {
      if (
        from &&
        !f.fromCode.toLowerCase().includes(from.toLowerCase()) &&
        !f.from.toLowerCase().includes(from.toLowerCase())
      )
        return false
      if (
        to &&
        !f.toCode.toLowerCase().includes(to.toLowerCase()) &&
        !f.to.toLowerCase().includes(to.toLowerCase())
      )
        return false
      return true
    }),
}))
