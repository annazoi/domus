import { defineConfig } from '@prisma/config';
import { environments } from './config/environments';

const databaseUrl = environments.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set. Add it to .env.local or .env.');
}

export default defineConfig({
	datasource: {
		url: databaseUrl,
	},
});
