import { and, eq, getTableColumns } from 'drizzle-orm';

import db from '@/db';
import { member, organization, team } from '@/db/schema';

export const getUserMemberships = async (userId: string) => {
  return db
    .select({
      ...getTableColumns(member),
      team: {
        ...getTableColumns(team),
      },
      organization: {
        ...getTableColumns(organization),
      }
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .innerJoin(team, eq(member.teamId, team.id))
    .where(and(eq(member.userId, userId)));
};
