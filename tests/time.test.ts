import { describe, it, expect } from "vitest";
import { localDateKey, shouldRemind } from "../src/time";

describe("localDateKey", () => {
	it("returns a date key from local components", () => {
		const now = new Date(2026, 9, 3); // 2026-10-03
		expect(localDateKey(now)).toBe("2026-10-03");
	});
});

describe("shouldRemind", () => {
	it("returns false at 23:59 with no prior reminder", () => {
		const now = new Date(2026, 9, 3, 23, 59);
		expect(shouldRemind(now, null)).toBe(false);
	});

	it("returns true at 00:00 with no prior reminder", () => {
		const now = new Date(2026, 9, 4, 0, 0);
		expect(shouldRemind(now, null)).toBe(true);
	});

	it("returns false at 00:01 when already reminded today", () => {
		const now = new Date(2026, 9, 4, 0, 1);
		expect(shouldRemind(now, "2026-10-04")).toBe(false);
	});

	it("returns true at 05:59 when not reminded today", () => {
		const now = new Date(2026, 9, 4, 5, 59);
		expect(shouldRemind(now, null)).toBe(true);
	});

	it("returns false at 06:00", () => {
		const now = new Date(2026, 9, 4, 6, 0);
		expect(shouldRemind(now, null)).toBe(false);
	});

	it("returns false at 12:00", () => {
		const now = new Date(2026, 9, 4, 12, 0);
		expect(shouldRemind(now, null)).toBe(false);
	});

	it("returns true at 00:00 on next date after reminding yesterday", () => {
		const now = new Date(2026, 9, 5, 0, 0);
		expect(shouldRemind(now, "2026-10-04")).toBe(true);
	});
});