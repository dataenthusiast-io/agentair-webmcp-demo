import { create } from 'zustand'
import { flights } from './flights'
import type { Flight, FlightClass } from './flights'
import type { SelectedSeat } from './seats'
import type { ConsentState } from './consent'
import { CONSENT_STORAGE_KEY } from './consent'

export type { SelectedSeat }

export interface AgentActivity {
  id: string
  tool:
    | 'search_flights'
    | 'add_to_booking'
    | 'get_booking'
    | 'select_seat'
    | 'checkout'
    | 'get_consent'
    | 'ask_consent'
  message: string
  detail?: string
  timestamp: number
}

export interface CheckoutPrefill {
  name?: string
  email?: string
  card?: string
  expiry?: string
  cvv?: string
  autoSubmit?: boolean
}

export interface BookingItem {
  flight: Flight
  flightClass: FlightClass
  passengers: number
  addedByAgent: boolean
  seat?: SelectedSeat
}

interface StoreState {
  items: BookingItem[]
  flights: Flight[]
  hasSearched: boolean
  agentActivities: AgentActivity[]
  activeSeatMap: string | null
  checkoutOpen: boolean
  checkoutPrefill: CheckoutPrefill
  consentState: ConsentState

  setHasSearched: (v: boolean) => void
  setSeatMapOpen: (classId: string | null) => void
  setCheckoutOpen: (v: boolean) => void
  setCheckoutPrefill: (data: CheckoutPrefill) => void
  setConsentState: (state: ConsentState) => void
  addAgentActivity: (activity: Omit<AgentActivity, 'id' | 'timestamp'>) => void
  dismissAgentActivity: (id: string) => void

  addToBooking: (
    flightId: string,
    classId: string,
    passengers?: number,
    byAgent?: boolean,
    seat?: SelectedSeat,
  ) => void
  selectSeat: (classId: string, seat: SelectedSeat) => void
  removeFromBooking: (classId: string) => void
  clearBooking: () => void
  getTotal: () => number
  getItemCount: () => number
  searchFlights: (from?: string, to?: string) => Flight[]
}

let activityCounter = 0

function readStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return 'pending'
  return (localStorage.getItem(CONSENT_STORAGE_KEY) as ConsentState) ?? 'pending'
}

export const useStore = create<StoreState>((set, get) => ({
  items: [],
  flights,
  hasSearched: false,
  agentActivities: [],
  activeSeatMap: null,
  checkoutOpen: false,
  checkoutPrefill: {},
  consentState: readStoredConsent(),

  setHasSearched: (v) => set({ hasSearched: v }),
  setSeatMapOpen: (classId) => set({ activeSeatMap: classId }),
  setCheckoutOpen: (v) => set({ checkoutOpen: v }),
  setCheckoutPrefill: (data) => set({ checkoutPrefill: data }),
  setConsentState: (state) => set({ consentState: state }),

  addAgentActivity: (activity) => {
    const id = `act-${++activityCounter}`
    set((state) => ({
      agentActivities: [
        { ...activity, id, timestamp: Date.now() },
        ...state.agentActivities,
      ].slice(0, 10),
    }))
    setTimeout(() => get().dismissAgentActivity(id), 6000)
  },

  dismissAgentActivity: (id) => {
    set((state) => ({
      agentActivities: state.agentActivities.filter((a) => a.id !== id),
    }))
  },

  addToBooking: (flightId, classId, passengers = 1, byAgent = false, seat?) => {
    const flight = flights.find((f) => f.id === flightId)
    if (!flight) return
    const flightClass = flight.classes.find((c) => c.id === classId)
    if (!flightClass) return

    set((state) => {
      if (state.items.some((i) => i.flightClass.id === classId)) {
        // Already in booking — update seat if provided
        if (seat) {
          return {
            items: state.items.map((i) =>
              i.flightClass.id === classId ? { ...i, seat } : i,
            ),
          }
        }
        return state
      }
      return {
        items: [...state.items, { flight, flightClass, passengers, addedByAgent: byAgent, seat }],
      }
    })
  },

  selectSeat: (classId, seat) => {
    set((state) => {
      const exists = state.items.some((i) => i.flightClass.id === classId)
      if (!exists) return state
      return {
        items: state.items.map((i) =>
          i.flightClass.id === classId ? { ...i, seat } : i,
        ),
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
    get().items.reduce((sum, i) => sum + i.flightClass.price * i.passengers, 0),

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
