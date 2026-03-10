import { describe, it, expect, vi } from 'vitest';
import { PubSub } from '../pubsub.js';

interface TestEvents {
    change: number;
    message: string;
    reset: undefined;
}

describe('PubSub', () => {
    it('should call subscriber when event is published', () => {
        const bus = new PubSub<TestEvents>();
        const callback = vi.fn();

        bus.subscribe('change', callback);
        bus.publish('change', 42);

        expect(callback).toHaveBeenCalledWith(42);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support multiple subscribers for the same event', () => {
        const bus = new PubSub<TestEvents>();
        const cb1 = vi.fn();
        const cb2 = vi.fn();

        bus.subscribe('change', cb1);
        bus.subscribe('change', cb2);
        bus.publish('change', 10);

        expect(cb1).toHaveBeenCalledWith(10);
        expect(cb2).toHaveBeenCalledWith(10);
    });

    it('should allow unsubscribing', () => {
        const bus = new PubSub<TestEvents>();
        const callback = vi.fn();

        const unsub = bus.subscribe('change', callback);
        bus.publish('change', 1);
        expect(callback).toHaveBeenCalledTimes(1);

        unsub();
        bus.publish('change', 2);
        expect(callback).toHaveBeenCalledTimes(1); // not called again
    });

    it('should not notify subscribers of other events', () => {
        const bus = new PubSub<TestEvents>();
        const changeCb = vi.fn();
        const messageCb = vi.fn();

        bus.subscribe('change', changeCb);
        bus.subscribe('message', messageCb);

        bus.publish('change', 5);

        expect(changeCb).toHaveBeenCalledWith(5);
        expect(messageCb).not.toHaveBeenCalled();
    });

    it('should handle publish with no subscribers gracefully', () => {
        const bus = new PubSub<TestEvents>();
        expect(() => bus.publish('change', 99)).not.toThrow();
    });

    it('should clear all listeners', () => {
        const bus = new PubSub<TestEvents>();
        const cb1 = vi.fn();
        const cb2 = vi.fn();

        bus.subscribe('change', cb1);
        bus.subscribe('message', cb2);

        bus.clear();

        bus.publish('change', 1);
        bus.publish('message', 'hello');

        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
    });
});
