import { connectDb } from '@shared/connectDb';

import { auth } from '@webapp/auth';
import { logger } from '../logger';

// Define the shape of the options tRPC passes in
interface CreateContextOptions {
  req?: Request;
}

export async function createTRPCContext(opts?: CreateContextOptions) {
  const session = await auth();
  await connectDb(logger);
  return { req: opts?.req, session };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
