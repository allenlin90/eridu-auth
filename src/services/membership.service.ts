import { and, eq, getTableColumns } from 'drizzle-orm';

import db from '@/db';
import { member } from '@/db/schema';

export const getUserMemberships = async (userId: string) => {
  return db
    .select({ ...getTableColumns(member) })
    .from(member)
    .where(and(eq(member.userId, userId)));
};
