import '@/config/load-env';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as {
	prisma: PrismaClient | undefined;
	prismaConnectionString: string | undefined;
};

function createPrismaClient(connectionString: string) {
	const pool = new Pool({ connectionString });
	const adapter = new PrismaPg(pool);
	return new PrismaClient({ adapter });
}

function getPrismaClient() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL is not set. Add it to .env.local or .env.');
	}

	const cached = globalForPrisma.prisma;
	if (cached && globalForPrisma.prismaConnectionString === connectionString) {
		return cached;
	}

	if (cached) {
		void cached.$disconnect();
	}

	const client = createPrismaClient(connectionString);
	globalForPrisma.prisma = client;
	globalForPrisma.prismaConnectionString = connectionString;
	return client;
}

export const prisma = new Proxy({} as PrismaClient, {
	get(_target, prop) {
		const client = getPrismaClient();
		const value = client[prop as keyof PrismaClient];
		if (typeof value === 'function') {
			return (value as (...args: unknown[]) => unknown).bind(client);
		}
		return value;
	},
});
