declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushDataLayerEvent(
  eventName: string,
  payload: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !window.dataLayer) return;
  window.dataLayer.push({ event: eventName, ...payload });
}
