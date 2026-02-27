import type { InputSchema } from "@mcp-b/global";
import { z } from "zod";
import { pushDataLayerEvent, pushEcommerceEvent, buildRouteParams, buildFlightItemParams } from "./analytics";
import { grantConsent, denyConsent, getConsentState } from "./consent";
import { useStore } from "./store";
import { getSeatLayout, findBestSeat, findSeatByLabel } from "./seats";

const searchFlightsSchema = {
  type: "object" as const,
  properties: {
    from: {
      type: "string" as const,
      description: "Departure airport code or city (e.g. 'JFK' or 'New York')",
    },
    to: {
      type: "string" as const,
      description: "Arrival airport code or city (e.g. 'LAX' or 'Los Angeles')",
    },
  },
};

const addToBookingSchema = {
  type: "object" as const,
  properties: {
    flight_id: {
      type: "string" as const,
      description: "Flight ID (e.g. 'AA101')",
    },
    class_id: {
      type: "string" as const,
      description: "Class ID (e.g. 'AA101-ECO', 'AA101-BIZ', 'AA101-FIRST')",
    },
    passengers: {
      type: "number" as const,
      description: "Number of passengers (default 1)",
    },
  },
  required: ["flight_id", "class_id"],
};

const getBookingSchema = {
  type: "object" as const,
  properties: {},
};

const searchFlightsParams = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

const addToBookingParams = z.object({
  flight_id: z.string(),
  class_id: z.string(),
  passengers: z.number().optional(),
});

