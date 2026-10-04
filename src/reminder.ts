// src/reminder.ts - stub for stage (c)
export interface Clock { now: () => Date }
export interface Timer { setInterval: (cb: () => void, ms: number) => ReturnType<typeof setInterval>; clearInterval: (id: ReturnType<typeof setInterval>) => void }
export interface Notifier { notify: (msg: string) => void }

export const preview = () => "It is after midnight. Consider saving your work and getting some sleep.";

export class Reminder {
  constructor(clock: Clock, timer: Timer, notifier: Notifier) {}
  preview(): string { return preview(); }
  check(): void {}
  start(): void {}
  stop(): void {}
  isRunning(): boolean { return false }
}