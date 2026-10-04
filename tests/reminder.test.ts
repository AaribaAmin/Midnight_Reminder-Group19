import { describe, it, expect, vi } from "vitest";
import { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Reminder, Clock, Timer, Notifier } from "../src/reminder";
import { localDateKey, shouldRemind } from "../src/time";

describe("Reminder preview", () => {
  it("returns the correct midnight message", () => {
    const now = new Date(2026, 9, 4, 0, 0); // midnight
    const reminder = new Reminder(
      () => new Date(),
      { setInterval: () => {}, clearInterval: () => {} },
      { notify: () => {} }
    );
    expect(reminder.preview()).toBe(
      "It is after midnight. Consider saving your work and getting some sleep."
    );
  });
});