export async function registerWebMCPTools() {
  const mc = navigator.modelContext;
  if (!mc) throw new Error("navigator.modelContext not available");

  mc.registerTool({
    name: "search_flights",
    description:
      "Search for available Air Agentic flights. Optionally filter by departure (from) and arrival (to) airport code or city. Returns available flights with their booking classes and prices.",
    inputSchema: searchFlightsSchema as InputSchema,
    execute: async (params) => {
      const { from, to } = searchFlightsParams.parse(params);
      const state = useStore.getState();
      const results = state.searchFlights(from, to);

      // Expand search results on the page and record agent activity
      state.setHasSearched(true);
      state.setLastSearch({ from, to, passengers: 1 });
      state.addAgentActivity({
        tool: "search_flights",
        message: "Agent searched for flights",
        detail: `${from?.toUpperCase() ?? "Any"} → ${to?.toUpperCase() ?? "Any"} · ${results.length} flight${results.length !== 1 ? "s" : ""} found`,
      });

      pushDataLayerEvent("search", {
        search_term: [from, to].filter(Boolean).join(" → ") || "any",
        ...(from !== undefined && { from }),
        ...(to !== undefined && { to }),
        ...buildRouteParams(from, to),
        results_count: results.length,
        pax: 1,
        adult: 1,
        infant: 0,
        interaction_source: "agent",
      });
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(results, null, 2) },
        ],
      };
    },
  });

  mc.registerTool({
    name: "add_to_booking",
    description:
      "Add a flight class to the current booking by flight ID and class ID. Use search_flights first to discover available flight and class IDs.",
    inputSchema: addToBookingSchema as InputSchema,
    execute: async (params) => {
      const { flight_id, class_id, passengers = 1 } =
        addToBookingParams.parse(params);
      const state = useStore.getState();
      const flight = state.flights.find((f) => f.id === flight_id);
      if (!flight) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Flight "${flight_id}" not found` }),
            },
          ],
          isError: true,
        };
      }
      const flightClass = flight.classes.find((c) => c.id === class_id);
      if (!flightClass) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: `Class "${class_id}" not found on flight "${flight_id}"`,
                available_classes: flight.classes.map((c) => c.id),
              }),
            },
          ],
          isError: true,
        };
      }

      // Add to booking (marked as agent-added) and show on page
      state.setHasSearched(true);
      state.addToBooking(flight_id, class_id, passengers, true);
      state.addAgentActivity({
        tool: "add_to_booking",
        message: "Agent added flight to booking",
        detail: `${flight.fromCode} → ${flight.toCode} · ${flightClass.name} · $${flightClass.price.toLocaleString()} · ${passengers} pax`,
      });

      pushEcommerceEvent(
        "add_to_cart",
        {
          currency: "USD",
          value: flightClass.price * passengers,
          items: [
            {
              item_id: class_id,
              item_name: `${flight.fromCode} → ${flight.toCode} · ${flightClass.name}`,
              item_brand: "Air Agentic",
              item_category: flightClass.name,
              price: flightClass.price,
              quantity: passengers,
              ...buildFlightItemParams({
                flightId: flight.id,
                departure: flight.departure,
                arrival: flight.arrival,
                passengers,
                className: flightClass.name,
              }),
            },
          ],
        },
        {
          interaction_source: "agent",
          ...buildRouteParams(flight.fromCode, flight.toCode),
        }
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              added: {
                flight: `${flight.fromCode} → ${flight.toCode}`,
                class: flightClass.name,
                price: flightClass.price,
                passengers,
                total: flightClass.price * passengers,
              },
            }),
          },
        ],
      };
    },
  });

  mc.registerTool({
    name: "get_booking",
    description:
      "Get the current booking summary including all selected flights, classes, and the total price.",
    inputSchema: getBookingSchema as InputSchema,
    execute: async () => {
      const state = useStore.getState();
      const summary = state.items.map((i) => ({
        flight_id: i.flight.id,
        route: `${i.flight.fromCode} → ${i.flight.toCode}`,
        departure: i.flight.departure,
        arrival: i.flight.arrival,
        class: i.flightClass.name,
        class_id: i.flightClass.id,
        price_per_passenger: i.flightClass.price,
        passengers: i.passengers,
        subtotal: i.flightClass.price * i.passengers,
      }));

      state.addAgentActivity({
        tool: "get_booking",
        message: "Agent reviewed booking",
        detail:
          state.getItemCount() === 0
            ? "Booking is empty"
            : `${state.getItemCount()} item${state.getItemCount() !== 1 ? "s" : ""} · Total $${state.getTotal().toLocaleString()}`,
      });

      const firstItem = state.items[0]
      pushEcommerceEvent(
        "view_cart",
        {
          currency: "USD",
          value: state.getTotal(),
          items: state.items.map((i) => ({
            item_id: i.flightClass.id,
            item_name: `${i.flight.fromCode} → ${i.flight.toCode} · ${i.flightClass.name}`,
            item_brand: "Air Agentic",
            item_category: i.flightClass.name,
            price: i.flightClass.price,
            quantity: i.passengers,
            ...buildFlightItemParams({
              flightId: i.flight.id,
              departure: i.flight.departure,
              arrival: i.flight.arrival,
              passengers: i.passengers,
              className: i.flightClass.name,
            }),
          })),
        },
        {
          interaction_source: "agent",
          ...(firstItem ? buildRouteParams(firstItem.flight.fromCode, firstItem.flight.toCode) : {}),
        }
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { items: summary, total: state.getTotal() },
              null,
              2
            ),
          },
        ],
      };
    },
  });

  const checkoutSchema = {
    type: "object" as const,
    properties: {
      passenger_name: {
        type: "string" as const,
        description: "Passenger full name",
      },
      email: {
        type: "string" as const,
        description: "Passenger contact email",
      },
      card_number: {
        type: "string" as const,
        description: "Credit/debit card number (digits only, e.g. '4111111111111111'). Use dummy values for demos.",
      },
      expiry: {
        type: "string" as const,
        description: "Card expiry date in MM/YY format (e.g. '12/28')",
      },
      cvv: {
        type: "string" as const,
        description: "Card CVV (3-4 digits, e.g. '123')",
      },
    },
  };

  const checkoutParams = z.object({
    passenger_name: z.string().optional(),
    email: z.string().optional(),
    card_number: z.string().optional(),
    expiry: z.string().optional(),
    cvv: z.string().optional(),
  });

  mc.registerTool({
    name: "checkout",
    description:
      "Open the checkout form and optionally complete the booking end-to-end. If all fields (passenger_name, email, card_number, expiry, cvv) are provided, the form is filled and submitted automatically. If only some fields are provided, the form opens pre-filled for the user to complete. Use dummy card values for demos (e.g. card_number: '4111111111111111', expiry: '12/28', cvv: '123').",
    inputSchema: checkoutSchema as InputSchema,
    execute: async (params) => {
      const { passenger_name, email, card_number, expiry, cvv } = checkoutParams.parse(params);
      const state = useStore.getState();

      if (state.items.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: "No flights in booking. Add a flight first." }),
            },
          ],
          isError: true,
        };
      }

      const allProvided = !!(passenger_name && email && card_number && expiry && cvv);

      // Format card number with spaces for display
      const formattedCard = card_number
        ? card_number.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim()
        : undefined;

      state.setCheckoutPrefill({
        name: passenger_name,
        email,
        card: formattedCard,
        expiry,
        cvv,
        autoSubmit: allProvided,
      });
      state.setCheckoutOpen(true);
      state.addAgentActivity({
        tool: "checkout",
        message: allProvided ? "Agent is completing payment" : "Agent opened checkout",
        detail: allProvided
          ? `${passenger_name} · $${state.getTotal().toLocaleString()} · submitting…`
          : `Pre-filled ${[passenger_name, email].filter(Boolean).join(", ")}`,
      });

      const checkoutFirstItem = state.items[0]
      pushEcommerceEvent(
        "begin_checkout",
        {
          currency: "USD",
          value: state.getTotal(),
          items: state.items.map((i) => ({
            item_id: i.flightClass.id,
            item_name: `${i.flight.fromCode} → ${i.flight.toCode} · ${i.flightClass.name}`,
            item_brand: "Air Agentic",
            item_category: i.flightClass.name,
            price: i.flightClass.price,
            quantity: i.passengers,
            ...buildFlightItemParams({
              flightId: i.flight.id,
              departure: i.flight.departure,
              arrival: i.flight.arrival,
              passengers: i.passengers,
              className: i.flightClass.name,
            }),
          })),
        },
        {
          interaction_source: "agent",
          ...(checkoutFirstItem ? buildRouteParams(checkoutFirstItem.flight.fromCode, checkoutFirstItem.flight.toCode) : {}),
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              message: allProvided
                ? "All fields pre-filled in the checkout form. User just needs to click Pay to confirm."
                : "Checkout form opened with available fields pre-filled. User will complete the rest.",
              booking_total: state.getTotal(),
            }),
          },
        ],
      };
    },
  });

  const selectSeatSchema = {
    type: "object" as const,
    properties: {
      class_id: {
        type: "string" as const,
        description: "Class ID to select a seat for (e.g. 'AA101-BIZ'). The flight will be added to the booking automatically if not already.",
      },
      seat: {
        type: "string" as const,
        description: "Specific seat label (e.g. '3A', '22F'). If omitted, the best seat matching the preference is chosen.",
      },
      preference: {
        type: "string" as const,
        enum: ["window", "aisle", "middle"],
        description: "Seat type preference. Used when no specific seat label is given.",
      },
    },
    required: ["class_id"],
  };

  const selectSeatParams = z.object({
    class_id: z.string(),
    seat: z.string().optional(),
    preference: z.enum(["window", "aisle", "middle"]).optional(),
  });

  mc.registerTool({
    name: "select_seat",
    description:
      "Select a seat for a booked flight class. Provide a specific seat label (e.g. '3A') or a preference ('window', 'aisle', 'middle') and the best available seat is picked automatically. If the flight class is not yet in the booking, it will be added first.",
    inputSchema: selectSeatSchema as InputSchema,
    execute: async (params) => {
      const { class_id, seat: seatLabel, preference } = selectSeatParams.parse(params);
      const state = useStore.getState();

      // Find the flight + class
      const flight = state.flights.find((f) => f.classes.some((c) => c.id === class_id));
      if (!flight) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: `Class "${class_id}" not found` }) }],
          isError: true,
        };
      }
      const flightClass = flight.classes.find((c) => c.id === class_id)!;

      // Build seat layout and find the right seat
      const { rows } = getSeatLayout(flightClass.name);
      let selected = null;
      if (seatLabel) {
        selected = findSeatByLabel(rows, seatLabel);
        if (!selected) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: `Seat "${seatLabel}" not found or is occupied` }) }],
            isError: true,
          };
        }
      } else {
        selected = findBestSeat(rows, preference ?? "window");
        if (!selected) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "No available seats matching preference" }) }],
            isError: true,
          };
        }
      }

      // Add to booking if needed, then set seat; also expand seat map in UI
      state.setHasSearched(true);
      if (!state.items.some((i) => i.flightClass.id === class_id)) {
        state.addToBooking(flight.id, class_id, 1, true, selected);
      } else {
        state.selectSeat(class_id, selected);
      }
      state.setSeatMapOpen(class_id);
      state.addAgentActivity({
        tool: "select_seat",
        message: "Agent selected a seat",
        detail: `Seat ${selected.label} · ${selected.type} · ${flight.fromCode} → ${flight.toCode} ${flightClass.name}`,
      });

      pushDataLayerEvent("seat_selected", {
        seat_label: selected.label,
        seat_type: selected.type,
        class_id,
        flight_id: flight.id,
        departure_time: flight.departure,
        arrival_time: flight.arrival,
        preference: preference ?? null,
        ...buildRouteParams(flight.fromCode, flight.toCode),
        interaction_source: "agent",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              seat: {
                label: selected.label,
                type: selected.type,
                row: selected.row,
                col: selected.col,
                flight: `${flight.fromCode} → ${flight.toCode}`,
                class: flightClass.name,
              },
            }),
          },
        ],
      };
    },
  });

  // --- Consent tools ---
  // Two tools form the consent workflow. The agent must always call
  // consent_check first; its response embeds the exact next step to take.

  mc.registerTool({
    name: "get_consent",
    description:
      "Returns the current analytics consent state for this session. " +
      "Call this ONCE at the start of every session before taking any other action. " +
      "The response tells you exactly what to do next.",
    inputSchema: { type: "object" as const, properties: {} } as InputSchema,
    execute: async () => {
      const consentState = getConsentState();
      const instructions: Record<string, string> = {
        granted:
          "Consent already granted. Proceed with all actions normally — no consent prompt needed.",
        denied:
          "The user has previously declined analytics tracking. Do not ask for consent again. Proceed with all actions normally.",
        pending:
          "Consent has not been decided yet. Before doing anything else, ask the user: " +
          '"This site collects anonymous analytics (searches, seat selections, bookings) ' +
          'to improve the service. No personal data is shared. Do you agree to analytics tracking?" ' +
          'Then call ask_consent with decision="granted" if they agree, or decision="denied" if they decline or are unsure.',
      };
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              consent_state: consentState,
              next_step: instructions[consentState],
            }),
          },
        ],
      };
    },
  });

  mc.registerTool({
    name: "ask_consent",
    description:
      "Records the user's analytics consent decision for this session. " +
      "Only call this after get_consent returned 'pending' and you have asked the user. " +
      "Pass decision='granted' if the user agreed, or decision='denied' if they declined or were unsure. " +
      "Never call this without first asking the user explicitly.",
    inputSchema: {
      type: "object" as const,
      properties: {
        decision: {
          type: "string" as const,
          enum: ["granted", "denied"],
          description: "The user's consent decision: 'granted' or 'denied'.",
        },
      },
      required: ["decision"],
    } as InputSchema,
    execute: async (params) => {
      const { decision } = params as { decision: "granted" | "denied" };
      const consentState = getConsentState();

      if (consentState !== "pending") {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: false,
                message: `Consent is already set to '${consentState}'. No action taken.`,
              }),
            },
          ],
        };
      }

      if (decision === "granted") {
        grantConsent();
        useStore.getState().addAgentActivity({
          tool: "ask_consent",
          message: "Analytics consent granted",
          detail: "Buffered events flushed to GA4",
        });
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                message:
                  "Consent granted. Buffered events sent to GA4; future events will be tracked.",
              }),
            },
          ],
        };
      } else {
        denyConsent();
        useStore.getState().addAgentActivity({
          tool: "ask_consent",
          message: "Analytics consent denied",
          detail: "No data will be sent to GA4",
        });
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                message:
                  "Consent denied. No analytics data will be collected. Do not ask again.",
              }),
            },
          ],
        };
      }
    },
  });

  return 7;
}
