export function hostNameSlugFromFullName(fullName: string): string {
	const s = fullName
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z-]/g, '');
	return s.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function hostNameSlugFromParts(firstName: string, lastName: string): string {
	return hostNameSlugFromFullName(`${firstName} ${lastName}`.trim());
}
