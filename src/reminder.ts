// src/reminder.ts - stub for stage (c)
export interface Clock { now: () => Date }
export interface Timer { setInterval: (cb: () => void) => ReturnType<typeof setInterval>; clearInterval: (id: ReturnType<typeof setInterval>) => void }
export interface Notifier { notify: (msg: string) => void }

export class Reminder {
  constructor(clock: Clock, timer: Timer, notifier: Notifier) {}
  preview(): string { return "It is after midnight. Consider saving your work and getting some sleep."; }
  check(): void {}
  start(): void {}
  stop(): void {}
  isRunning(): boolean { return false }
}