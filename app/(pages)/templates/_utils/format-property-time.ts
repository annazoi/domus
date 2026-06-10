export function formatPropertyTimeLabel(value: string | null | undefined): string {
	if (!value?.trim()) return '';
	const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
	if (!match) return value.trim();
	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
		return value.trim();
	}
	const suffix = hour >= 12 ? 'PM' : 'AM';
	const hour12 = hour % 12 === 0 ? 12 : hour % 12;
	return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}
