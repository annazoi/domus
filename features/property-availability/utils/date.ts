import { DateTime } from 'luxon';

export const AVAILABILITY_DATE_FORMAT = 'yyyy-MM-dd';

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
