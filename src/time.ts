// src/time.ts
export function localDateKey(now: Date): string {
	// Returns "YYYY-MM-DD" using local components (month is 0-based, so add 1).
	const month = (now.getMonth() + 1).toString().padStart(2, "0");
	const day = now.getDate().toString().padStart(2, "0");
	return `${now.getFullYear()}-${month}-${day}`;
}

export function shouldRemind(now: Date, lastRemindedDate: string | null): boolean {
	// Only remind between 00:00 (inclusive) and 06:00 (exclusive) local time.
	const hour = now.getHours();
	if (hour >= 6) {
		return false;
	}
	// At most one reminder per local calendar date within the session.
	return localDateKey(now) !== lastRemindedDate;
}
