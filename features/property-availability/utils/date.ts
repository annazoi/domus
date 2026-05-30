import { DateTime } from 'luxon';

export const AVAILABILITY_DATE_FORMAT = 'yyyy-MM-dd';

const DISPLAY_DATE_LOCALE = 'en-US';

export const formatDisplayDate = (value: string) => {
	if (!value) return '-';
	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString(DISPLAY_DATE_LOCALE, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

export const formatEuropeanDate = (value: string) => {
	if (!value) return '-';
	const parsed = toUtcDay(value);
	if (!parsed.isValid) return value;
	return parsed.toFormat('dd/MM/yyyy');
};

export const formatEuropeanDateRange = (start: string, end: string) =>
	`${formatEuropeanDate(start)} – ${formatEuropeanDate(end)}`;

export const toUtcDay = (value: string | DateTime) => {
	if (typeof value === 'string') {
		return DateTime.fromISO(value, { zone: 'utc' }).startOf('day');
	}

	return value.toUTC().startOf('day');
};

export const toApiDate = (value: string | DateTime) => toUtcDay(value).toFormat(AVAILABILITY_DATE_FORMAT);

export const eachDayInRange = (start: string | DateTime, endExclusive: string | DateTime) => {
	const startDay = toUtcDay(start);
	const endDay = toUtcDay(endExclusive);

	const result: DateTime[] = [];
	for (let cursor = startDay; cursor < endDay; cursor = cursor.plus({ days: 1 })) {
		result.push(cursor);
	}

	return result;
};
