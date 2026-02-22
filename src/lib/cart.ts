import type { MenuItem } from './menu'

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

interface CartState {
  items: CartItem[]
}

let state: CartState = { items: [] }
const subscribers = new Set<() => void>()

function emitChange() {
  for (const fn of subscribers) fn()
}

export function addToCart(menuItem: MenuItem, qty = 1) {
  const existing = state.items.find((i) => i.menuItem.id === menuItem.id)
  if (existing) {
    state = {
      items: state.items.map((i) =>
        i.menuItem.id === menuItem.id
          ? { ...i, quantity: i.quantity + qty }
          : i,
      ),
    }
  } else {
    state = { items: [...state.items, { menuItem, quantity: qty }] }
  }
  emitChange()
}

export function removeFromCart(id: string) {
  state = { items: state.items.filter((i) => i.menuItem.id !== id) }
  emitChange()
}

export function clearCart() {
  state = { items: [] }
  emitChange()
}

export function getCart() {
  return state.items
}

export function getTotal() {
  return state.items.reduce(
    (sum, i) => sum + i.menuItem.price * i.quantity,
    0,
  )
}

export function getItemCount() {
  return state.items.reduce((sum, i) => sum + i.quantity, 0)
}

export function subscribe(callback: () => void) {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

export function getSnapshot() {
  return state
}
