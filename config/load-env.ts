/**
 * Side-effect module: must be imported before `./environments` when running
 * outside Next.js (e.g. Prisma CLI), so `process.env` is populated first.
 */
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });
dotenv.config({ path: join(process.cwd(), '.env') });
