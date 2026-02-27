export interface FlightClass {
  id: string
  name: 'Economy' | 'Business' | 'First'
  price: number
  features: string[]
  baggage: string
  seatsLeft: number
  refundable: boolean
}

export interface Flight {
  id: string
  from: string
  fromCode: string
  to: string
  toCode: string
  date: string
  departure: string
  arrival: string
  duration: string
  aircraft: string
  classes: FlightClass[]
}

export const flights: Flight[] = [
  {
    id: 'AA101',
    from: 'New York',
    fromCode: 'JFK',
    to: 'Los Angeles',
    toCode: 'LAX',
    date: '2026-03-15',
    departure: '08:00',
    arrival: '11:30',
    duration: '5h 30m',
    aircraft: 'Air Agentic A380',
    classes: [
      {
        id: 'AA101-ECO',
        name: 'Economy',
        price: 299,
        features: ['Standard seat', '1 carry-on bag', 'In-flight Wi-Fi', 'Snacks & beverages'],
        baggage: '23 kg checked bag (+$35)',
        seatsLeft: 42,
        refundable: false,
      },
      {
        id: 'AA101-BIZ',
        name: 'Business',
        price: 799,
        features: ['Lie-flat seat', 'Priority boarding', 'Lounge access', 'Gourmet multi-course meal'],
        baggage: '2 × 32 kg included',
        seatsLeft: 8,
        refundable: true,
      },
      {
        id: 'AA101-FIRST',
        name: 'First',
        price: 1499,
        features: ['Private suite', 'Dedicated concierge', 'Champagne & fine dining', 'Limo transfer'],
        baggage: 'Unlimited',
        seatsLeft: 3,
        refundable: true,
      },
    ],
  },
  {
    id: 'AA205',
    from: 'New York',
    fromCode: 'JFK',
    to: 'Los Angeles',
    toCode: 'LAX',
    date: '2026-03-15',
    departure: '14:15',
    arrival: '17:45',
    duration: '5h 30m',
    aircraft: 'Air Agentic B787',
    classes: [
      {
        id: 'AA205-ECO',
        name: 'Economy',
        price: 259,
        features: ['Standard seat', '1 carry-on bag', 'In-flight Wi-Fi', 'Snacks & beverages'],
        baggage: '23 kg checked bag (+$35)',
        seatsLeft: 61,
        refundable: false,
      },
      {
        id: 'AA205-BIZ',
        name: 'Business',
        price: 699,
        features: ['Lie-flat seat', 'Priority boarding', 'Lounge access', 'Gourmet multi-course meal'],
        baggage: '2 × 32 kg included',
        seatsLeft: 12,
        refundable: true,
      },
    ],
  },
]
