import { create } from 'zustand'
import { menu } from './menu'
import type { MenuItem } from './menu'

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

interface StoreState {
  items: CartItem[]
  menu: MenuItem[]
  addToCart: (item: MenuItem, qty?: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  getMenuByCategory: (cat?: string) => MenuItem[]
}

export const useStore = create<StoreState>((set, get) => ({
  items: [],
  menu,

  addToCart: (menuItem, qty = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.menuItem.id === menuItem.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItem.id === menuItem.id
              ? { ...i, quantity: i.quantity + qty }
              : i,
          ),
        }
      }
      return { items: [...state.items, { menuItem, quantity: qty }] }
    })
  },

  removeFromCart: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.menuItem.id !== id),
    }))
  },

  clearCart: () => set({ items: [] }),

  getTotal: () =>
    get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),

  getMenuByCategory: (cat?) =>
    cat ? get().menu.filter((i) => i.category === cat) : get().menu,
}))
