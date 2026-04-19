/** Persist time-of-day as UTC on 1970-01-01 for stable HH:mm round-trips. */
export function parseTimeToUtcDate(raw: string | undefined, fallback: string): Date {
	const trimmed = raw?.trim();
	const base = trimmed && /^\d{1,2}:\d{2}/.test(trimmed) ? trimmed : fallback;
	const m = base.match(/^(\d{1,2}):(\d{2})/);
	if (!m) return new Date(Date.UTC(1970, 0, 1, 15, 0, 0, 0));
	const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
	const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
	return new Date(Date.UTC(1970, 0, 1, h, min, 0, 0));
}

export function formatUtcTimeOfDay(d: Date): string {
	return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}
