import { describe, it, expect, vi } from "vitest";
import { Reminder, preview } from "../src/reminder";
import { createFakeClock, createFakeTimer } from "./helpers";

describe("Reminder preview", () => {
	it("returns the correct midnight message", () => {
		const { clock } = createFakeClock(new Date(2026, 9, 4, 0, 0));
		const { timer } = createFakeTimer();
		const reminder = new Reminder(clock, timer, { notify: () => {} });
		expect(reminder.preview()).toBe(preview());
	});
});

describe("Reminder automatic checks", () => {
	it("start() at 02:00 notifies immediately without firing the timer", () => {
		const { clock } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, fire } = createFakeTimer();
		const notify = vi.fn();
		const reminder = new Reminder(clock, timer, { notify });

		reminder.start();
		expect(notify).toHaveBeenCalledTimes(1);

		fire();
		expect(notify).toHaveBeenCalledTimes(1);
	});

	it("start() at 23:00 then clock jumps to 02:00 next date and timer fires → one", () => {
		const { clock, set } = createFakeClock(new Date(2026, 9, 3, 23, 0));
		const { timer, fire } = createFakeTimer();
		const notify = vi.fn();
		const reminder = new Reminder(clock, timer, { notify });

		reminder.start();
		expect(notify).toHaveBeenCalledTimes(0);

		set(new Date(2026, 9, 4, 2, 0));
		fire();
		expect(notify).toHaveBeenCalledTimes(1);
	});

	it("start() at 23:00 then clock jumps to 07:00 and timer fires → zero", () => {
		const { clock, set } = createFakeClock(new Date(2026, 9, 3, 23, 0));
		const { timer, fire } = createFakeTimer();
		const notify = vi.fn();
		const reminder = new Reminder(clock, timer, { notify });

		reminder.start();
		set(new Date(2026, 9, 4, 7, 0));
		fire();
		expect(notify).toHaveBeenCalledTimes(0);
	});

	it("start() at 05:59 notifies once; 06:01 fire adds nothing", () => {
		const { clock, set } = createFakeClock(new Date(2026, 9, 4, 5, 59));
		const { timer, fire } = createFakeTimer();
		const notify = vi.fn();
		const reminder = new Reminder(clock, timer, { notify });

		reminder.start();
		expect(notify).toHaveBeenCalledTimes(1);

		set(new Date(2026, 9, 4, 6, 1));
		fire();
		expect(notify).toHaveBeenCalledTimes(1);
	});

	it("start() at 02:00; fires at 02:00:30 and 02:01 stay at one", () => {
		const { clock, set } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, fire } = createFakeTimer();
		const notify = vi.fn();
		const reminder = new Reminder(clock, timer, { notify });

		reminder.start();
		expect(notify).toHaveBeenCalledTimes(1);

		set(new Date(2026, 9, 4, 2, 0, 30));
		fire();
		expect(notify).toHaveBeenCalledTimes(1);

		set(new Date(2026, 9, 4, 2, 1));
		fire();
		expect(notify).toHaveBeenCalledTimes(1);
	});

	it("start() at 02:00 Oct 4 → one; 00:00 Oct 5 fire → two", () => {
		const { clock, set } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, fire } = createFakeTimer();
		const notify = vi.fn();
		const reminder = new Reminder(clock, timer, { notify });

		reminder.start();
		expect(notify).toHaveBeenCalledTimes(1);

		set(new Date(2026, 9, 5, 0, 0));
		fire();
		expect(notify).toHaveBeenCalledTimes(2);
	});

	it("start() called twice → only one active interval", () => {
		const { clock } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, activeCount } = createFakeTimer();
		const reminder = new Reminder(clock, timer, { notify: vi.fn() });

		reminder.start();
		reminder.start();
		expect(activeCount()).toBe(1);
	});

	it("start() then stop() clears intervals and firing does nothing", () => {
		const { clock } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, fire, activeCount } = createFakeTimer();
		const notify = vi.fn();
		const reminder = new Reminder(clock, timer, { notify });

		reminder.start();
		expect(activeCount()).toBe(1);
		const afterStart = notify.mock.calls.length;

		reminder.stop();
		expect(activeCount()).toBe(0);

		fire();
		expect(notify.mock.calls.length).toBe(afterStart);
	});

	it("uses a 30000 ms interval", () => {
		const { clock } = createFakeClock(new Date(2026, 9, 4, 2, 0));
		const { timer, intervalMs } = createFakeTimer();
		const reminder = new Reminder(clock, timer, { notify: vi.fn() });

		reminder.start();
		expect(intervalMs()).toBe(30000);
	});
});
