import { menu } from './menu'
import { addToCart, getCart, getTotal } from './cart'

export async function registerWebMCPTools() {
  const mc = navigator.modelContext
  if (!mc) throw new Error('navigator.modelContext not available')

  mc.registerTool({
    name: 'get_menu',
    description:
      "Get the cheesesteak shop menu. Optionally filter by category: 'cheesesteaks', 'sides', or 'drinks'.",
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['cheesesteaks', 'sides', 'drinks'],
          description: 'Optional category to filter by',
        },
      },
    },
    execute: async (params) => {
      const category = params.category as string | undefined
      const items = category
        ? menu.filter((i) => i.category === category)
        : menu
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(items, null, 2) }],
      }
    },
  })

  mc.registerTool({
    name: 'add_to_cart',
    description:
      'Add an item to the cart by menu item ID (e.g. "classic-whiz", "fries"). Quantity defaults to 1.',
    inputSchema: {
      type: 'object',
      properties: {
        item_id: { type: 'string', description: 'Menu item ID' },
        quantity: { type: 'number', description: 'Quantity to add (default 1)' },
      },
      required: ['item_id'],
    },
    execute: async (params) => {
      const itemId = params.item_id as string
      const quantity = (params.quantity as number) ?? 1
      const item = menu.find((i) => i.id === itemId)
      if (!item) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: `Item "${itemId}" not found` }) }],
          isError: true,
        }
      }
      addToCart(item, quantity)
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ success: true, added: item.name, quantity }) }],
      }
    },
  })

  mc.registerTool({
    name: 'get_cart',
    description: 'Get the current cart contents and total price.',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      const items = getCart().map((i) => ({
        id: i.menuItem.id,
        name: i.menuItem.name,
        price: i.menuItem.price,
        quantity: i.quantity,
        subtotal: i.menuItem.price * i.quantity,
      }))
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ items, total: getTotal() }, null, 2) }],
      }
    },
  })

  return 3
}
