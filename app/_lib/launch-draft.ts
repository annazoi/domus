/** Details captured by the homepage "Launch your stay today" form, carried through sign-up into the new-listing form. */
export type LaunchDraft = {
	fullName: string;
	email: string;
	propertyName: string;
	location: string;
	nightlyRate: string;
};

const STORAGE_KEY = 'hozya:launch-draft';

export function saveLaunchDraft(draft: LaunchDraft) {
	try {
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
	} catch {
		// Storage can be blocked; the flow still works without prefill.
	}
}

export function loadLaunchDraft(): LaunchDraft | null {
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as LaunchDraft) : null;
	} catch {
		return null;
	}
}

export function clearLaunchDraft() {
	try {
		window.sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}

export function slugify(value: string) {
	return value
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function splitFullName(fullName: string) {
	const [first = '', ...rest] = fullName.trim().split(/\s+/);
	return { firstName: first, lastName: rest.join(' ') };
}
