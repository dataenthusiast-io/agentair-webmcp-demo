export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: 'cheesesteaks' | 'sides' | 'drinks'
}

export const menu: MenuItem[] = [
  {
    id: 'classic-whiz',
    name: 'Classic Whiz',
    description: 'Thinly sliced ribeye with Cheez Whiz on a fresh Amoroso roll',
    price: 12.99,
    category: 'cheesesteaks',
  },
  {
    id: 'provolone-steak',
    name: 'Provolone Steak',
    description: 'Ribeye with sharp provolone, grilled onions, and peppers',
    price: 13.99,
    category: 'cheesesteaks',
  },
  {
    id: 'mushroom-swiss',
    name: 'Mushroom Swiss',
    description: 'Ribeye with sautéed mushrooms and melted Swiss cheese',
    price: 14.49,
    category: 'cheesesteaks',
  },
  {
    id: 'pizza-steak',
    name: 'Pizza Steak',
    description: 'Ribeye with marinara sauce and melted mozzarella',
    price: 13.49,
    category: 'cheesesteaks',
  },
  {
    id: 'chicken-cheese',
    name: 'Chicken Cheesesteak',
    description: 'Grilled chicken breast with American cheese and fried onions',
    price: 12.49,
    category: 'cheesesteaks',
  },
  {
    id: 'fries',
    name: 'Cheese Fries',
    description: 'Crispy fries smothered in Cheez Whiz',
    price: 5.99,
    category: 'sides',
  },
  {
    id: 'onion-rings',
    name: 'Onion Rings',
    description: 'Beer-battered thick-cut onion rings',
    price: 6.49,
    category: 'sides',
  },
  {
    id: 'soft-pretzel',
    name: 'Soft Pretzel',
    description: 'Warm Philly-style soft pretzel with mustard',
    price: 4.99,
    category: 'sides',
  },
  {
    id: 'birch-beer',
    name: 'Birch Beer',
    description: 'Pennsylvania Dutch birch beer, ice cold',
    price: 2.99,
    category: 'drinks',
  },
  {
    id: 'lemonade',
    name: 'Fresh Lemonade',
    description: 'House-squeezed lemonade with real lemons',
    price: 3.49,
    category: 'drinks',
  },
]

export const categories = ['cheesesteaks', 'sides', 'drinks'] as const

export const categoryLabels: Record<string, string> = {
  cheesesteaks: 'Cheesesteaks',
  sides: 'Sides',
  drinks: 'Drinks',
}
