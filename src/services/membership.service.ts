import { and, eq, getTableColumns } from 'drizzle-orm';

import db from '@/db';
import { member, organization } from '@/db/schema';

export const getUserMemberships = async (userId: string) => {
  return db
    .select({
      ...getTableColumns(member),
      organization: {
        ...getTableColumns(organization),
      }
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(and(eq(member.userId, userId)));
};
