import { vi } from "vitest";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { Clock, Timer } from "../src/reminder";

/** Mutable fake clock; tests control the current Date directly. */
export function createFakeClock(initial: Date) {
	let current = initial;
	return {
		clock: { now: () => current } as Clock,
		set: (d: Date) => {
			current = d;
		},
		advanceMs: (ms: number) => {
			current = new Date(current.getTime() + ms);
		},
	};
}

/** Fake timer that records active intervals and lets a test fire them manually. */
export function createFakeTimer() {
	let nextId = 1;
	const intervals = new Map<number, { cb: () => void; ms: number }>();
	const timer: Timer = {
		setInterval: (cb: () => void, ms: number) => {
			const id = nextId++;
			intervals.set(id, { cb, ms });
			return id as unknown as ReturnType<typeof setInterval>;
		},
		clearInterval: (id: ReturnType<typeof setInterval>) => {
			intervals.delete(id as unknown as number);
		},
	};
	return {
		timer,
		fire: () => {
			for (const { cb } of Array.from(intervals.values())) cb();
		},
		activeCount: () => intervals.size,
		intervalMs: () => {
			const vals = Array.from(intervals.values());
			return vals.length > 0 ? vals[0].ms : undefined;
		},
	};
}

/** Fake ExtensionAPI that captures pi.on handlers and registered commands. */
export function createFakePi() {
	const handlers = new Map<string, Array<(...args: any[]) => any>>();
	const commands = new Map<string, any>();
	const pi = {
		on: vi.fn((event: string, handler: (...args: any[]) => any) => {
			const list = handlers.get(event) ?? [];
			list.push(handler);
			handlers.set(event, list);
		}),
		registerCommand: vi.fn((name: string, opts: any) => {
			commands.set(name, opts);
		}),
	} as unknown as ExtensionAPI;

	return {
		pi,
		commands,
		fire: async (event: string, ...args: any[]) => {
			for (const h of handlers.get(event) ?? []) await h(...args);
		},
		handlerCount: (event: string) => (handlers.get(event) ?? []).length,
	};
}
