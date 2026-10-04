// src/reminder.ts
import { localDateKey, shouldRemind } from "./time";

export interface Clock { now: () => Date }
export interface Timer { setInterval: (cb: () => void, ms: number) => ReturnType<typeof setInterval>; clearInterval: (id: ReturnType<typeof setInterval>) => void }
export interface Notifier { notify: (msg: string) => void }

export const preview = () => "It is after midnight. Consider saving your work and getting some sleep.";

export class Reminder {
  private lastRemindedDate: string | null = null;
  private intervalId: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly clock: Clock,
    private readonly timer: Timer,
    private readonly notifier: Notifier,
  ) {}

  preview(): string {
    return preview();
  }

  check(): void {
    const now = this.clock.now();
    if (shouldRemind(now, this.lastRemindedDate)) {
      // Mark and notify in the same synchronous block so a re-entrant check
      // cannot fire a duplicate for the same local date.
      this.lastRemindedDate = localDateKey(now);
      this.notifier.notify(preview());
    }
  }

  start(): void {
    if (this.isRunning()) return;
    this.check();
    this.intervalId = this.timer.setInterval(() => this.check(), 30000);
  }

  stop(): void {
    if (this.intervalId !== undefined) {
      this.timer.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  isRunning(): boolean {
    return this.intervalId !== undefined;
  }
}