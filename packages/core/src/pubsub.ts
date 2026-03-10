/**
 * Lightweight generic PubSub (event emitter).
 *
 * Usage:
 *   const bus = new PubSub<{ change: number; reset: void }>();
 *   const unsub = bus.subscribe('change', (n) => console.log(n));
 *   bus.publish('change', 42);
 *   unsub();
 */
export class PubSub<EventMap extends Record<string, any>> {
    private listeners = new Map<
        keyof EventMap,
        Set<(data: any) => void>
    >();

    /**
     * Subscribe to an event. Returns an unsubscribe function.
     */
    subscribe<K extends keyof EventMap>(
        event: K,
        callback: (data: EventMap[K]) => void,
    ): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        const cbs = this.listeners.get(event)!;
        cbs.add(callback);

        return () => {
            cbs.delete(callback);
            if (cbs.size === 0) {
                this.listeners.delete(event);
            }
        };
    }

    /**
     * Publish an event to all subscribers.
     */
    publish<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
        const cbs = this.listeners.get(event);
        if (!cbs) return;
        for (const cb of cbs) {
            cb(data);
        }
    }

    /**
     * Remove all listeners (useful for teardown).
     */
    clear(): void {
        this.listeners.clear();
    }
}
