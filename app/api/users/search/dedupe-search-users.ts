type SearchUserRow = {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
};

function normalizeName(first: string, last: string) {
	return `${first} ${last}`.trim().toLowerCase().replace(/\s+/g, ' ');
}

function matchScore(user: SearchUserRow, query: string) {
	const q = query.toLowerCase();
	const email = user.email.toLowerCase();
	const first = user.first_name.toLowerCase();
	const last = user.last_name.toLowerCase();
	let score = 0;

	if (email === q) score += 100;
	if (email.includes(q)) score += 20 - Math.min(email.indexOf(q), 19);
	if (first.includes(q)) score += 5;
	if (last.includes(q)) score += 5;

	return score;
}

export function dedupeSearchUsers<T extends SearchUserRow>(users: T[], query: string): T[] {
	const bestByName = new Map<string, T>();

	for (const user of users) {
		const key = normalizeName(user.first_name, user.last_name);
		const existing = bestByName.get(key);
		if (!existing || matchScore(user, query) > matchScore(existing, query)) {
			bestByName.set(key, user);
		}
	}

	const seenIds = new Set<string>();
	return Array.from(bestByName.values()).filter((user) => {
		if (seenIds.has(user.id)) return false;
		seenIds.add(user.id);
		return true;
	});
}
