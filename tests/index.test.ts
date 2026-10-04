import { describe, it, expect, vi } from "vitest";
import extensionFactory from "../src/index";
import { preview } from "../src/reminder";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createFakeClock, createFakeTimer, createFakePi } from "./helpers";

describe("/bedtime-test command", () => {
	it("registers a command named bedtime-test", () => {
		const registerCommand = vi.fn();
		const pi = { registerCommand, on: vi.fn() } as unknown as ExtensionAPI;
		extensionFactory(pi);
		expect(registerCommand).toHaveBeenCalledWith(
			"bedtime-test",
			expect.any(Object),
		);
	});

	it("calls ctx.ui.notify with the preview message when hasUI is true", async () => {
		const registerCommand = vi.fn();
		const pi = { registerCommand, on: vi.fn() } as unknown as ExtensionAPI;
		extensionFactory(pi);

		const notify = vi.fn();
		const ctx = { hasUI: true, ui: { notify } } as any;
		const cmd = registerCommand.mock.calls[0]![1];
		await cmd.handler("", ctx);
		expect(notify).toHaveBeenCalledWith(preview(), "info");
	});

	it("is a no-op when hasUI is false", async () => {
		const registerCommand = vi.fn();
		const pi = { registerCommand, on: vi.fn() } as unknown as ExtensionAPI;
		extensionFactory(pi);

		const notify = vi.fn();
		const ctx = { hasUI: false, ui: { notify } } as any;
		const cmd = registerCommand.mock.calls[0]![1];
		await cmd.handler("", ctx);
		expect(notify).not.toHaveBeenCalled();
	});
});

describe("session lifecycle", () => {
	it("session_start in tui at 02:00 notifies once and starts one interval", async () => {
		const { pi, fire } = createFakePi();
		const { clock } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, activeCount } = createFakeTimer();
		extensionFactory(pi, { clock, timer });

		const notify = vi.fn();
		const ctx = { mode: "tui", hasUI: true, ui: { notify } } as any;
		await fire("session_start", {}, ctx);

		expect(notify).toHaveBeenCalledTimes(1);
		expect(activeCount()).toBe(1);
	});

	it("session_start in print mode does not notify or start an interval", async () => {
		const { pi, fire } = createFakePi();
		const { clock } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, activeCount } = createFakeTimer();
		extensionFactory(pi, { clock, timer });

		const notify = vi.fn();
		const ctx = { mode: "print", hasUI: false, ui: { notify } } as any;
		await fire("session_start", {}, ctx);

		expect(notify).not.toHaveBeenCalled();
		expect(activeCount()).toBe(0);
	});

	it("session_start then session_shutdown leaves no active intervals", async () => {
		const { pi, fire } = createFakePi();
		const { clock } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, activeCount } = createFakeTimer();
		extensionFactory(pi, { clock, timer });

		const notify = vi.fn();
		const ctx = { mode: "tui", hasUI: true, ui: { notify } } as any;
		await fire("session_start", {}, ctx);
		await fire("session_shutdown", {}, ctx);

		expect(activeCount()).toBe(0);
	});

	it("after shutdown, only the new session ctx is notified", async () => {
		const { pi, fire } = createFakePi();
		const { clock, set } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, fire: fireTimer } = createFakeTimer();
		extensionFactory(pi, { clock, timer });

		const notifyA = vi.fn();
		const ctxA = { mode: "tui", hasUI: true, ui: { notify: notifyA } } as any;
		await fire("session_start", {}, ctxA);
		expect(notifyA).toHaveBeenCalledTimes(1);
		await fire("session_shutdown", {}, ctxA);
		const callsAAtShutdown = notifyA.mock.calls.length;

		const notifyB = vi.fn();
		const ctxB = { mode: "tui", hasUI: true, ui: { notify: notifyB } } as any;
		set(new Date(2026, 9, 5, 0, 0));
		await fire("session_start", {}, ctxB);
		expect(notifyB).toHaveBeenCalledTimes(1);

		fireTimer();
		expect(notifyB).toHaveBeenCalledTimes(1);
		expect(notifyA.mock.calls.length).toBe(callsAAtShutdown);
	});

	it("session_start twice without shutdown keeps one interval", async () => {
		const { pi, fire } = createFakePi();
		const { clock } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, activeCount } = createFakeTimer();
		extensionFactory(pi, { clock, timer });

		const notify = vi.fn();
		const ctx = { mode: "tui", hasUI: true, ui: { notify } } as any;
		await fire("session_start", {}, ctx);
		await fire("session_start", {}, ctx);

		expect(activeCount()).toBe(1);
	});

	it("bedtime-test before the automatic check does not suppress the reminder", async () => {
		const { pi, commands, fire } = createFakePi();
		const { clock } = createFakeClock(new Date(2026, 9, 4, 1, 0));
		const { timer, fire: fireTimer } = createFakeTimer();
		extensionFactory(pi, { clock, timer });

		const notify = vi.fn();
		const ctx = { mode: "tui", hasUI: true, ui: { notify } } as any;

		// Preview first: one notification, no state change.
		await commands.get("bedtime-test").handler("", ctx);
		expect(notify).toHaveBeenCalledTimes(1);

		// Automatic session start at 01:00 still reminds: second notification.
		await fire("session_start", {}, ctx);
		expect(notify).toHaveBeenCalledTimes(2);

		// Same date, later check produces no additional automatic notification.
		fireTimer();
		expect(notify).toHaveBeenCalledTimes(2);
	});
});
