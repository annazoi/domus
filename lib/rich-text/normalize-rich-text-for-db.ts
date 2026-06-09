function richTextHasContent(html: string): boolean {
	const withoutTags = html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return withoutTags.length > 0;
}

export function normalizeRichTextForDb(value: string | null | undefined): string | null {
	if (value == null) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (!richTextHasContent(trimmed)) return null;
	return trimmed;
}
