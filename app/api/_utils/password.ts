import jwt from 'jsonwebtoken';

import { environments } from '@/config/environments';

const PASSWORD_PAYLOAD_KEY = 'password';

const getJwtSecret = () => {
	const secret = environments.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is not configured');
	}
	return secret;
};

export function hashPassword(password: string): string {
	return jwt.sign({ [PASSWORD_PAYLOAD_KEY]: password }, getJwtSecret());
}

export function verifyPassword(password: string, storedPassword: string): boolean {
	try {
		const decoded = jwt.verify(storedPassword, getJwtSecret()) as Record<string, string>;
		return decoded[PASSWORD_PAYLOAD_KEY] === password;
	} catch {
		return false;
	}
}
