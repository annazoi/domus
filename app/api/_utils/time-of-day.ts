import { DateTime } from 'luxon';

export function parseTimeToUtcDate(raw: string | undefined, fallback: string): Date {
	const parseTime = (value: string) => {
		const exact = DateTime.fromFormat(value, 'H:mm', { zone: 'utc' });
		if (exact.isValid) return exact;
		const twelveHour = DateTime.fromFormat(value, 'h:mm a', { zone: 'utc', locale: 'en' });
		if (twelveHour.isValid) return twelveHour;
		return null;
	};

	const source = raw?.trim() || fallback;
	const parsed = parseTime(source) ?? parseTime(fallback) ?? DateTime.fromObject({ hour: 15, minute: 0 }, { zone: 'utc' });

	return DateTime.utc(1970, 1, 1, parsed.hour, parsed.minute, 0, 0).toJSDate();
}

export function formatUtcTimeOfDay(d: Date): string {
	return DateTime.fromJSDate(d, { zone: 'utc' }).toFormat('HH:mm');
}
