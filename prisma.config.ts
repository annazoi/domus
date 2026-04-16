import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { environments } from './config/environments';

dotenv.config({ path: join(process.cwd(), '.env.local') });
dotenv.config({ path: join(process.cwd(), '.env') });

const databaseUrl = environments.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set. Add it to .env.local or .env.');
}

export default defineConfig({
	datasource: {
		url: databaseUrl,
	},
});
