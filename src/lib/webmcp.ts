import type { InputSchema } from "@mcp-b/global";
import { z } from "zod";
import { useStore } from "./store";

const getMenuSchema = {
  type: "object" as const,
  properties: {
    category: {
      type: "string" as const,
      enum: ["cheesesteaks", "sides", "drinks"],
      description: "Optional category to filter by",
    },
  },
};

const addToCartSchema = {
  type: "object" as const,
  properties: {
    item_id: { type: "string" as const, description: "Menu item ID" },
    quantity: {
      type: "number" as const,
      description: "Quantity to add (default 1)",
    },
  },
  required: ["item_id"],
};

const getCartSchema = {
  type: "object" as const,
  properties: {},
};

// Zod schemas for parsing and typing in execute
const getMenuParams = z.object({
  category: z.enum(["cheesesteaks", "sides", "drinks"]).optional(),
});

const addToCartParams = z.object({
  item_id: z.string(),
  quantity: z.number().optional(),
});

export async function registerWebMCPTools() {
  const mc = navigator.modelContext;
  if (!mc) throw new Error("navigator.modelContext not available");

  mc.registerTool({
    name: "get_menu",
    description:
      "Get the cheesesteak shop menu. Optionally filter by category: 'cheesesteaks', 'sides', or 'drinks'.",
    inputSchema: getMenuSchema as InputSchema,
    execute: async (params) => {
      const { category } = getMenuParams.parse(params);
      const items = useStore.getState().getMenuByCategory(category);
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(items, null, 2) },
        ],
      };
    },
  });

  mc.registerTool({
    name: "add_to_cart",
    description:
      'Add an item to the cart by menu item ID (e.g. "classic-whiz", "fries"). Quantity defaults to 1.',
    inputSchema: addToCartSchema as InputSchema,
    execute: async (params) => {
      const { item_id, quantity = 1 } = addToCartParams.parse(params);
      const state = useStore.getState();
      const item = state.menu.find((i) => i.id === item_id);
      if (!item) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Item "${item_id}" not found` }),
            },
          ],
          isError: true,
        };
      }
      state.addToCart(item, quantity);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, added: item.name, quantity }),
          },
        ],
      };
    },
  });

  mc.registerTool({
    name: "get_cart",
    description: "Get the current cart contents and total price.",
    inputSchema: getCartSchema as InputSchema,
    execute: async () => {
      const state = useStore.getState();
      const items = state.items.map((i) => ({
        id: i.menuItem.id,
        name: i.menuItem.name,
        price: i.menuItem.price,
        quantity: i.quantity,
        subtotal: i.menuItem.price * i.quantity,
      }));
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ items, total: state.getTotal() }, null, 2),
          },
        ],
      };
    },
  });

  return 3;
}
