// src/time.ts
export function localDateKey(now: Date): string {
	// Stub: returns a wrong key (month zero-indexed, format wrong)
	return `${now.getFullYear()}-${now.getMonth().toString().padStart(2, "0")}-${now.getDate()}`;
}

export function shouldRemind(now: Date, lastRemindedDate: string | null): boolean {
	// Stub: always returns false (incorrectly suppresses all midnights)
	return false;
}
