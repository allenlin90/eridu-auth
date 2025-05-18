import { z } from 'zod';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { createUpdateSchema } from "drizzle-zod";

import db from '@/db';
import { member, organization, team } from '@/db/schema';

const MemberSchema = createUpdateSchema(member);
type Member = Omit<z.infer<typeof MemberSchema>, 'id' | 'createdAt'>;

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



export const updateMembership = async (memberId: string, props: Member) => {
  return db
    .update(member)
    .set({ ...props })
    .where(and(eq(member.id, memberId)))
    .returning();
};
