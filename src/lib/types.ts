import type { InferSelectModel } from 'drizzle-orm';
import type { users } from '$lib/db/schema';

export { UserRole } from '$lib/constants';

export type User = InferSelectModel<typeof users>;
