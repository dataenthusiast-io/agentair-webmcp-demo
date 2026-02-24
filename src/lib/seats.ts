import type { FlightClass } from './flights'

export interface SelectedSeat {
  label: string
  row: number
  col: string
  type: 'window' | 'aisle' | 'middle'
}

export interface SeatInfo extends SelectedSeat {
  occupied: boolean
}

export const SEAT_LAYOUTS: Record<
  FlightClass['name'],
  {
    startRow: number
    endRow: number
    cols: string[]
    colTypes: Record<string, SelectedSeat['type']>
    aisleAfter: string
    occupancyRate: number
  }
> = {
  Economy: {
    startRow: 20,
    endRow: 28,
    cols: ['A', 'B', 'C', 'D', 'E', 'F'],
    colTypes: { A: 'window', B: 'middle', C: 'aisle', D: 'aisle', E: 'middle', F: 'window' },
    aisleAfter: 'C',
    occupancyRate: 58,
  },
  Business: {
    startRow: 1,
    endRow: 7,
    cols: ['A', 'B', 'C', 'D'],
    colTypes: { A: 'window', B: 'aisle', C: 'aisle', D: 'window' },
    aisleAfter: 'B',
    occupancyRate: 38,
  },
  First: {
    startRow: 1,
    endRow: 3,
    cols: ['A', 'B'],
    colTypes: { A: 'window', B: 'window' },
    aisleAfter: 'A',
    occupancyRate: 15,
  },
}

// Deterministic occupancy from seat label hash
function isOccupied(label: string, rate: number): boolean {
  let h = 5381
  for (let i = 0; i < label.length; i++) {
    h = ((h << 5) + h) ^ label.charCodeAt(i)
  }
  return Math.abs(h) % 100 < rate
}

export function getSeatLayout(className: FlightClass['name']) {
  const layout = SEAT_LAYOUTS[className]
  const rows: SeatInfo[][] = []
  for (let r = layout.startRow; r <= layout.endRow; r++) {
    rows.push(
      layout.cols.map((col) => ({
        label: `${r}${col}`,
        row: r,
        col,
        type: layout.colTypes[col],
        occupied: isOccupied(`${r}${col}`, layout.occupancyRate),
      })),
    )
  }
  return { rows, layout }
}

export function findBestSeat(
  rows: SeatInfo[][],
  preference: SelectedSeat['type'],
): SeatInfo | null {
  for (const row of rows) {
    for (const seat of row) {
      if (!seat.occupied && seat.type === preference) return seat
    }
  }
  // Fallback: any available
  for (const row of rows) {
    for (const seat of row) {
      if (!seat.occupied) return seat
    }
  }
  return null
}

export function findSeatByLabel(rows: SeatInfo[][], label: string): SeatInfo | null {
  const normalized = label.toUpperCase()
  for (const row of rows) {
    for (const seat of row) {
      if (seat.label.toUpperCase() === normalized && !seat.occupied) return seat
    }
  }
  return null
}
